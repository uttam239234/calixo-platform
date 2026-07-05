/**
 * Calixo Platform - Users Storage Types
 *
 * Architecture only. The interface is the durable contract; the only
 * implementation this foundation ships is in-memory. Future providers
 * (Database, LDAP, Azure AD, Google Workspace, Okta) implement this same
 * interface without UserEngine ever changing.
 */

export interface UserStorageProvider {
  readonly name: string;
  get(key: string): unknown | undefined;
  set(key: string, value: unknown): void;
  delete(key: string): boolean;
  has(key: string): boolean;
  keys(): string[];
  clear(): void;
}
