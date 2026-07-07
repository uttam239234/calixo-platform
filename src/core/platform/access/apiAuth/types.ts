/** Calixo Platform - API Authorization Extension Points (architecture only — no real HTTP/API layer, no key issuance/crypto, per the mandate). */

export type ApiClientType = "internal" | "public" | "webhook" | "connector" | "graphql" | "service-account" | "machine-account";

export interface ApiKeyDefinition {
  id: string;
  organizationId: string;
  name: string;
  /** Display-only prefix. */
  keyPrefix: string;
  /**
   * SHA-256 hash of the real, once-only-shown plaintext key — added by the
   * Enterprise API, Gateway & Developer Platform (Track 1 Phase 6), which
   * is the first phase to actually issue/verify real keys (see
   * `ApiKeyService.ts`). Optional so the type stays backward-compatible
   * with any definition registered before real issuance existed.
   */
  keyHash?: string;
  scopes: string[];
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
}

export interface ServiceAccount {
  id: string;
  organizationId: string;
  name: string;
  type: ApiClientType;
  scopes: string[];
  isActive: boolean;
  createdAt: string;
}

export interface OAuthClientDefinition {
  id: string;
  organizationId: string;
  name: string;
  redirectUris: string[];
  scopes: string[];
  isActive: boolean;
  createdAt: string;
}
