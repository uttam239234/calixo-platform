"use client";

/**
 * Calixo Platform - Analytics dashboard switcher state.
 * The only place allowed to call AnalyticsDashboardRegistry directly.
 * Mirrors `useDashboardLayouts()` exactly — both sit on top of the same
 * shared `core/platform/dashboardBuilder` engine.
 */

import { useCallback, useEffect, useState } from "react";
import { analyticsDashboardRegistry, seedAnalyticsDashboards } from "@/core/analytics";
import type { AnalyticsDashboardLayout, AnalyticsWidgetConfig } from "@/core/analytics";
import { useUser } from "@clerk/nextjs";

const FALLBACK_USER = "You";

export function useAnalyticsDashboards() {
  const { user: sessionUser } = useUser();
  const CURRENT_USER = sessionUser?.fullName ?? sessionUser?.firstName ?? FALLBACK_USER;
  const [layouts, setLayouts] = useState<AnalyticsDashboardLayout[]>([]);
  const [activeId, setActiveId] = useState<string>("analytics-layout-executive");

  const refresh = useCallback(async () => {
    seedAnalyticsDashboards();
    setLayouts(analyticsDashboardRegistry.list());
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
    })();
  }, [refresh]);

  const active = layouts.find(l => l.id === activeId) ?? layouts[0];

  const switchTo = useCallback((id: string) => setActiveId(id), []);

  const create = useCallback(
    (name: string, description: string, templateId?: string) => {
      const layout = analyticsDashboardRegistry.create({ name, description, owner: CURRENT_USER, templateId });
      refresh();
      switchTo(layout.id);
      return layout;
    },
    [refresh, switchTo, CURRENT_USER]
  );

  const clone = useCallback(
    (id: string, name: string) => {
      const layout = analyticsDashboardRegistry.clone(id, name, CURRENT_USER);
      if (layout) refresh();
      return layout;
    },
    [refresh, CURRENT_USER]
  );

  const rename = useCallback(
    (id: string, name: string) => {
      analyticsDashboardRegistry.rename(id, name);
      refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    (id: string) => {
      analyticsDashboardRegistry.remove(id);
      if (activeId === id) setActiveId("analytics-layout-executive");
      refresh();
    },
    [refresh, activeId]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      const layout = analyticsDashboardRegistry.lookup(id);
      if (!layout) return;
      analyticsDashboardRegistry.setFavorite(id, !layout.isFavorite);
      refresh();
    },
    [refresh]
  );

  const setAsDefault = useCallback(
    (id: string) => {
      analyticsDashboardRegistry.setDefault(id, CURRENT_USER);
      refresh();
    },
    [refresh, CURRENT_USER]
  );

  const resetToTemplate = useCallback(
    (id: string) => {
      analyticsDashboardRegistry.resetToTemplate(id);
      refresh();
    },
    [refresh]
  );

  const updateWidgets = useCallback(
    (id: string, widgets: AnalyticsWidgetConfig[]) => {
      analyticsDashboardRegistry.updateWidgets(id, widgets);
      refresh();
    },
    [refresh]
  );

  return { layouts, active, activeId, switchTo, create, clone, rename, remove, toggleFavorite, setAsDefault, resetToTemplate, updateWidgets, refresh };
}
