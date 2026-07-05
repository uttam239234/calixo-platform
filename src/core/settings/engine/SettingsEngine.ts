/**
 * Calixo Platform - Settings Engine
 *
 * Loads, saves, validates, resets, and tracks change history for
 * settings. No persistence lives here — it delegates all storage to an
 * injected SettingsStorageProvider (in-memory by default), so swapping
 * in a real backend later never requires changing this engine.
 */

import { generateId } from "@/shared/utils/string";
import { settingsRegistry, SettingsRegistry } from "../registry/SettingsRegistry";
import { memoryStorageProvider } from "../storage/SettingsStorageProvider";
import { settingsValidationEngine, SettingsValidationEngine } from "../validation/SettingsValidationEngine";
import type { SettingsChangeRecord, SettingsSaveResult, SettingsStorageProvider } from "../types";
import type { ModuleCategory } from "@/core/modules/ModuleTypes";

export class SettingsEngine {
  constructor(
    private registry: SettingsRegistry = settingsRegistry,
    private storage: SettingsStorageProvider = memoryStorageProvider,
    private validationEngine: SettingsValidationEngine = settingsValidationEngine
  ) {}

  private dirtyKeys: Set<string> = new Set();
  private history: SettingsChangeRecord[] = [];

  /** Reads the current effective value: a saved override if present, else the definition's currentValue, else its defaultValue. */
  load(key: string): unknown {
    if (this.storage.has(key)) return this.storage.get(key);
    const setting = this.registry.lookupByKey(key);
    return setting ? setting.currentValue ?? setting.defaultValue : undefined;
  }

  save(key: string, value: unknown): SettingsSaveResult {
    const setting = this.registry.lookupByKey(key);
    if (!setting) return { success: false, errors: [`Unknown setting: ${key}`] };
    if (setting.readonly) return { success: false, errors: [`Setting is read-only: ${key}`] };

    const validation = this.validationEngine.validate(value, setting.validation);
    if (!validation.valid) return { success: false, errors: validation.issues };

    const previousValue = this.load(key);
    this.storage.set(key, value);
    this.dirtyKeys.delete(key);
    this.recordChange(key, "save", previousValue, value);
    return { success: true, errors: [], value };
  }

  reset(key: string): SettingsSaveResult {
    const setting = this.registry.lookupByKey(key);
    if (!setting) return { success: false, errors: [`Unknown setting: ${key}`] };

    const previousValue = this.load(key);
    this.storage.set(key, setting.defaultValue);
    this.dirtyKeys.delete(key);
    this.recordChange(key, "reset", previousValue, setting.defaultValue);
    return { success: true, errors: [], value: setting.defaultValue };
  }

  resetAll(params: { module?: ModuleCategory } = {}): void {
    for (const setting of this.registry.list()) {
      if (params.module && setting.module !== params.module) continue;
      this.reset(setting.key);
    }
  }

  markDirty(key: string): void {
    this.dirtyKeys.add(key);
  }

  clearDirty(key: string): void {
    this.dirtyKeys.delete(key);
  }

  isDirty(key: string): boolean {
    return this.dirtyKeys.has(key);
  }

  getDirtyKeys(): string[] {
    return Array.from(this.dirtyKeys);
  }

  getHistory(key?: string): SettingsChangeRecord[] {
    return key ? this.history.filter(h => h.key === key) : [...this.history];
  }

  private recordChange(key: string, action: SettingsChangeRecord["action"], previousValue: unknown, newValue: unknown): void {
    this.history.push({ id: generateId(12), key, action, previousValue, newValue, timestamp: new Date().toISOString() });
  }
}

export const settingsEngine = new SettingsEngine();
