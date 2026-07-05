/**
 * Calixo Platform - Settings Mock Data Seeding
 *
 * Opt-in only — never called automatically. Populates the registry,
 * groups, and storage with realistic demo data (300 settings across 50
 * categories, 100 saved value overrides) for development, demos, and
 * future UI work.
 */

import { settingsRegistry, SettingsRegistry } from "../registry/SettingsRegistry";
import { settingsGroupRegistry, SettingsGroupRegistry } from "../groups/SettingsGroupRegistry";
import { registerDefaultGroups } from "../groups/defaultGroups";
import { memoryStorageProvider } from "../storage/SettingsStorageProvider";
import type { SettingsStorageProvider } from "../types";
import { generateMockSettings } from "./mockSettings";
import { generateMockSavedValues } from "./mockSavedValues";

export interface SettingsMockSeedResult {
  settings: number;
  groups: number;
  categories: number;
  savedValues: number;
  validationRules: number;
  featureFlags: number;
}

export function seedSettingsPlatformMockData(deps: {
  registry?: SettingsRegistry;
  groupRegistry?: SettingsGroupRegistry;
  storage?: SettingsStorageProvider;
} = {}): SettingsMockSeedResult {
  const registry = deps.registry ?? settingsRegistry;
  const groupRegistry = deps.groupRegistry ?? settingsGroupRegistry;
  const storage = deps.storage ?? memoryStorageProvider;

  registerDefaultGroups(groupRegistry);

  const settings = generateMockSettings(300);
  registry.registerMany(settings);

  const savedValues = generateMockSavedValues(settings, 100);
  for (const { key, value } of savedValues) storage.set(key, value);

  return {
    settings: settings.length,
    groups: groupRegistry.count(),
    categories: new Set(settings.map(s => s.category)).size,
    savedValues: savedValues.length,
    validationRules: settings.reduce((sum, s) => sum + s.validation.length, 0),
    featureFlags: settings.filter(s => !!s.featureFlag).length,
  };
}
