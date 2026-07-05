"use client";

/**
 * Calixo Settings Center - settings group list state.
 * The only place allowed to call SettingsGroupRegistry.
 */

import { useCallback, useEffect, useState } from "react";
import { settingsGroupRegistry } from "@/core/settings";
import type { SettingsGroupDefinition, SettingsGroupId } from "@/core/settings";

export function useSettingGroups() {
  const [groups, setGroups] = useState<SettingsGroupDefinition[]>([]);

  const refresh = useCallback(() => {
    setGroups(settingsGroupRegistry.order());
  }, []);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const search = useCallback((query: string): SettingsGroupDefinition[] => {
    return query.trim() ? settingsGroupRegistry.discover(query) : settingsGroupRegistry.order();
  }, []);

  const lookup = useCallback((id: SettingsGroupId) => settingsGroupRegistry.lookup(id), []);

  return { groups, search, lookup, refresh };
}
