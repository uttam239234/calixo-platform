"use client";

/**
 * Calixo Platform - Analytics dashboard switcher state.
 *
 * Round 23: rewritten to call `features/analytics/layoutActions.ts` Server
 * Actions instead of touching `analyticsDashboardRegistry` directly — that
 * registry is now `import "server-only"`-tagged, file-persisted, and
 * organization-scoped. Mirrors `useDashboardLayouts()` exactly — both sit
 * on top of the same shared `core/platform/dashboardBuilder` engine.
 */

import { useCallback, useEffect, useState } from "react";
import { useCurrentWorkspace } from "@/workspaces/hooks/useWorkspace";
import type { AnalyticsDashboardLayout, AnalyticsWidgetCatalogEntry, AnalyticsWidgetConfig, AnalyticsWidgetKey } from "@/core/analytics";
import { ANALYTICS_WIDGET_CATALOG, logAnalyticsError } from "@/core/analytics";
import type { DashboardLayoutTemplateVisibility } from "@/core/platform/dashboardBuilder";
import {
  getAnalyticsLayoutStateAction,
  listAnalyticsWidgetCatalogAction,
  switchAnalyticsLayoutAction,
  createAnalyticsLayoutAction,
  cloneAnalyticsLayoutAction,
  renameAnalyticsLayoutAction,
  removeAnalyticsLayoutAction,
  toggleAnalyticsLayoutFavoriteAction,
  setDefaultAnalyticsLayoutAction,
  saveAnalyticsLayoutAsTemplateAction,
  resetAnalyticsLayoutAction,
  resetAnalyticsWidgetAction,
  updateAnalyticsWidgetsAction,
  addAnalyticsWidgetAction,
  removeAnalyticsWidgetAction,
  duplicateAnalyticsWidgetAction,
} from "@/features/analytics/layoutActions";

const DEFAULT_ACTIVE_ID = "analytics-layout-executive";

