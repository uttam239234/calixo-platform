import "server-only";

/**
 * Calixo Platform - Dashboard-Builder Server Controller
 *
 * The real "backend enforcement, not UI hiding" boundary for widget
 * layouts — every mutation (drag, resize, hide, pin, duplicate, reset,
 * save-as-template) flows through here, never through a client-callable
 * registry method. A thin `"use server"` file per module (see
 * `features/dashboard/layoutActions.ts`) wraps these with `resolveIdentity()`
 * so `actor` is always a server-verified `{userId, organizationId}`, never
 * a client-supplied value. Kept generic (no dependency on
 * `EntitlementModuleId`/`core/platform/access`) so both Dashboard and
 * Analytics — and any future module — share one implementation; the
 * optional `filterWidget` hook is where a module plugs in its own
 * entitlement/permission checks.
 */
import { auditService } from "@/access/audit/AuditService";
import type { AuditEventType } from "@/access/types";
import type { DashboardLayoutRegistry } from "./DashboardLayoutRegistry";
import type { DashboardLayout, DashboardLayoutActor, DashboardLayoutTemplateVisibility, DashboardWidgetCatalogEntry, DashboardWidgetConfig } from "./types";

export interface LayoutControllerConfig<TKey extends string, TEntry extends DashboardWidgetCatalogEntry<TKey> = DashboardWidgetCatalogEntry<TKey>> {
  registry: DashboardLayoutRegistry<TKey>;
  moduleId: string;
  catalog: TEntry[];
  /** Real entitlement/permission gate for one widget — omit to leave every catalog widget unfiltered. */
  filterWidget?: (actor: DashboardLayoutActor, entry: TEntry) => Promise<boolean>;
}

interface WidgetChangeEvent<TKey extends string> {
  type: AuditEventType;
  instanceId: string;
  key: TKey;
}

function diffWidgets<TKey extends string>(before: DashboardWidgetConfig<TKey>[], after: DashboardWidgetConfig<TKey>[]): WidgetChangeEvent<TKey>[] {
  const beforeById = new Map(before.map(w => [w.instanceId, w]));
  const events: WidgetChangeEvent<TKey>[] = [];
  for (const w of after) {
    const prev = beforeById.get(w.instanceId);
    if (!prev) continue;
    if (prev.layout.x !== w.layout.x || prev.layout.y !== w.layout.y) events.push({ type: "widget_moved", instanceId: w.instanceId, key: w.key });
    if (prev.layout.w !== w.layout.w || prev.layout.h !== w.layout.h) events.push({ type: "widget_resized", instanceId: w.instanceId, key: w.key });
    if (prev.visible && !w.visible) events.push({ type: "widget_hidden", instanceId: w.instanceId, key: w.key });
    if (!prev.visible && w.visible) events.push({ type: "widget_shown", instanceId: w.instanceId, key: w.key });
    if (prev.pinned !== w.pinned) events.push({ type: "widget_pinned", instanceId: w.instanceId, key: w.key });
  }
  return events.slice(0, 10);
}

export interface LayoutState<TKey extends string> {
  layouts: DashboardLayout<TKey>[];
  active: DashboardLayout<TKey>;
  renderableInstanceIds: string[];
}

