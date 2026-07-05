/**
 * Calixo Platform - Mock Saved Values Generator
 *
 * Simulates a subset of settings a user has already customized away from
 * their defaults — used to seed a SettingsStorageProvider directly.
 */

import type { SettingDefinition } from "../types";

export interface MockSavedValue {
  key: string;
  value: unknown;
}

function overrideFor(setting: SettingDefinition, i: number): unknown {
  switch (setting.type) {
    case "number":
      return (typeof setting.defaultValue === "number" ? setting.defaultValue : 0) + i + 1;
    case "boolean":
    case "switch":
      return !setting.defaultValue;
    case "text":
    case "textarea":
      return `Customized value ${i}`;
    case "color":
      return "#10B981";
    case "select":
      return setting.options?.[(i + 1) % (setting.options.length || 1)]?.value ?? setting.defaultValue;
    default:
      return setting.defaultValue;
  }
}

export function generateMockSavedValues(settings: SettingDefinition[], count = 100): MockSavedValue[] {
  const eligible = settings.filter(s => !s.readonly);
  const values: MockSavedValue[] = [];
  const limit = Math.min(count, eligible.length);

  for (let i = 0; i < limit; i++) {
    const setting = eligible[i];
    values.push({ key: setting.key, value: overrideFor(setting, i) });
  }

  return values;
}
