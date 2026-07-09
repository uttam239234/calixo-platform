"use client";

/**
 * Calixo Platform - Dashboard layout switcher state.
 * The only place allowed to call DashboardLayoutRegistry directly.
 */

import { useCallback, useEffect, useState } from "react";
import { dashboardLayoutRegistry, dashboardActivityLog, initializeDashboardFoundation, personaForRole } from "@/core/dashboard";
import type { DashboardLayout, DashboardWidgetConfig } from "@/core/dashboard";
import { useUser } from "@/identity/hooks/useAuth";
import { useDashboardPreferences } from "./useDashboardPreferences";

const FALLBACK_USER = "You";

export function useDashboardLayouts() {
  const prefs = useDashboardPreferences();
  const sessionUser = useUser();
  const CURRENT_USER = sessionUser?.name ?? FALLBACK_USER;
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

  /**
   * On a genuine first visit (no explicit `landingLayoutId` ever saved),
   * prefer the system template whose persona matches the session user's
   * role over the hook's own "layout-personal" fallback default — once
   * the user has switched/saved a preference themselves, that always wins.
   */
  useEffect(() => {
    (async () => {
      if (prefs.hasExplicitLandingLayout) {
        if (dashboardLayoutRegistry.lookup(prefs.landingLayoutId)) setActiveId(prefs.landingLayoutId);
        return;
      }
      const persona = personaForRole(sessionUser?.role);
      const match = persona ? layouts.find(l => l.isTemplate && l.persona === persona) : null;
      if (match) setActiveId(match.id);
    })();
  }, [prefs.landingLayoutId, prefs.hasExplicitLandingLayout, sessionUser?.role, layouts]);

  const active = layouts.find(l => l.id === activeId) ?? layouts[0];

  const switchTo = useCallback(
    (id: string) => {
      setActiveId(id);
      prefs.recordRecentlyViewed(id);
      const layout = dashboardLayoutRegistry.lookup(id);
      dashboardActivityLog.record(CURRENT_USER, "switched to", layout?.name ?? id);
    },
    [prefs, CURRENT_USER]
  );

  const create = useCallback(
    (name: string, description: string, templateId?: string) => {
      const layout = dashboardLayoutRegistry.create({ name, description, owner: CURRENT_USER, templateId });
      dashboardActivityLog.record(CURRENT_USER, "created", layout.name);
      refresh();
      switchTo(layout.id);
      return layout;
    },
    [refresh, switchTo, CURRENT_USER]
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
    [refresh, CURRENT_USER]
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
    [refresh, activeId, CURRENT_USER]
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
    [refresh, prefs, CURRENT_USER]
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
