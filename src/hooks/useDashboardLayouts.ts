"use client";

/**
 * Calixo Platform - Dashboard layout switcher state.
 *
 * Round 23: rewritten to call `features/dashboard/layoutActions.ts` Server
 * Actions instead of touching `dashboardLayoutRegistry` directly — that
 * registry is now `import "server-only"`-tagged, file-persisted, and
 * organization-scoped; this hook is the client-side read/write surface
 * over it, not an alternate path into it.
 */

import { useCallback, useEffect, useState } from "react";
import { useCurrentWorkspace } from "@/workspaces/hooks/useWorkspace";
import { useDashboardPreferences } from "./useDashboardPreferences";
import type { DashboardLayout, DashboardWidgetCatalogEntry, DashboardWidgetConfig, DashboardWidgetKey } from "@/core/dashboard";
import { DASHBOARD_WIDGET_CATALOG, logDashboardError } from "@/core/dashboard";
import type { DashboardLayoutTemplateVisibility } from "@/core/platform/dashboardBuilder";
import {
  getDashboardLayoutStateAction,
  listDashboardWidgetCatalogAction,
  switchDashboardLayoutAction,
  createDashboardLayoutAction,
  cloneDashboardLayoutAction,
  renameDashboardLayoutAction,
  removeDashboardLayoutAction,
  toggleDashboardLayoutFavoriteAction,
  setDefaultDashboardLayoutAction,
  saveDashboardLayoutAsTemplateAction,
  resetDashboardLayoutAction,
  resetDashboardWidgetAction,
  updateDashboardWidgetsAction,
  addDashboardWidgetAction,
  removeDashboardWidgetAction,
  duplicateDashboardWidgetAction,
} from "@/features/dashboard/layoutActions";

