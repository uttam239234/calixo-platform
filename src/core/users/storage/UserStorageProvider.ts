/**
 * Calixo Platform - Users Storage
 *
 * Architecture only. `MemoryUserStorageProvider` is the only implementation
 * this foundation ships — it satisfies the `UserStorageProvider` interface
 * so a future `DatabaseProvider`, `LDAPProvider`, `AzureADProvider`,
 * `GoogleWorkspaceProvider`, or `OktaProvider` can be swapped in via
 * constructor injection without UserEngine ever changing.
 */

import type { UserStorageProvider } from "../types/index";

export class MemoryUserStorageProvider implements UserStorageProvider {
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

export const memoryUserStorageProvider = new MemoryUserStorageProvider();
