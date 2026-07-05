/**
 * Calixo Platform - Settings Storage
 *
 * Architecture only. `MemoryStorageProvider` is the only implementation
 * this foundation ships — it satisfies the `SettingsStorageProvider`
 * interface so a future `LocalStorageProvider`, `DatabaseProvider`, or
 * `CloudProvider` can be swapped in via constructor injection without
 * SettingsEngine ever changing.
 */

import type { SettingsStorageProvider } from "../types";

export class MemoryStorageProvider implements SettingsStorageProvider {
  readonly name = "memory";
  private store: Map<string, unknown> = new Map();

  get(key: string): unknown | undefined {
    return this.store.get(key);
  }

  set(key: string, value: unknown): void {
    this.store.set(key, value);
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  keys(): string[] {
    return Array.from(this.store.keys());
  }

  clear(): void {
    this.store.clear();
  }
}

export const memoryStorageProvider = new MemoryStorageProvider();
