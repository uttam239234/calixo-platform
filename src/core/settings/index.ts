/**
 * Calixo Platform - Enterprise Settings Platform Foundation
 *
 * Reusable, module-agnostic settings building blocks: registry, engine,
 * groups, validation, search, storage abstraction, and defaults.
 * Modules integrate by calling `registerSettings()` — nothing here
 * should ever require modification to support a new module or setting.
 *
 * This is the foundation only: no UI, no authentication, no real
 * persistence.
 */

import { registerDefaultGroups } from "./groups/defaultGroups";
import { registerDefaultSettings } from "./defaults/DefaultSettingsProvider";

export * from "./types";

export { SettingsRegistry, settingsRegistry, registerSettings } from "./registry/SettingsRegistry";
export { SettingsEngine, settingsEngine } from "./engine/SettingsEngine";
export { SettingsGroupRegistry, settingsGroupRegistry } from "./groups/SettingsGroupRegistry";
export { registerDefaultGroups } from "./groups/defaultGroups";
export { SettingsValidationEngine, settingsValidationEngine } from "./validation/SettingsValidationEngine";
export { SettingsSearchEngine, settingsSearchEngine } from "./search/SettingsSearchEngine";
export { MemoryStorageProvider, memoryStorageProvider } from "./storage/SettingsStorageProvider";
export { registerDefaultSettings } from "./defaults/DefaultSettingsProvider";
export { registerSettingsSkills } from "./skills/registerSettingsSkills";

export { seedSettingsPlatformMockData } from "./mock/seed";
export type { SettingsMockSeedResult } from "./mock/seed";
export { generateMockSettings } from "./mock/mockSettings";
export { generateMockValidationRules } from "./mock/mockValidationRules";
export { generateMockFeatureFlags } from "./mock/mockFeatureFlags";
export { generateMockSavedValues } from "./mock/mockSavedValues";
export type { MockSavedValue } from "./mock/mockSavedValues";

let initialized = false;

/** Registers the small foundational set of default groups and settings. Safe to call more than once. */
export function initializeSettingsFoundation(): void {
  if (initialized) return;
  registerDefaultGroups();
  registerDefaultSettings();
  initialized = true;
}
