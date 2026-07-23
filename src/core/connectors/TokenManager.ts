/**
 * Calixo Platform - Universal Connector Framework: Token Manager
 *
 * Stores ONLY organization-level connector tokens — access token, refresh
 * token, expiry, scopes, connected account, provider user id, status.
 * NEVER a platform Client ID/Secret; those live exclusively in Platform
 * Secrets and are resolved through `OAuthApplicationService` by
 * `OAuthManager.ts`, never duplicated here.
 *
 * A DEDICATED `SecretVault` instance — its own isolated AES-256-GCM key,
 * separate from the Platform Secrets vault, the OAuth Applications vault,
 * AND the legacy `src/integrations/secrets/SecretVault.ts` `secretVault`
 * singleton — matching this codebase's established convention that each
 * major subsystem gets its own vault (defense in depth: a compromised key
 * in one subsystem never exposes another's secrets). Persisted via the
 * SAME `PlatformConfigFileStore` the other platform vaults use (the
 * vault's own state — one keyring plus a map of small ciphertext blobs —
 * is a legitimately global, singleton concern; per-organization CREDENTIAL
 * METADATA, in contrast, is stored per-organization via
 * `persistence/ConnectorDataStore.ts`, never one global table).
 */
import "server-only";
import { SecretVault, type VaultExportState } from "@/integrations/secrets/SecretVault";
import { readTable, writeTable } from "@/core/platform/configStore/PlatformConfigFileStore";
import { readOrgTable, writeOrgTable } from "./persistence/ConnectorDataStore";
import { auditService } from "@/access/audit/AuditService";
import { generateId } from "@/shared/utils/string";
import type { ConnectorCredential, ConnectorProviderId } from "./types";

const connectorTokenVault = new SecretVault();

let readyPromise: Promise<void> | null = null;
function ensureReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = (async () => {
      const persisted = readTable<VaultExportState>("connector_token_vault");
      if (persisted) await connectorTokenVault.importState(persisted);
    })();
  }
  return readyPromise;
}

async function persistVault(): Promise<void> {
  await writeTable("connector_token_vault", await connectorTokenVault.exportState());
}

async function credentialsFor(organizationId: string): Promise<ConnectorCredential[]> {
  return readOrgTable<ConnectorCredential[]>(organizationId, "credentials") ?? [];
}

async function saveCredential(record: ConnectorCredential): Promise<void> {
  const all = await credentialsFor(record.organizationId);
  const next = all.filter(c => c.connectorInstanceId !== record.connectorInstanceId);
  next.push(record);
  await writeOrgTable(record.organizationId, "credentials", next);
}

export interface StoreTokenInput {
  accessToken: string;
  refreshToken?: string;
  scopes: string[];
  connectedAccount?: string;
  providerUserId?: string;
  expiresAt?: string;
}