export function useDashboardLayouts() {
  const prefs = useDashboardPreferences();
  const workspace = useCurrentWorkspace();
  const workspaceId = workspace?.id;
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [activeId, setActiveId] = useState<string>("layout-personal");
  const [renderableIds, setRenderableIds] = useState<Set<string>>(new Set());
  const [catalog, setCatalog] = useState<DashboardWidgetCatalogEntry[]>(DASHBOARD_WIDGET_CATALOG);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(
    async (preferredLayoutId?: string) => {
      const preferred = preferredLayoutId ?? (prefs.hasExplicitLandingLayout ? prefs.landingLayoutId : undefined);
      const [state, filteredCatalog] = await Promise.all([getDashboardLayoutStateAction(preferred, workspaceId), listDashboardWidgetCatalogAction(workspaceId)]);
      setLayouts(state.layouts);
      setActiveId(state.active.id);
      setRenderableIds(new Set(state.renderableInstanceIds));
      setCatalog(filteredCatalog);
      setLoaded(true);
      return state.active;
    },
    [workspaceId, prefs.hasExplicitLandingLayout, prefs.landingLayoutId]
  );

  useEffect(() => {
    (async () => {
      await refresh();
    })();
    // Deliberately excludes `refresh` (which itself depends on `prefs`, re-created every render) —
    // only re-fetch when the tenant we're resolving against actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const active = layouts.find(l => l.id === activeId) ?? layouts[0];

  /** Fast path for widget-level mutations: merges the single updated layout back into local state instead of a full re-fetch, so auto-save stays snappy under rapid drag/resize/hide activity. */
  const mergeLayout = useCallback(
    (updated: DashboardLayout) => {
      setLayouts(prev => {
        const exists = prev.some(l => l.id === updated.id);
        const next = exists ? prev.map(l => (l.id === updated.id ? updated : l)) : [...prev, updated];
        return next.sort((a, b) => a.name.localeCompare(b.name));
      });
      setActiveId(updated.id);
      prefs.setLandingLayoutId(updated.id);
    },
    [prefs]
  );

  const switchTo = useCallback(
    async (id: string) => {
      prefs.recordRecentlyViewed(id);
      const state = await switchDashboardLayoutAction(id, workspaceId);
      setLayouts(state.layouts);
      setActiveId(state.active.id);
      setRenderableIds(new Set(state.renderableInstanceIds));
    },
    [prefs, workspaceId]
  );

  const create = useCallback(
    async (name: string, description: string, templateId?: string) => {
      try {
        const layout = await createDashboardLayoutAction(name, description, templateId, workspaceId);
        prefs.setLandingLayoutId(layout.id);
        await refresh(layout.id);
        return layout;
      } catch (error) {
        logDashboardError("Failed to create dashboard layout", error);
        throw error;
      }
    },
    [workspaceId, prefs, refresh]
  );

  const clone = useCallback(
    async (id: string, name: string) => {
      try {
        const layout = await cloneDashboardLayoutAction(id, name, workspaceId);
        if (layout) {
          prefs.setLandingLayoutId(layout.id);
          await refresh(layout.id);
        }
        return layout;
      } catch (error) {
        logDashboardError("Failed to clone dashboard layout", error);
        throw error;
      }
    },
    [workspaceId, prefs, refresh]
  );

  const rename = useCallback(
    async (id: string, name: string) => {
      try {
        await renameDashboardLayoutAction(id, name);
        await refresh();
      } catch (error) {
        logDashboardError("Failed to rename dashboard layout", error);
        throw error;
      }
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await removeDashboardLayoutAction(id, workspaceId);
        if (activeId === id) prefs.setLandingLayoutId("layout-personal");
        await refresh();
      } catch (error) {
        logDashboardError("Failed to delete dashboard layout", error);
        throw error;
      }
    },
    [workspaceId, activeId, prefs, refresh]
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const layout = layouts.find(l => l.id === id);
      if (!layout) return;
      await toggleDashboardLayoutFavoriteAction(id, !layout.isFavorite);
      await refresh();
    },
    [layouts, refresh]
  );

  const setAsDefault = useCallback(
    async (id: string) => {
      await setDefaultDashboardLayoutAction(id, workspaceId);
      prefs.setLandingLayoutId(id);
      await refresh(id);
    },
    [workspaceId, prefs, refresh]
  );

  const saveAsTemplate = useCallback(
    async (sourceId: string, name: string, visibility: DashboardLayoutTemplateVisibility) => {
      try {
        const template = await saveDashboardLayoutAsTemplateAction(sourceId, name, visibility, workspaceId);
        await refresh();
        return template;
      } catch (error) {
        logDashboardError("Failed to save dashboard layout as template", error);
        throw error;
      }
    },
    [workspaceId, refresh]
  );

  const resetToTemplate = useCallback(
    async (id: string) => {
      const updated = await resetDashboardLayoutAction(id, workspaceId);
      if (updated) mergeLayout(updated);
    },
    [workspaceId, mergeLayout]
  );

  const resetWidget = useCallback(
    async (instanceId: string) => {
      if (!active) return;
      const updated = await resetDashboardWidgetAction(active.id, instanceId, workspaceId);
      if (updated) mergeLayout(updated);
    },
    [active, workspaceId, mergeLayout]
  );

  /**
   * `visibleSubset` is only the widgets the caller could actually see and
   * interact with (entitlement/permission-filtered) — merged back into the
   * full underlying widget array before saving, so a widget the current
   * user can't see (e.g. Brand Sentiment on a Trial org) is never silently
   * dropped from storage just because it wasn't part of this render.
   */
  const updateWidgets = useCallback(
    async (visibleSubset: DashboardWidgetConfig[]) => {
      if (!active) return;
      const byId = new Map(visibleSubset.map(w => [w.instanceId, w]));
      const merged = active.widgets.map(w => byId.get(w.instanceId) ?? w);
      const updated = await updateDashboardWidgetsAction(active.id, merged, workspaceId);
      if (updated) mergeLayout(updated);
    },
    [active, workspaceId, mergeLayout]
  );

  const addWidget = useCallback(
    async (key: DashboardWidgetKey) => {
      if (!active) return;
      const updated = await addDashboardWidgetAction(active.id, key, workspaceId);
      if (updated) mergeLayout(updated);
    },
    [active, workspaceId, mergeLayout]
  );

  const removeWidget = useCallback(
    async (instanceId: string) => {
      if (!active) return;
      const updated = await removeDashboardWidgetAction(active.id, instanceId, workspaceId);
      if (updated) mergeLayout(updated);
    },
    [active, workspaceId, mergeLayout]
  );

  const duplicateWidget = useCallback(
    async (instanceId: string) => {
      if (!active) return;
      const updated = await duplicateDashboardWidgetAction(active.id, instanceId, workspaceId);
      if (updated) mergeLayout(updated);
    },
    [active, workspaceId, mergeLayout]
  );

  return {
    layouts,
    active,
    activeId,
    renderableIds,
    catalog,
    loaded,
    switchTo,
    create,
    clone,
    rename,
    remove,
    toggleFavorite,
    setAsDefault,
    saveAsTemplate,
    resetToTemplate,
    resetWidget,
    updateWidgets,
    addWidget,
    removeWidget,
    duplicateWidget,
    refresh,
  };
}
