/**
 * Calixo Platform - Generic Dashboard Layout Registry
 *
 * The reusable engine behind every module's "dashboard builder": register/
 * list/lookup plus create, clone, rename, remove, favourite, set-default,
 * share, save-as-template, and reset-to-template. Each module instantiates
 * its own `new DashboardLayoutRegistry<TWidgetKey>()` with its own
 * widget-key union and default widget set — the registry itself has no
 * knowledge of what a "widget" means for that module.
 *
 * Round 23: added real organization/workspace/user resolution
 * (`resolveActiveLayout`, `listForActor`), copy-on-write personalization
 * (`materializeUserLayout` — editing a shared template forks it into a
 * real per-user layout instead of mutating the shared original), spatial
 * widget instance CRUD (`addWidget`/`removeWidget`/`duplicateWidget`/
 * `resetWidgetPosition`), and optional disk persistence via an injected
 * `persistence` adapter — previously this registry was pure in-memory
 * and, in practice, only ever instantiated inside a `"use client"`
 * module, meaning its entire state lived in one browser tab and was lost
 * on every page refresh.
 *
 * Persistence is dependency-injected, not imported directly: this class
 * has zero Node/`fs` dependency of its own, so it stays safely importable
 * from anywhere (including client bundles that only need the plain
 * in-memory CRUD, e.g. for tests). Only the concrete, `"server-only"`-
 * tagged singleton files (`core/dashboard/layouts/DashboardLayoutRegistry.ts`,
 * `core/analytics/dashboards/AnalyticsDashboardRegistry.ts`) construct and
 * pass in a real disk-backed adapter (see `persistence.ts`).
 */

import { generateId } from "@/shared/utils/string";
import type { DashboardLayout, DashboardLayoutActor, DashboardLayoutScope, DashboardLayoutTemplateVisibility, DashboardWidgetConfig } from "./types";

export interface DashboardLayoutPersistenceAdapter<TKey extends string> {
  load(): DashboardLayout<TKey>[] | undefined;
  save(layouts: DashboardLayout<TKey>[]): Promise<void>;
}

export class DashboardLayoutRegistry<TKey extends string = string> {
  private layouts: Map<string, DashboardLayout<TKey>> = new Map();
  private templateSnapshots: Map<string, DashboardWidgetConfig<TKey>[]> = new Map();
  private hydrated = false;

  constructor(
    private defaultWidgetSet: () => DashboardWidgetConfig<TKey>[],
    private persistence?: DashboardLayoutPersistenceAdapter<TKey>
  ) {
    this.hydrate();
  }

  /** Loads any previously-persisted layouts from disk exactly once, before the module's seed function registers its built-in templates (`register`/`registerMany` are no-ops for ids already present from disk, so seeding never clobbers a user's saved customizations). */
  private hydrate(): void {
    if (this.hydrated || !this.persistence) return;
    this.hydrated = true;
    const saved = this.persistence.load();
    if (!saved) return;
    for (const layout of saved) {
      this.layouts.set(layout.id, layout);
      if (layout.isTemplate) this.templateSnapshots.set(layout.id, layout.widgets.map(w => ({ ...w, layout: { ...w.layout } })));
    }
  }

  private persist(): void {
    if (!this.persistence) return;
    void this.persistence.save(this.list());
  }

  /** Awaits the in-flight disk write, if any — Server Actions call this before returning so the client's "saved" confirmation reflects real durability, not just an in-memory mutation. */
  async flush(): Promise<void> {
    if (!this.persistence) return;
    await this.persistence.save(this.list());
  }

  register(layout: DashboardLayout<TKey>): void {
    if (this.layouts.has(layout.id)) return;
    this.layouts.set(layout.id, layout);
    if (layout.isTemplate) {
      this.templateSnapshots.set(layout.id, layout.widgets.map(w => ({ ...w, layout: { ...w.layout } })));
    }
    this.persist();
  }

  registerMany(layouts: DashboardLayout<TKey>[]): void {
    for (const layout of layouts) this.register(layout);
  }

  lookup(id: string): DashboardLayout<TKey> | undefined {
    return this.layouts.get(id);
  }