export const tokenManager = {
  vault: connectorTokenVault,

  async get(organizationId: string, connectorInstanceId: string): Promise<ConnectorCredential | undefined> {
    await ensureReady();
    const all = await credentialsFor(organizationId);
    return all.find(c => c.connectorInstanceId === connectorInstanceId);
  },

  async store(organizationId: string, connectorInstanceId: string, provider: ConnectorProviderId, input: StoreTokenInput, actorId: string): Promise<ConnectorCredential> {
    await ensureReady();
    const existing = await this.get(organizationId, connectorInstanceId);
    if (existing?.sealedAccessTokenRef) connectorTokenVault.revoke(existing.sealedAccessTokenRef);
    if (existing?.sealedRefreshTokenRef) connectorTokenVault.revoke(existing.sealedRefreshTokenRef);

    const now = new Date().toISOString();
    const record: ConnectorCredential = {
      id: existing?.id ?? generateId(16),
      organizationId,
      connectorInstanceId,
      provider,
      sealedAccessTokenRef: await connectorTokenVault.seal(input.accessToken),
      sealedRefreshTokenRef: input.refreshToken ? await connectorTokenVault.seal(input.refreshToken) : undefined,
      scopes: input.scopes,
      connectedAccount: input.connectedAccount ?? existing?.connectedAccount,
      providerUserId: input.providerUserId ?? existing?.providerUserId,
      expiresAt: input.expiresAt,
      status: "active",
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await saveCredential(record);
    await persistVault();

    await auditService.recordEvent({
      organizationId,
      userId: actorId,
      eventType: existing ? "connector_token_refreshed" : "connector_credential_stored",
      resource: "connector_credential",
      resourceId: connectorInstanceId,
      description: `${existing ? "Refreshed" : "Stored"} ${provider} credentials for connector ${connectorInstanceId}.`,
    });

    return record;
  },

  async revoke(organizationId: string, connectorInstanceId: string, actorId: string): Promise<void> {
    await ensureReady();
    const existing = await this.get(organizationId, connectorInstanceId);
    if (!existing) return;
    if (existing.sealedAccessTokenRef) connectorTokenVault.revoke(existing.sealedAccessTokenRef);
    if (existing.sealedRefreshTokenRef) connectorTokenVault.revoke(existing.sealedRefreshTokenRef);

    const record: ConnectorCredential = { ...existing, sealedAccessTokenRef: undefined, sealedRefreshTokenRef: undefined, status: "revoked", updatedAt: new Date().toISOString() };
    await saveCredential(record);
    await persistVault();

    await auditService.recordEvent({
      organizationId,
      userId: actorId,
      eventType: "connector_credential_revoked",
      resource: "connector_credential",
      resourceId: connectorInstanceId,
      description: `Revoked ${existing.provider} credentials for connector ${connectorInstanceId}.`,
    });
  },

  async revealAccessToken(organizationId: string, connectorInstanceId: string): Promise<string | undefined> {
    await ensureReady();
    const record = await this.get(organizationId, connectorInstanceId);
    if (!record?.sealedAccessTokenRef) return undefined;
    return connectorTokenVault.reveal(record.sealedAccessTokenRef);
  },

  async revealRefreshToken(organizationId: string, connectorInstanceId: string): Promise<string | undefined> {
    await ensureReady();
    const record = await this.get(organizationId, connectorInstanceId);
    if (!record?.sealedRefreshTokenRef) return undefined;
    return connectorTokenVault.reveal(record.sealedRefreshTokenRef);
  },

  isExpired(record: Pick<ConnectorCredential, "expiresAt">, skewMs = 60_000): boolean {
    if (!record.expiresAt) return false;
    return new Date(record.expiresAt).getTime() - skewMs <= Date.now();
  },

  /**
   * The real "auto refresh, detect expiry" hook the brief asks for. Callers
   * (provider adapters, SyncEngine) pass in the actual refresh operation —
   * TokenManager never talks to a vendor's token endpoint itself (that's
   * `OAuthManager`'s job) — this just decides WHEN to call it and persists
   * the result, so the two modules stay decoupled (no circular import).
   */
  async getValidAccessToken(
    organizationId: string,
    connectorInstanceId: string,
    provider: ConnectorProviderId,
    actorId: string,
    refresh: (refreshToken: string) => Promise<{ accessToken: string; refreshToken?: string; expiresAt?: string }>
  ): Promise<string | undefined> {
    await ensureReady();
    const record = await this.get(organizationId, connectorInstanceId);
    if (!record || record.status !== "active" || !record.sealedAccessTokenRef) return undefined;

    if (!this.isExpired(record)) {
      return connectorTokenVault.reveal(record.sealedAccessTokenRef);
    }

    const refreshToken = record.sealedRefreshTokenRef ? await connectorTokenVault.reveal(record.sealedRefreshTokenRef) : undefined;
    if (!refreshToken) return undefined;

    const refreshed = await refresh(refreshToken);
    await this.store(organizationId, connectorInstanceId, provider, { accessToken: refreshed.accessToken, refreshToken: refreshed.refreshToken ?? refreshToken, scopes: record.scopes, connectedAccount: record.connectedAccount, providerUserId: record.providerUserId, expiresAt: refreshed.expiresAt }, actorId);
    return refreshed.accessToken;
  },

  async listForOrganization(organizationId: string): Promise<ConnectorCredential[]> {
    await ensureReady();
    return credentialsFor(organizationId);
  },
};
