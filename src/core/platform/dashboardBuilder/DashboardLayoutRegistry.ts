/**
 * Calixo Platform - Generic Dashboard Layout Registry
 *
 * The reusable engine behind every module's "dashboard builder": register/
 * list/lookup plus create, clone, rename, remove, favourite, set-default,
 * share, and reset-to-template. Each module instantiates its own
 * `new DashboardLayoutRegistry<TWidgetKey>()` with its own widget-key union
 * and default widget set — the registry itself has no knowledge of what a
 * "widget" means for that module.
 */

import { generateId } from "@/shared/utils/string";
import type { DashboardLayout, DashboardWidgetConfig } from "./types";

export class DashboardLayoutRegistry<TKey extends string = string> {
  private layouts: Map<string, DashboardLayout<TKey>> = new Map();
  private templateSnapshots: Map<string, DashboardWidgetConfig<TKey>[]> = new Map();

  constructor(private defaultWidgetSet: () => DashboardWidgetConfig<TKey>[]) {}

  register(layout: DashboardLayout<TKey>): void {
    this.layouts.set(layout.id, layout);
    if (layout.isTemplate) {
      this.templateSnapshots.set(layout.id, layout.widgets.map(w => ({ ...w })));
    }
  }

  registerMany(layouts: DashboardLayout<TKey>[]): void {
    for (const layout of layouts) this.register(layout);
  }

  lookup(id: string): DashboardLayout<TKey> | undefined {
    return this.layouts.get(id);
  }

  list(params: { owner?: string } = {}): DashboardLayout<TKey>[] {
    return Array.from(this.layouts.values())
      .filter(l => !params.owner || l.owner === params.owner || l.sharedWith.includes(params.owner))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  discover(query: string): DashboardLayout<TKey>[] {
    const q = query.toLowerCase();
    return this.list().filter(l => l.name.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
  }

  create(params: { name: string; description: string; owner: string; templateId?: string; persona?: string }): DashboardLayout<TKey> {
    const template = params.templateId ? this.layouts.get(params.templateId) : undefined;
    const now = new Date().toISOString();
    const layout: DashboardLayout<TKey> = {
      id: `layout-${generateId(10)}`,
      name: params.name,
      description: params.description,
      persona: params.persona ?? "custom",
      widgets: (template?.widgets ?? this.defaultWidgetSet()).map(w => ({ ...w })),
      owner: params.owner,
      isDefault: false,
      isFavorite: false,
      isTemplate: false,
      sharedWith: [],
      createdAt: now,
      updatedAt: now,
    };
    this.layouts.set(layout.id, layout);
    return layout;
  }

  clone(id: string, name: string, owner: string): DashboardLayout<TKey> | undefined {
    const source = this.layouts.get(id);
    if (!source) return undefined;
    const now = new Date().toISOString();
    const clone: DashboardLayout<TKey> = {
      ...source,
      id: `layout-${generateId(10)}`,
      name,
      owner,
      isDefault: false,
      isFavorite: false,
      isTemplate: false,
      sharedWith: [],
      widgets: source.widgets.map(w => ({ ...w })),
      createdAt: now,
      updatedAt: now,
    };
    this.layouts.set(clone.id, clone);
    return clone;
  }

  rename(id: string, name: string): DashboardLayout<TKey> | undefined {
    const layout = this.layouts.get(id);
    if (!layout) return undefined;
    layout.name = name;
    layout.updatedAt = new Date().toISOString();
    return { ...layout };
  }

  remove(id: string): boolean {
    return this.layouts.delete(id);
  }

  setFavorite(id: string, favorite: boolean): DashboardLayout<TKey> | undefined {
    const layout = this.layouts.get(id);
    if (!layout) return undefined;
    layout.isFavorite = favorite;
    return { ...layout };
  }

  setDefault(id: string, owner: string): void {
    for (const layout of this.layouts.values()) {
      if (layout.owner === owner) layout.isDefault = layout.id === id;
    }
  }

  share(id: string, userIds: string[]): DashboardLayout<TKey> | undefined {
    const layout = this.layouts.get(id);
    if (!layout) return undefined;
    layout.sharedWith = Array.from(new Set([...layout.sharedWith, ...userIds]));
    layout.updatedAt = new Date().toISOString();
    return { ...layout };
  }

  updateWidgets(id: string, widgets: DashboardWidgetConfig<TKey>[]): DashboardLayout<TKey> | undefined {
    const layout = this.layouts.get(id);
    if (!layout) return undefined;
    layout.widgets = widgets;
    layout.updatedAt = new Date().toISOString();
    return { ...layout };
  }

  resetToTemplate(id: string): DashboardLayout<TKey> | undefined {
    const layout = this.layouts.get(id);
    if (!layout) return undefined;
    const snapshot = this.templateSnapshots.get(id) ?? this.defaultWidgetSet();
    layout.widgets = snapshot.map(w => ({ ...w }));
    layout.updatedAt = new Date().toISOString();
    return { ...layout };
  }

  count(): number {
    return this.layouts.size;
  }
}