  /** @deprecated prefer `listForActor` — kept only for the few read paths (e.g. counting templates) that don't need tenant filtering. */
  list(): DashboardLayout<TKey>[] {
    return Array.from(this.layouts.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  private isVisibleToActor(layout: DashboardLayout<TKey>, actor: DashboardLayoutActor): boolean {
    if (layout.scope === "system") return true;
    if (layout.organizationId !== actor.organizationId) return false;
    if (layout.scope === "user") return layout.owner === actor.userId || layout.sharedWith.includes(actor.userId);
    if (layout.scope === "workspace") return !layout.workspaceId || !actor.workspaceId || layout.workspaceId === actor.workspaceId || layout.sharedWith.includes(actor.userId);
    if (layout.scope === "organization") return true;
    return false;
  }

  /** Every layout a given user can see: their own personal layouts, workspace/organization layouts within their own organization, and the global system templates — never another organization's data. */
  listForActor(actor: DashboardLayoutActor): DashboardLayout<TKey>[] {
    return Array.from(this.layouts.values())
      .filter(l => this.isVisibleToActor(l, actor))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  discover(query: string, actor: DashboardLayoutActor): DashboardLayout<TKey>[] {
    const q = query.toLowerCase();
    return this.listForActor(actor).filter(l => l.name.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
  }

  /**
   * Layout Persistence Hierarchy: user layout > workspace layout >
   * organization layout > system default. `preferredLayoutId` (the user's
   * last explicit choice) wins if it still resolves and is visible to them.
   */
  resolveActiveLayout(actor: DashboardLayoutActor, preferredLayoutId?: string): DashboardLayout<TKey> {
    const candidates = Array.from(this.layouts.values());

    if (preferredLayoutId) {
      const preferred = this.layouts.get(preferredLayoutId);
      if (preferred && this.isVisibleToActor(preferred, actor)) return preferred;
    }

    const userDefault = candidates.find(l => l.scope === "user" && l.owner === actor.userId && l.organizationId === actor.organizationId && l.isDefault);
    if (userDefault) return userDefault;

    const userAny = candidates.find(l => l.scope === "user" && l.owner === actor.userId && l.organizationId === actor.organizationId);
    if (userAny) return userAny;

    if (actor.workspaceId) {
      const workspaceDefault = candidates.find(l => l.scope === "workspace" && l.workspaceId === actor.workspaceId && l.organizationId === actor.organizationId && l.isDefault);
      if (workspaceDefault) return workspaceDefault;
      const workspaceAny = candidates.find(l => l.scope === "workspace" && l.workspaceId === actor.workspaceId && l.organizationId === actor.organizationId);
      if (workspaceAny) return workspaceAny;
    }

    const orgDefault = candidates.find(l => l.scope === "organization" && l.organizationId === actor.organizationId && l.isDefault);
    if (orgDefault) return orgDefault;
    const orgAny = candidates.find(l => l.scope === "organization" && l.organizationId === actor.organizationId);
    if (orgAny) return orgAny;

    const systemDefault = candidates.find(l => l.scope === "system" && l.isDefault);
    if (systemDefault) return systemDefault;
    const systemAny = candidates.find(l => l.scope === "system");
    if (systemAny) return systemAny;

    return this.emptyFallback(actor);
  }

  private emptyFallback(actor: DashboardLayoutActor): DashboardLayout<TKey> {
    const now = new Date().toISOString();
    return {
      id: "layout-empty-fallback",
      name: "Dashboard",
      description: "Default layout",
      persona: "custom",
      widgets: this.defaultWidgetSet(),
      owner: actor.userId,
      scope: "user",
      organizationId: actor.organizationId,
      isDefault: true,
      isFavorite: false,
      isTemplate: false,
      sharedWith: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Copy-on-write personalization: system templates and organization/
   * workspace layouts are shared, read-through defaults — the first time an
   * actor drags, resizes, hides, or pins a widget while one of those is
   * active, this forks it into a real `scope: "user"` layout owned by them
   * so the mutation never touches the shared original. Already-personal
   * layouts pass through unchanged.
   */
  materializeUserLayout(actor: DashboardLayoutActor, source: DashboardLayout<TKey>): DashboardLayout<TKey> {
    if (source.scope === "user" && source.owner === actor.userId && source.organizationId === actor.organizationId) {
      return source;
    }
    const now = new Date().toISOString();
    const materialized: DashboardLayout<TKey> = {
      ...source,
      id: `layout-${generateId(10)}`,
      name: source.scope === "system" ? "My Dashboard" : `My ${source.name}`,
      owner: actor.userId,
      scope: "user",
      organizationId: actor.organizationId,
      workspaceId: undefined,
      isDefault: true,
      isFavorite: false,
      isTemplate: false,
      templateVisibility: undefined,
      sourceTemplateId: source.isTemplate ? source.id : source.sourceTemplateId,
      sharedWith: [],
      widgets: source.widgets.map(w => ({ ...w, layout: { ...w.layout } })),
      createdAt: now,
      updatedAt: now,
    };
    for (const l of this.layouts.values()) {
      if (l.scope === "user" && l.owner === actor.userId && l.organizationId === actor.organizationId) l.isDefault = false;
    }
    this.layouts.set(materialized.id, materialized);
    this.persist();
    return materialized;
  }

  create(params: { name: string; description: string; actor: DashboardLayoutActor; templateId?: string; scope?: DashboardLayoutScope }): DashboardLayout<TKey> {
    const template = params.templateId ? this.layouts.get(params.templateId) : undefined;
    const scope: DashboardLayoutScope = params.scope ?? "user";
    const now = new Date().toISOString();
    const layout: DashboardLayout<TKey> = {
      id: `layout-${generateId(10)}`,
      name: params.name,
      description: params.description,
      persona: template?.persona ?? "custom",
      widgets: (template?.widgets ?? this.defaultWidgetSet()).map(w => ({ ...w, layout: { ...w.layout } })),
      owner: scope === "organization" ? params.actor.organizationId : scope === "workspace" ? (params.actor.workspaceId ?? params.actor.organizationId) : params.actor.userId,
      scope,
      organizationId: params.actor.organizationId,
      workspaceId: scope === "workspace" ? params.actor.workspaceId : undefined,
      isDefault: false,
      isFavorite: false,
      isTemplate: false,
      sourceTemplateId: template?.isTemplate ? template.id : template?.sourceTemplateId,
      sharedWith: [],
      createdAt: now,
      updatedAt: now,
    };
    this.layouts.set(layout.id, layout);
    this.persist();
    return layout;
  }

  clone(id: string, name: string, actor: DashboardLayoutActor): DashboardLayout<TKey> | undefined {
    const source = this.layouts.get(id);
    if (!source) return undefined;
    const now = new Date().toISOString();
    const clone: DashboardLayout<TKey> = {
      ...source,
      id: `layout-${generateId(10)}`,
      name,
      owner: actor.userId,
      scope: "user",
      organizationId: actor.organizationId,
      workspaceId: undefined,
      isDefault: false,
      isFavorite: false,
      isTemplate: false,
      templateVisibility: undefined,
      sourceTemplateId: source.isTemplate ? source.id : source.sourceTemplateId,
      sharedWith: [],
      widgets: source.widgets.map(w => ({ ...w, layout: { ...w.layout } })),
      createdAt: now,
      updatedAt: now,
    };
    this.layouts.set(clone.id, clone);
    this.persist();
    return clone;
  }

  rename(id: string, name: string): DashboardLayout<TKey> | undefined {
    const layout = this.layouts.get(id);
    if (!layout) return undefined;
    layout.name = name;
    layout.updatedAt = new Date().toISOString();
    this.persist();
    return { ...layout };
  }

  remove(id: string): boolean {
    const removed = this.layouts.delete(id);
    if (removed) this.persist();
    return removed;
  }

  setFavorite(id: string, favorite: boolean): DashboardLayout<TKey> | undefined {
    const layout = this.layouts.get(id);
    if (!layout) return undefined;
    layout.isFavorite = favorite;
    this.persist();
    return { ...layout };
  }

  /** Scoped to the actor's own personal layouts — setting an organization- or workspace-wide default is a separate, deliberately smaller admin action not built this round (see certification report). */
  setDefault(id: string, actor: DashboardLayoutActor): void {
    const target = this.layouts.get(id);
    if (!target) return;
    for (const layout of this.layouts.values()) {
      if (layout.scope === "user" && layout.owner === actor.userId && layout.organizationId === actor.organizationId) {
        layout.isDefault = layout.id === id;
      }
    }
    this.persist();
  }

  share(id: string, userIds: string[]): DashboardLayout<TKey> | undefined {
    const layout = this.layouts.get(id);
    if (!layout) return undefined;
    layout.sharedWith = Array.from(new Set([...layout.sharedWith, ...userIds]));
    layout.updatedAt = new Date().toISOString();
    this.persist();
    return { ...layout };
  }

  /** "Save as Template": snapshots the current layout under a new id at the requested visibility, so it appears as a clone-source in the switcher for whoever that visibility reaches (private = only the saver; workspace/organization = everyone in that scope). */
  saveAsTemplate(actor: DashboardLayoutActor, sourceId: string, name: string, visibility: DashboardLayoutTemplateVisibility): DashboardLayout<TKey> | undefined {
    const source = this.layouts.get(sourceId);
    if (!source) return undefined;
    const scope: DashboardLayoutScope = visibility === "organization" ? "organization" : visibility === "workspace" ? "workspace" : "user";
    const now = new Date().toISOString();
    const template: DashboardLayout<TKey> = {
      ...source,
      id: `layout-${generateId(10)}`,
      name,
      scope,
      owner: scope === "organization" ? actor.organizationId : scope === "workspace" ? (actor.workspaceId ?? actor.organizationId) : actor.userId,
      organizationId: actor.organizationId,
      workspaceId: scope === "workspace" ? actor.workspaceId : undefined,
      isDefault: false,
      isFavorite: false,
      isTemplate: true,
      templateVisibility: visibility,
      sourceTemplateId: undefined,
      sharedWith: [],
      widgets: source.widgets.map(w => ({ ...w, layout: { ...w.layout } })),
      createdAt: now,
      updatedAt: now,
    };
    this.layouts.set(template.id, template);
    this.templateSnapshots.set(template.id, template.widgets.map(w => ({ ...w, layout: { ...w.layout } })));
    this.persist();
    return template;
  }

  updateWidgets(id: string, widgets: DashboardWidgetConfig<TKey>[]): DashboardLayout<TKey> | undefined {
    const layout = this.layouts.get(id);
    if (!layout) return undefined;
    layout.widgets = widgets;
    layout.updatedAt = new Date().toISOString();
    this.persist();
    return layout;
  }

  addWidget(layoutId: string, key: TKey, defaultSize: { w: number; h: number }): DashboardLayout<TKey> | undefined {
    const layout = this.layouts.get(layoutId);
    if (!layout) return undefined;
    const alreadyPlaced = layout.widgets.some(w => w.key === key);
    const instanceId = alreadyPlaced ? `${key}-${generateId(6)}` : key;
    const maxY = layout.widgets.reduce((m, w) => Math.max(m, w.layout.y + w.layout.h), 0);
    const widget: DashboardWidgetConfig<TKey> = {
      key,
      instanceId,
      visible: true,
      pinned: false,
      collapsed: false,
      order: layout.widgets.length,
      layout: { x: 0, y: maxY, w: defaultSize.w, h: defaultSize.h },
    };
    layout.widgets = [...layout.widgets, widget];
    layout.updatedAt = new Date().toISOString();
    this.persist();
    return layout;
  }

  removeWidget(layoutId: string, instanceId: string): DashboardLayout<TKey> | undefined {
    const layout = this.layouts.get(layoutId);
    if (!layout) return undefined;
    layout.widgets = layout.widgets.filter(w => w.instanceId !== instanceId);
    layout.updatedAt = new Date().toISOString();
    this.persist();
    return layout;
  }

  duplicateWidget(layoutId: string, instanceId: string): DashboardLayout<TKey> | undefined {
    const layout = this.layouts.get(layoutId);
    if (!layout) return undefined;
    const source = layout.widgets.find(w => w.instanceId === instanceId);
    if (!source) return undefined;
    const maxY = layout.widgets.reduce((m, w) => Math.max(m, w.layout.y + w.layout.h), 0);
    const copy: DashboardWidgetConfig<TKey> = { ...source, instanceId: `${source.key}-${generateId(6)}`, layout: { ...source.layout, y: maxY }, order: layout.widgets.length };
    layout.widgets = [...layout.widgets, copy];
    layout.updatedAt = new Date().toISOString();
    this.persist();
    return layout;
  }

  resetWidgetPosition(layoutId: string, instanceId: string): DashboardLayout<TKey> | undefined {
    const layout = this.layouts.get(layoutId);
    if (!layout) return undefined;
    const snapshot = this.templateSnapshots.get(layout.sourceTemplateId ?? layoutId) ?? this.defaultWidgetSet();
    const widget = layout.widgets.find(w => w.instanceId === instanceId);
    const templateWidget = snapshot.find(w => w.key === widget?.key);
    if (!widget || !templateWidget) return layout;
    layout.widgets = layout.widgets.map(w => (w.instanceId === instanceId ? { ...w, layout: { ...templateWidget.layout }, collapsed: false } : w));
    layout.updatedAt = new Date().toISOString();
    this.persist();
    return layout;
  }

  resetToTemplate(id: string): DashboardLayout<TKey> | undefined {
    const layout = this.layouts.get(id);
    if (!layout) return undefined;
    const snapshot = this.templateSnapshots.get(layout.sourceTemplateId ?? id) ?? this.defaultWidgetSet();
    layout.widgets = snapshot.map(w => ({ ...w, layout: { ...w.layout } }));
    layout.updatedAt = new Date().toISOString();
    this.persist();
    return layout;
  }

  count(): number {
    return this.layouts.size;
  }
}