export function useAnalyticsDashboards() {
  const workspace = useCurrentWorkspace();
  const workspaceId = workspace?.id;
  const [layouts, setLayouts] = useState<AnalyticsDashboardLayout[]>([]);
  const [activeId, setActiveId] = useState<string>(DEFAULT_ACTIVE_ID);
  const [renderableIds, setRenderableIds] = useState<Set<string>>(new Set());
  const [catalog, setCatalog] = useState<AnalyticsWidgetCatalogEntry[]>(ANALYTICS_WIDGET_CATALOG);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(
    async (preferredLayoutId?: string) => {
      const [state, filteredCatalog] = await Promise.all([getAnalyticsLayoutStateAction(preferredLayoutId, workspaceId), listAnalyticsWidgetCatalogAction(workspaceId)]);
      setLayouts(state.layouts);
      setActiveId(state.active.id);
      setRenderableIds(new Set(state.renderableInstanceIds));
      setCatalog(filteredCatalog);
      setLoaded(true);
      return state.active;
    },
    [workspaceId]
  );

  useEffect(() => {
    (async () => {
      await refresh();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const active = layouts.find(l => l.id === activeId) ?? layouts[0];

  const mergeLayout = useCallback((updated: AnalyticsDashboardLayout) => {
    setLayouts(prev => {
      const exists = prev.some(l => l.id === updated.id);
      const next = exists ? prev.map(l => (l.id === updated.id ? updated : l)) : [...prev, updated];
      return next.sort((a, b) => a.name.localeCompare(b.name));
    });
    setActiveId(updated.id);
  }, []);

  const switchTo = useCallback(
    async (id: string) => {
      const state = await switchAnalyticsLayoutAction(id, workspaceId);
      setLayouts(state.layouts);
      setActiveId(state.active.id);
      setRenderableIds(new Set(state.renderableInstanceIds));
    },
    [workspaceId]
  );

  const create = useCallback(
    async (name: string, description: string, templateId?: string) => {
      try {
        const layout = await createAnalyticsLayoutAction(name, description, templateId, workspaceId);
        await refresh(layout.id);
        return layout;
      } catch (error) {
        logAnalyticsError("Failed to create analytics dashboard", error);
        throw error;
      }
    },
    [workspaceId, refresh]
  );

  const clone = useCallback(
    async (id: string, name: string) => {
      try {
        const layout = await cloneAnalyticsLayoutAction(id, name, workspaceId);
        if (layout) await refresh(layout.id);
        return layout;
      } catch (error) {
        logAnalyticsError("Failed to clone analytics dashboard", error);
        throw error;
      }
    },
    [workspaceId, refresh]
  );

  const rename = useCallback(
    async (id: string, name: string) => {
      try {
        await renameAnalyticsLayoutAction(id, name);
        await refresh();
      } catch (error) {
        logAnalyticsError("Failed to rename analytics dashboard", error);
        throw error;
      }
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await removeAnalyticsLayoutAction(id, workspaceId);
        if (activeId === id) setActiveId(DEFAULT_ACTIVE_ID);
        await refresh();
      } catch (error) {
        logAnalyticsError("Failed to delete analytics dashboard", error);
        throw error;
      }
    },
    [workspaceId, activeId, refresh]
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const layout = layouts.find(l => l.id === id);
      if (!layout) return;
      await toggleAnalyticsLayoutFavoriteAction(id, !layout.isFavorite);
      await refresh();
    },
    [layouts, refresh]
  );

  const setAsDefault = useCallback(
    async (id: string) => {
      await setDefaultAnalyticsLayoutAction(id, workspaceId);
      await refresh(id);
    },
    [workspaceId, refresh]
  );

  const saveAsTemplate = useCallback(
    async (sourceId: string, name: string, visibility: DashboardLayoutTemplateVisibility) => {
      try {
        const template = await saveAnalyticsLayoutAsTemplateAction(sourceId, name, visibility, workspaceId);
        await refresh();
        return template;
      } catch (error) {
        logAnalyticsError("Failed to save analytics dashboard as template", error);
        throw error;
      }
    },
    [workspaceId, refresh]
  );

  const resetToTemplate = useCallback(
    async (id: string) => {
      const updated = await resetAnalyticsLayoutAction(id, workspaceId);
      if (updated) mergeLayout(updated);
    },
    [workspaceId, mergeLayout]
  );

  const resetWidget = useCallback(
    async (instanceId: string) => {
      if (!active) return;
      const updated = await resetAnalyticsWidgetAction(active.id, instanceId, workspaceId);
      if (updated) mergeLayout(updated);
    },
    [active, workspaceId, mergeLayout]
  );

  /** `visibleSubset` is entitlement/permission-filtered — merged back into the full underlying widget array before saving, same as Dashboard's hook. */
  const updateWidgets = useCallback(
    async (visibleSubset: AnalyticsWidgetConfig[]) => {
      if (!active) return;
      const byId = new Map(visibleSubset.map(w => [w.instanceId, w]));
      const merged = active.widgets.map(w => byId.get(w.instanceId) ?? w);
      const updated = await updateAnalyticsWidgetsAction(active.id, merged, workspaceId);
      if (updated) mergeLayout(updated);
    },
    [active, workspaceId, mergeLayout]
  );

  const addWidget = useCallback(
    async (key: AnalyticsWidgetKey) => {
      if (!active) return;
      const updated = await addAnalyticsWidgetAction(active.id, key, workspaceId);
      if (updated) mergeLayout(updated);
    },
    [active, workspaceId, mergeLayout]
  );

  const removeWidget = useCallback(
    async (instanceId: string) => {
      if (!active) return;
      const updated = await removeAnalyticsWidgetAction(active.id, instanceId, workspaceId);
      if (updated) mergeLayout(updated);
    },
    [active, workspaceId, mergeLayout]
  );

  const duplicateWidget = useCallback(
    async (instanceId: string) => {
      if (!active) return;
      const updated = await duplicateAnalyticsWidgetAction(active.id, instanceId, workspaceId);
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
