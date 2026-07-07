"use client";

/**
 * Calixo Platform - Dashboard personalization preferences.
 * The only place allowed to call SettingsEngine for Dashboard's own keys
 * (landing layout, refresh interval, favourites, recently viewed).
 * Values apply immediately — these are background preferences, not a
 * pending-edit form like the Settings Center screen.
 */

import { useCallback, useEffect, useState } from "react";
import { settingsEngine } from "@/core/settings";

const KEYS = {
  landing: "dashboard.landingLayoutId",
  refresh: "dashboard.refreshIntervalSec",
  favouriteWidgets: "dashboard.favouriteWidgets",
  favouriteLayouts: "dashboard.favouriteLayouts",
  recentlyViewed: "dashboard.recentlyViewedLayouts",
} as const;

export function useDashboardPreferences() {
  const [landingLayoutId, setLandingLayoutIdState] = useState<string>("layout-personal");
  const [refreshIntervalSec, setRefreshIntervalSecState] = useState<number>(0);
  const [favouriteWidgets, setFavouriteWidgets] = useState<string[]>([]);
  const [favouriteLayouts, setFavouriteLayouts] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  const refresh = useCallback(() => {
    setLandingLayoutIdState((settingsEngine.load(KEYS.landing) as string) ?? "layout-personal");
    setRefreshIntervalSecState((settingsEngine.load(KEYS.refresh) as number) ?? 0);
    setFavouriteWidgets((settingsEngine.load(KEYS.favouriteWidgets) as string[]) ?? []);
    setFavouriteLayouts((settingsEngine.load(KEYS.favouriteLayouts) as string[]) ?? []);
    setRecentlyViewed((settingsEngine.load(KEYS.recentlyViewed) as string[]) ?? []);
  }, []);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const setLandingLayoutId = useCallback(
    (id: string) => {
      settingsEngine.save(KEYS.landing, id);
      refresh();
    },
    [refresh]
  );

  const setRefreshIntervalSec = useCallback(
    (seconds: number) => {
      settingsEngine.save(KEYS.refresh, seconds);
      refresh();
    },
    [refresh]
  );

  const toggleFavouriteWidget = useCallback(
    (key: string) => {
      const current = (settingsEngine.load(KEYS.favouriteWidgets) as string[]) ?? [];
      const next = current.includes(key) ? current.filter(k => k !== key) : [...current, key];
      settingsEngine.save(KEYS.favouriteWidgets, next);
      refresh();
    },
    [refresh]
  );

  const toggleFavouriteLayout = useCallback(
    (id: string) => {
      const current = (settingsEngine.load(KEYS.favouriteLayouts) as string[]) ?? [];
      const next = current.includes(id) ? current.filter(l => l !== id) : [...current, id];
      settingsEngine.save(KEYS.favouriteLayouts, next);
      refresh();
    },
    [refresh]
  );

  const recordRecentlyViewed = useCallback(
    (id: string) => {
      const current = (settingsEngine.load(KEYS.recentlyViewed) as string[]) ?? [];
      const next = [id, ...current.filter(l => l !== id)].slice(0, 5);
      settingsEngine.save(KEYS.recentlyViewed, next);
      refresh();
    },
    [refresh]
  );

  return {
    landingLayoutId,
    setLandingLayoutId,
    refreshIntervalSec,
    setRefreshIntervalSec,
    favouriteWidgets,
    toggleFavouriteWidget,
    favouriteLayouts,
    toggleFavouriteLayout,
    recentlyViewed,
    recordRecentlyViewed,
    refresh,
  };
}
