"use client";

/**
 * Calixo Platform - Dashboard layout switcher state.
 * The only place allowed to call DashboardLayoutRegistry directly.
 */

import { useCallback, useEffect, useState } from "react";
import { dashboardLayoutRegistry, dashboardActivityLog, initializeDashboardFoundation } from "@/core/dashboard";
import type { DashboardLayout, DashboardWidgetConfig } from "@/core/dashboard";
import { useDashboardPreferences } from "./useDashboardPreferences";

const CURRENT_USER = "You";

export function useDashboardLayouts() {
  const prefs = useDashboardPreferences();
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [activeId, setActiveId] = useState<string>("layout-personal");

  /**
   * Self-initializes the shared Dashboard foundation (which seeds the 9
   * default layouts) before every refresh — mirrors `useNotifications()`'s
   * pattern so this hook doesn't race a sibling component that also calls
   * `initializeDashboardFoundation()` on its own mount effect.
   */
  const refresh = useCallback(async () => {
    await initializeDashboardFoundation();
    setLayouts(dashboardLayoutRegistry.list());
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
    })();
  }, [refresh]);

  useEffect(() => {
    (async () => {
      if (prefs.landingLayoutId && dashboardLayoutRegistry.lookup(prefs.landingLayoutId)) {
        setActiveId(prefs.landingLayoutId);
      }
    })();
  }, [prefs.landingLayoutId]);

  const active = layouts.find(l => l.id === activeId) ?? layouts[0];

  const switchTo = useCallback(
    (id: string) => {
      setActiveId(id);
      prefs.recordRecentlyViewed(id);
      const layout = dashboardLayoutRegistry.lookup(id);
      dashboardActivityLog.record(CURRENT_USER, "switched to", layout?.name ?? id);
    },
    [prefs]
  );

  const create = useCallback(
    (name: string, description: string, templateId?: string) => {
      const layout = dashboardLayoutRegistry.create({ name, description, owner: CURRENT_USER, templateId });
      dashboardActivityLog.record(CURRENT_USER, "created", layout.name);
      refresh();
      switchTo(layout.id);
      return layout;
    },
    [refresh, switchTo]
  );

  const clone = useCallback(
    (id: string, name: string) => {
      const layout = dashboardLayoutRegistry.clone(id, name, CURRENT_USER);
      if (layout) {
        dashboardActivityLog.record(CURRENT_USER, "cloned", layout.name);
        refresh();
      }
      return layout;
    },
    [refresh]
  );

  const rename = useCallback(
    (id: string, name: string) => {
      dashboardLayoutRegistry.rename(id, name);
      refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    (id: string) => {
      const layout = dashboardLayoutRegistry.lookup(id);
      dashboardLayoutRegistry.remove(id);
      if (layout) dashboardActivityLog.record(CURRENT_USER, "deleted", layout.name);
      if (activeId === id) setActiveId("layout-personal");
      refresh();
    },
    [refresh, activeId]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      const layout = dashboardLayoutRegistry.lookup(id);
      if (!layout) return;
      dashboardLayoutRegistry.setFavorite(id, !layout.isFavorite);
      refresh();
    },
    [refresh]
  );

  const setAsDefault = useCallback(
    (id: string) => {
      dashboardLayoutRegistry.setDefault(id, CURRENT_USER);
      prefs.setLandingLayoutId(id);
      refresh();
    },
    [refresh, prefs]
  );

  const resetToTemplate = useCallback(
    (id: string) => {
      dashboardLayoutRegistry.resetToTemplate(id);
      refresh();
    },
    [refresh]
  );

  const updateWidgets = useCallback(
    (id: string, widgets: DashboardWidgetConfig[]) => {
      dashboardLayoutRegistry.updateWidgets(id, widgets);
      refresh();
    },
    [refresh]
  );

  return { layouts, active, activeId, switchTo, create, clone, rename, remove, toggleFavorite, setAsDefault, resetToTemplate, updateWidgets, refresh };
}