export function createLayoutController<TKey extends string, TEntry extends DashboardWidgetCatalogEntry<TKey> = DashboardWidgetCatalogEntry<TKey>>({
  registry,
  moduleId,
  catalog,
  filterWidget,
}: LayoutControllerConfig<TKey, TEntry>) {
  function catalogEntry(key: TKey) {
    return catalog.find(c => c.key === key);
  }

  async function computeRenderable(actor: DashboardLayoutActor, layout: DashboardLayout<TKey>): Promise<string[]> {
    if (!filterWidget) return layout.widgets.map(w => w.instanceId);
    const checks = await Promise.all(
      layout.widgets.map(async w => {
        const entry = catalogEntry(w.key);
        const ok = entry ? await filterWidget(actor, entry) : true;
        return { id: w.instanceId, ok };
      })
    );
    return checks.filter(c => c.ok).map(c => c.id);
  }

  async function audit(actor: DashboardLayoutActor, eventType: AuditEventType, layout: DashboardLayout<TKey>, description: string, changes?: Record<string, unknown>) {
    await auditService.recordEvent({
      organizationId: actor.organizationId,
      workspaceId: actor.workspaceId,
      userId: actor.userId,
      eventType,
      resource: `${moduleId}-layout`,
      resourceId: layout.id,
      description,
      changes,
    });
  }

  return {
    async getState(actor: DashboardLayoutActor, preferredLayoutId?: string): Promise<LayoutState<TKey>> {
      const layouts = registry.listForActor(actor);
      const active = registry.resolveActiveLayout(actor, preferredLayoutId);
      const renderableInstanceIds = await computeRenderable(actor, active);
      return { layouts, active, renderableInstanceIds };
    },

    async listWidgetCatalog(actor: DashboardLayoutActor): Promise<TEntry[]> {
      if (!filterWidget) return catalog;
      const checks = await Promise.all(catalog.map(async entry => ({ entry, ok: await filterWidget(actor, entry) })));
      return checks.filter(c => c.ok).map(c => c.entry);
    },

    async switchTo(actor: DashboardLayoutActor, layoutId: string): Promise<LayoutState<TKey>> {
      return this.getState(actor, layoutId);
    },

    async create(actor: DashboardLayoutActor, name: string, description: string, templateId?: string) {
      const layout = registry.create({ name, description, actor, templateId });
      await registry.flush();
      await audit(actor, "layout_created", layout, `Created dashboard "${name}"`);
      return layout;
    },

    async clone(actor: DashboardLayoutActor, sourceId: string, name: string) {
      const layout = registry.clone(sourceId, name, actor);
      if (!layout) return undefined;
      await registry.flush();
      await audit(actor, "layout_created", layout, `Cloned dashboard as "${name}"`);
      return layout;
    },

    async rename(id: string, name: string) {
      const layout = registry.rename(id, name);
      await registry.flush();
      return layout;
    },

    async remove(actor: DashboardLayoutActor, id: string) {
      const layout = registry.lookup(id);
      const removed = registry.remove(id);
      if (removed) {
        await registry.flush();
        if (layout) await audit(actor, "layout_reset", layout, `Deleted dashboard "${layout.name}"`);
      }
      return removed;
    },

    async toggleFavorite(id: string, favorite: boolean) {
      const layout = registry.setFavorite(id, favorite);
      await registry.flush();
      return layout;
    },

    async setDefault(actor: DashboardLayoutActor, id: string) {
      registry.setDefault(id, actor);
      await registry.flush();
    },

    async saveAsTemplate(actor: DashboardLayoutActor, sourceId: string, name: string, visibility: DashboardLayoutTemplateVisibility) {
      const template = registry.saveAsTemplate(actor, sourceId, name, visibility);
      if (template) {
        await registry.flush();
        await audit(actor, "template_applied", template, `Saved "${name}" as a ${visibility} template`);
      }
      return template;
    },

    async resetLayout(actor: DashboardLayoutActor, id: string) {
      const layout = registry.resetToTemplate(id);
      if (layout) {
        await registry.flush();
        await audit(actor, "layout_reset", layout, `Reset "${layout.name}" to its template`);
      }
      return layout;
    },

    async resetWidget(actor: DashboardLayoutActor, layoutId: string, instanceId: string) {
      const layout = registry.resetWidgetPosition(layoutId, instanceId);
      if (layout) {
        await registry.flush();
        await audit(actor, "layout_reset", layout, `Reset widget position`, { instanceId });
      }
      return layout;
    },

    /** The auto-save endpoint — every drag/resize/hide/pin funnels through here. Materializes (copy-on-write) if the active layout isn't already the actor's own before applying the change, then diff-audits what actually changed. */
    async updateWidgets(actor: DashboardLayoutActor, layoutId: string, widgets: DashboardWidgetConfig<TKey>[]) {
      const current = registry.resolveActiveLayout(actor, layoutId);
      const target = registry.materializeUserLayout(actor, current);
      const before = target.widgets;
      const updated = registry.updateWidgets(target.id, widgets);
      if (!updated) return undefined;
      await registry.flush();
      const events = diffWidgets(before, widgets);
      for (const event of events) {
        await audit(actor, event.type, updated, `${event.type.replace("widget_", "")} — ${catalogEntry(event.key)?.label ?? event.key}`, { instanceId: event.instanceId });
      }
      return updated;
    },

    async addWidget(actor: DashboardLayoutActor, layoutId: string, key: TKey) {
      const entry = catalogEntry(key);
      if (!entry) return undefined;
      const current = registry.resolveActiveLayout(actor, layoutId);
      const target = registry.materializeUserLayout(actor, current);
      const updated = registry.addWidget(target.id, key, entry.defaultSize);
      if (!updated) return undefined;
      await registry.flush();
      await audit(actor, "widget_shown", updated, `Added "${entry.label}"`);
      return updated;
    },

    async removeWidget(actor: DashboardLayoutActor, layoutId: string, instanceId: string) {
      const current = registry.resolveActiveLayout(actor, layoutId);
      const target = registry.materializeUserLayout(actor, current);
      const updated = registry.removeWidget(target.id, instanceId);
      if (updated) {
        await registry.flush();
        await audit(actor, "widget_removed", updated, `Removed widget`, { instanceId });
      }
      return updated;
    },

    async duplicateWidget(actor: DashboardLayoutActor, layoutId: string, instanceId: string) {
      const current = registry.resolveActiveLayout(actor, layoutId);
      const target = registry.materializeUserLayout(actor, current);
      const updated = registry.duplicateWidget(target.id, instanceId);
      if (updated) {
        await registry.flush();
        await audit(actor, "widget_duplicated", updated, `Duplicated widget`, { instanceId });
      }
      return updated;
    },
  };
}

export type LayoutController<TKey extends string> = ReturnType<typeof createLayoutController<TKey>>;
