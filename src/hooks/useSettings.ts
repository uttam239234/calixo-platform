"use client";

/**
 * Calixo Settings Center - settings list/detail/edit state.
 * The only place allowed to call SettingsRegistry and SettingsEngine for
 * the "current settings" concern — components never import either
 * directly.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { settingsRegistry, settingsEngine } from "@/core/settings";
import type { SettingDefinition, SettingsGroupId, SettingsSaveResult } from "@/core/settings";
import type { ModuleCategory } from "@/core/modules/ModuleTypes";

export function useSettings() {
  const [settings, setSettings] = useState<SettingDefinition[]>([]);
  const [currentGroup, setCurrentGroup] = useState<SettingsGroupId | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [selectedSettingKey, setSelectedSettingKey] = useState<string | null>(null);
  const [pendingEdits, setPendingEdits] = useState<Record<string, unknown>>({});
  const [dirtyKeys, setDirtyKeys] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const refresh = useCallback(() => {
    setSettings(settingsRegistry.list());
    setDirtyKeys(settingsEngine.getDirtyKeys());
  }, []);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const selectedSetting = useMemo(() => settings.find(s => s.key === selectedSettingKey) ?? null, [settings, selectedSettingKey]);

  const valueFor = useCallback(
    (key: string): unknown => (key in pendingEdits ? pendingEdits[key] : settingsEngine.load(key)),
    [pendingEdits]
  );

  const editValue = useCallback((key: string, value: unknown) => {
    setPendingEdits(prev => ({ ...prev, [key]: value }));
    settingsEngine.markDirty(key);
    setDirtyKeys(settingsEngine.getDirtyKeys());
  }, []);

  const discardEdit = useCallback((key: string) => {
    setPendingEdits(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    settingsEngine.clearDirty(key);
    setDirtyKeys(settingsEngine.getDirtyKeys());
  }, []);

  const discardAll = useCallback(() => {
    for (const key of Object.keys(pendingEdits)) settingsEngine.clearDirty(key);
    setPendingEdits({});
    setDirtyKeys(settingsEngine.getDirtyKeys());
  }, [pendingEdits]);

  const saveKey = useCallback(
    (key: string): SettingsSaveResult => {
      const result = settingsEngine.save(key, pendingEdits[key]);
      if (result.success) {
        setPendingEdits(prev => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
      setDirtyKeys(settingsEngine.getDirtyKeys());
      return result;
    },
    [pendingEdits]
  );

  const saveGroup = useCallback(
    (group: SettingsGroupId): SettingsSaveResult[] => {
      const keys = settingsRegistry
        .list({ group })
        .map(s => s.key)
        .filter(k => k in pendingEdits);
      return keys.map(saveKey);
    },
    [pendingEdits, saveKey]
  );

  const saveAll = useCallback((): SettingsSaveResult[] => {
    return Object.keys(pendingEdits).map(saveKey);
  }, [pendingEdits, saveKey]);

  const resetKey = useCallback(
    (key: string): SettingsSaveResult => {
      const result = settingsEngine.reset(key);
      discardEdit(key);
      refresh();
      return result;
    },
    [discardEdit, refresh]
  );

  const resetGroup = useCallback(
    (group: SettingsGroupId): void => {
      for (const setting of settingsRegistry.list({ group })) {
        settingsEngine.reset(setting.key);
        discardEdit(setting.key);
      }
      refresh();
    },
    [discardEdit, refresh]
  );

  const resetAll = useCallback(
    (params: { module?: ModuleCategory } = {}): void => {
      settingsEngine.resetAll(params);
      setPendingEdits({});
      setDirtyKeys(settingsEngine.getDirtyKeys());
      refresh();
    },
    [refresh]
  );

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const groupByModule = useCallback(() => settingsRegistry.groupByModule(), []);
  const groupByCategory = useCallback(() => settingsRegistry.groupByCategory(), []);

  const favoriteSettings = useMemo(() => settings.filter(s => favorites.has(s.id)), [settings, favorites]);
  const experimentalSettings = useMemo(() => settings.filter(s => s.experimental), [settings]);
  const changedCount = dirtyKeys.length;

  return {
    settings,
    currentGroup,
    setCurrentGroup,
    currentCategory,
    setCurrentCategory,
    selectedSettingKey,
    setSelectedSettingKey,
    selectedSetting,
    valueFor,
    editValue,
    discardEdit,
    discardAll,
    saveKey,
    saveGroup,
    saveAll,
    resetKey,
    resetGroup,
    resetAll,
    dirtyKeys,
    changedCount,
    pendingEdits,
    favorites,
    favoriteSettings,
    toggleFavorite,
    experimentalSettings,
    groupByModule,
    groupByCategory,
    refresh,
  };
}

export type UseSettingsResult = ReturnType<typeof useSettings>;
