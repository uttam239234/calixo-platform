"use client";

/**
 * Calixo Settings Center - feature-flagged settings state.
 * The only place allowed to call SettingsRegistry for this concern.
 * Toggle state is UI-only — never persisted, per spec.
 */

import { useCallback, useEffect, useState } from "react";
import { settingsRegistry } from "@/core/settings";
import type { SettingDefinition } from "@/core/settings";

export function useFeatureFlags() {
  const [flaggedSettings, setFlaggedSettings] = useState<SettingDefinition[]>([]);
  const [toggles, setToggles] = useState<Record<string, boolean>>({});

  const refresh = useCallback(() => {
    setFlaggedSettings(settingsRegistry.list().filter(s => !!s.featureFlag));
  }, []);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const isEnabled = useCallback((flag: string): boolean => toggles[flag] ?? true, [toggles]);

  const toggle = useCallback((flag: string) => {
    setToggles(prev => ({ ...prev, [flag]: !(prev[flag] ?? true) }));
  }, []);

  return { flaggedSettings, isEnabled, toggle, refresh };
}
