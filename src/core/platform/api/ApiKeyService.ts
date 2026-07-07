/**
 * Calixo Platform - API Key Service
 *
 * Makes the Access Control Platform's `ApiClientRegistry` (Track 1 Phase 3)
 * real: that registry always had genuine registration/scope-check logic
 * but explicitly "zero real key issuance, HTTP layer, or crypto." This is
 * the fix — real random key generation (Web Crypto, the same convention
 * `SecretVault`/`WebhookSigningService` already established), real
 * SHA-256 hashing for storage/lookup (a plaintext key is only ever visible
 * once, at issuance — standard API key hygiene), and real verification.
 */
import { apiClientRegistry } from "../access/apiAuth/ApiClientRegistry";
import type { ApiKeyDefinition } from "../access/apiAuth/types";
import { platformEventBus } from "../events/PlatformEventBus";
import type { IssuedApiKey } from "./types";

const KEY_PREFIX = "calx";

function randomKeySegment(bytes: number): string {
  return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(bytes)))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256(value: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export class ApiKeyService {
  async issue(organizationId: string, name: string, scopes: string[]): Promise<IssuedApiKey> {
    const id = randomKeySegment(8);
    const secret = randomKeySegment(24);
    const plaintextKey = `${KEY_PREFIX}_${id}_${secret}`;
    const keyPrefix = plaintextKey.slice(0, KEY_PREFIX.length + 1 + id.length + 5);
    const keyHash = await sha256(plaintextKey);

    const definition: ApiKeyDefinition = {
      id,
      organizationId,
      name,
      keyPrefix,
      keyHash,
      scopes,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    apiClientRegistry.registerApiKey(definition);

    await platformEventBus.publish({ type: "ApiKeyCreated", organizationId, payload: { apiKeyId: id, name } });

    return { id, organizationId, name, plaintextKey, keyPrefix, scopes };
  }

  /** Verifies a plaintext key presented on a request and returns its (active) definition, or `null`. Also stamps `lastUsedAt`. */
  async verify(plaintextKey: string): Promise<ApiKeyDefinition | null> {
    const parts = plaintextKey.split("_");
    if (parts.length !== 3 || parts[0] !== KEY_PREFIX) return null;

    const definition = apiClientRegistry.getApiKey(parts[1]);
    if (!definition || !definition.isActive || !definition.keyHash) return null;

    const hash = await sha256(plaintextKey);
    if (hash !== definition.keyHash) return null;
    if (definition.expiresAt && new Date(definition.expiresAt).getTime() < Date.now()) return null;

    definition.lastUsedAt = new Date().toISOString();
    return definition;
  }

  hasScope(definition: ApiKeyDefinition, permission: string): boolean {
    return apiClientRegistry.apiKeyHasScope(definition.id, permission);
  }

  async revoke(apiKeyId: string, organizationId: string): Promise<boolean> {
    const revoked = apiClientRegistry.revokeApiKey(apiKeyId);
    if (revoked) {
      await platformEventBus.publish({ type: "ApiKeyRevoked", organizationId, payload: { apiKeyId } });
    }
    return revoked;
  }

  listForOrganization(organizationId: string): ApiKeyDefinition[] {
    return apiClientRegistry.listApiKeysForOrganization(organizationId);
  }
}

export const apiKeyService = new ApiKeyService();
