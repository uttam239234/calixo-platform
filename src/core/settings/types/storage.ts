/**
 * Calixo Platform - Settings Storage Types
 *
 * Architecture only. The interface is the durable contract; the only
 * implementation the foundation ships is in-memory. Future providers
 * (LocalStorage, Database, Cloud) implement this same interface.
 */

export interface SettingsStorageProvider {
  readonly name: string;
  get(key: string): unknown | undefined;
  set(key: string, value: unknown): void;
  delete(key: string): boolean;
  has(key: string): boolean;
  keys(): string[];
  clear(): void;
}
