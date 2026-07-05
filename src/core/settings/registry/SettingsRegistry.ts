/**
 * Calixo Platform - Settings Registry
 *
 * The central registry for every setting in the enterprise platform.
 * Settings are contributed by modules (present or future) — nothing
 * here is hardcoded to a specific module.
 */

import { appLogger } from "@/logging";
import type { ModuleCategory } from "@/core/modules/ModuleTypes";
import type { SettingDefinition } from "../types";

export class SettingsRegistry {
  private settings: Map<string, SettingDefinition> = new Map();

  register(setting: SettingDefinition): void {
    if (this.settings.has(setting.id)) {
      appLogger.warn("Settings.SettingsRegistry", `Setting ${setting.id} already registered`);
      return;
    }
    this.settings.set(setting.id, setting);
    appLogger.info("Settings.SettingsRegistry", `Setting registered: ${setting.key} (${setting.module}/${setting.group})`);
  }

  registerMany(settings: SettingDefinition[]): void {
    for (const setting of settings) this.register(setting);
  }

  unregister(id: string): void {
    this.settings.delete(id);
  }

  lookup(id: string): SettingDefinition | undefined {
    return this.settings.get(id);
  }

  lookupByKey(key: string): SettingDefinition | undefined {
    return Array.from(this.settings.values()).find(s => s.key === key);
  }

  list(params: { module?: ModuleCategory; category?: string; group?: SettingDefinition["group"]; tag?: string } = {}): SettingDefinition[] {
    return Array.from(this.settings.values())
      .filter(s => !params.module || s.module === params.module)
      .filter(s => !params.category || s.category === params.category)
      .filter(s => !params.group || s.group === params.group)
      .filter(s => !params.tag || s.tags.includes(params.tag!));
  }

  discover(query: string): SettingDefinition[] {
    const q = query.toLowerCase();
    return this.list().filter(
      s => s.label.toLowerCase().includes(q) || s.key.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  /** Alias kept for API parity with the discover() naming used elsewhere in the platform. */
  search(query: string): SettingDefinition[] {
    return this.discover(query);
  }

  groupByModule(): Partial<Record<ModuleCategory, SettingDefinition[]>> {
    const groups: Partial<Record<ModuleCategory, SettingDefinition[]>> = {};
    for (const setting of this.settings.values()) {
      (groups[setting.module] ??= []).push(setting);
    }
    return groups;
  }

  groupByCategory(): Record<string, SettingDefinition[]> {
    const groups: Record<string, SettingDefinition[]> = {};
    for (const setting of this.settings.values()) {
      (groups[setting.category] ??= []).push(setting);
    }
    return groups;
  }

  count(): number {
    return this.settings.size;
  }
}

export const settingsRegistry = new SettingsRegistry();

/**
 * The single integration point future modules use to contribute settings —
 * no Settings platform code needs to change when a new module calls this.
 */
export function registerSettings(settings: SettingDefinition[], registry: SettingsRegistry = settingsRegistry): void {
  registry.registerMany(settings);
}
