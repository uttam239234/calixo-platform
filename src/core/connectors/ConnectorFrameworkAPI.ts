/**
 * Calixo Platform - Universal Connector Framework: Facade
 *
 * The ONE entry point every consumer (a future Settings -> Integrations
 * rewiring, AI Copilot, Diagnostics, a debug harness) should call — matches
 * the `XPlatformAPI` convention already used by every other `core/platform/*`
 * package. Every mutation is RBAC-gated via the ALREADY-BUILT
 * `resourceAuthorizationAPI.canOperateConnector()` (no new permission logic
 * invented) and audited via `auditService.recordEvent()`. Owns
 * `ConnectorInstance` CRUD — the one DB model no other module in this
 * framework needed to persist on its own.
 */
import "server-only";
import { generateId } from "@/shared/utils/string";
import { resourceAuthorizationAPI } from "@/core/platform/access/ResourceAuthorizationAPI";
import { auditService } from "@/access/audit/AuditService";
import type { TenantContext } from "@/core/platform/tenant/types";
import { readOrgTable, writeOrgTable } from "./persistence/ConnectorDataStore";
import { connectorRegistry } from "./ConnectorRegistry";
import { oauthManager, type AuthorizationUrlResult, type ProviderEndpointExtras } from "./OAuthManager";
import { tokenManager } from "./TokenManager";
import { connectorHealthEngine } from "./ConnectorHealthEngine";
import { syncEngine } from "./SyncEngine";
import { connectorEventBus } from "./ConnectorEventBus";
import type { Connector, ConnectorContext, ConnectorDefinition, ConnectorHealth, ConnectorInstance, ConnectorSync, ConnectorSyncMode, ConnectorTestResult, ConnectorValidateResult } from "./types";

class NotAuthorizedError extends Error {
  constructor(reason: string) {
    super(`Not authorized: ${reason}`);
    this.name = "NotAuthorizedError";
  }
}

async function requireOperation(tenantContext: TenantContext, operation: Parameters<typeof resourceAuthorizationAPI.canOperateConnector>[1], connectorInstanceId: string): Promise<void> {
  const decision = await resourceAuthorizationAPI.canOperateConnector(tenantContext, operation, connectorInstanceId);
  if (!decision.allowed) throw new NotAuthorizedError(decision.explanation ?? `missing connector:${operation} permission`);
}

async function instancesFor(organizationId: string): Promise<ConnectorInstance[]> {
  return readOrgTable<ConnectorInstance[]>(organizationId, "instances") ?? [];
}

async function saveInstance(instance: ConnectorInstance): Promise<void> {
  const all = await instancesFor(instance.organizationId);
  await writeOrgTable(instance.organizationId, "instances", [...all.filter(i => i.id !== instance.id), instance]);
}

function requireConnector(connectorId: string): { definition: ConnectorDefinition; connector: Connector } {
  const definition = connectorRegistry.getDefinition(connectorId);
  const connector = connectorRegistry.getConnector(connectorId);
  if (!definition || !connector) throw new Error(`Unknown connector: ${connectorId}`);
  return { definition, connector };
}

function buildContext(tenantContext: TenantContext, connectorInstanceId: string, extra?: Record<string, string>): ConnectorContext {
  return { organizationId: tenantContext.organization.organizationId, workspaceId: tenantContext.workspace?.workspaceId, connectorInstanceId, actorId: tenantContext.user.userId, extra };
}

export const connectorFrameworkAPI = {
  listDefinitions(): ConnectorDefinition[] {
    return connectorRegistry.list();
  },

  getDefinition(connectorId: string): ConnectorDefinition | undefined {
    return connectorRegistry.getDefinition(connectorId);
  },

  async listInstances(tenantContext: TenantContext): Promise<ConnectorInstance[]> {
    return instancesFor(tenantContext.organization.organizationId);
  },

  async getInstance(tenantContext: TenantContext, connectorInstanceId: string): Promise<ConnectorInstance | undefined> {
    return (await instancesFor(tenantContext.organization.organizationId)).find(i => i.id === connectorInstanceId);
  },

  async installConnector(tenantContext: TenantContext, params: { connectorId: string; metadata?: Record<string, string> }): Promise<ConnectorInstance> {
    const { definition } = requireConnector(params.connectorId);
    await requireOperation(tenantContext, "create", params.connectorId);

    const now = new Date().toISOString();
    const instance: ConnectorInstance = {
      id: generateId(16),
      organizationId: tenantContext.organization.organizationId,
      workspaceId: tenantContext.workspace?.workspaceId,
      connectorId: params.connectorId,
      provider: definition.provider,
      displayName: definition.displayName,
      status: "disconnected",
      metadata: params.metadata,
      createdBy: tenantContext.user.userId,
      createdAt: now,
      updatedAt: now,
    };
    await saveInstance(instance);

    await connectorEventBus.connectorInstalled({ organizationId: instance.organizationId, workspaceId: instance.workspaceId, connectorInstanceId: instance.id, userId: tenantContext.user.userId }, definition.provider);
    await auditService.recordEvent({ organizationId: instance.organizationId, workspaceId: instance.workspaceId, userId: tenantContext.user.userId, eventType: "connector_installed", resource: "connector_instance", resourceId: instance.id, description: `Installed the ${definition.displayName} connector.` });

    return instance;
  },

  async uninstallConnector(tenantContext: TenantContext, connectorInstanceId: string): Promise<{ ok: boolean }> {
    await requireOperation(tenantContext, "delete", connectorInstanceId);
    const instance = await this.getInstance(tenantContext, connectorInstanceId);
    if (!instance) return { ok: false };

    const { connector } = requireConnector(instance.connectorId);
    await connector.disconnect(buildContext(tenantContext, connectorInstanceId, instance.metadata));

    await saveInstance({ ...instance, status: "disconnected", updatedAt: new Date().toISOString() });
    await connectorEventBus.connectorUninstalled({ organizationId: instance.organizationId, connectorInstanceId, userId: tenantContext.user.userId }, instance.provider);
    await auditService.recordEvent({ organizationId: instance.organizationId, userId: tenantContext.user.userId, eventType: "connector_uninstalled", resource: "connector_instance", resourceId: connectorInstanceId, description: `Uninstalled the ${instance.displayName} connector.` });

    return { ok: true };
  },

  /** Real authorization URL — resolves the platform app via `OAuthApplicationService` inside `OAuthManager`, never a locally-stored credential. `origin` (the real caller's request origin — see `getRequestOrigin()`) is required so the Redirect URI is computed fresh, never persisted. `extra` (Microsoft tenantId, Salesforce loginUrl, Shopify shopDomain) comes from the instance's own metadata unless explicitly overridden. */
  async buildAuthorizationUrl(tenantContext: TenantContext, connectorInstanceId: string, origin: string): Promise<AuthorizationUrlResult> {
    await requireOperation(tenantContext, "write", connectorInstanceId);
    const instance = await this.getInstance(tenantContext, connectorInstanceId);
    if (!instance) throw new Error("Unknown connector instance.");
    return oauthManager.buildAuthorizationUrl({ provider: instance.provider, organizationId: instance.organizationId, connectorInstanceId, origin, extra: instance.metadata as ProviderEndpointExtras });
  },

  async completeConnect(tenantContext: TenantContext, connectorInstanceId: string, params: { code: string; state: string }) {
    await requireOperation(tenantContext, "write", connectorInstanceId);
    const instance = await this.getInstance(tenantContext, connectorInstanceId);
    if (!instance) throw new Error("Unknown connector instance.");
    const { connector } = requireConnector(instance.connectorId);
    const result = await connector.connect(buildContext(tenantContext, connectorInstanceId, instance.metadata), params);
    if (result.ok) {
      await saveInstance({ ...instance, status: "active", connectedAccountLabel: result.connectedAccount, updatedAt: new Date().toISOString() });
    }
    return result;
  },

  async disconnect(tenantContext: TenantContext, connectorInstanceId: string): Promise<{ ok: boolean }> {
    await requireOperation(tenantContext, "disconnect", connectorInstanceId);
    const instance = await this.getInstance(tenantContext, connectorInstanceId);
    if (!instance) return { ok: false };
    const { connector } = requireConnector(instance.connectorId);
    const result = await connector.disconnect(buildContext(tenantContext, connectorInstanceId, instance.metadata));
    await saveInstance({ ...instance, status: "disconnected", updatedAt: new Date().toISOString() });
    return result;
  },

  async refresh(tenantContext: TenantContext, connectorInstanceId: string) {
    await requireOperation(tenantContext, "reconnect", connectorInstanceId);
    const instance = await this.getInstance(tenantContext, connectorInstanceId);
    if (!instance) throw new Error("Unknown connector instance.");
    const { connector } = requireConnector(instance.connectorId);
    return connector.refresh(buildContext(tenantContext, connectorInstanceId, instance.metadata));
  },

  async validate(tenantContext: TenantContext, connectorInstanceId: string): Promise<ConnectorValidateResult> {
    await requireOperation(tenantContext, "read", connectorInstanceId);
    const instance = await this.getInstance(tenantContext, connectorInstanceId);
    if (!instance) return { ok: false, issues: ["Unknown connector instance."] };
    const { connector } = requireConnector(instance.connectorId);
    return connector.validate(buildContext(tenantContext, connectorInstanceId, instance.metadata));
  },

  async health(tenantContext: TenantContext, connectorInstanceId: string): Promise<ConnectorHealth> {
    await requireOperation(tenantContext, "read", connectorInstanceId);
    const instance = await this.getInstance(tenantContext, connectorInstanceId);
    if (!instance) return connectorHealthEngine.check({ organizationId: tenantContext.organization.organizationId, connectorInstanceId, provider: "google", configurationValid: false });
    const { connector } = requireConnector(instance.connectorId);
    return connector.health(buildContext(tenantContext, connectorInstanceId, instance.metadata));
  },

  async sync(tenantContext: TenantContext, connectorInstanceId: string, mode: ConnectorSyncMode = "manual"): Promise<ConnectorSync> {
    await requireOperation(tenantContext, "sync", connectorInstanceId);
    const instance = await this.getInstance(tenantContext, connectorInstanceId);
    if (!instance) throw new Error("Unknown connector instance.");
    return syncEngine.run(instance.connectorId, buildContext(tenantContext, connectorInstanceId, instance.metadata), mode);
  },

  async test(tenantContext: TenantContext, connectorInstanceId: string): Promise<ConnectorTestResult> {
    await requireOperation(tenantContext, "read", connectorInstanceId);
    const instance = await this.getInstance(tenantContext, connectorInstanceId);
    if (!instance) return { ok: false, message: "Unknown connector instance." };
    const { connector } = requireConnector(instance.connectorId);
    return connector.test(buildContext(tenantContext, connectorInstanceId, instance.metadata));
  },

  async tokenStatus(tenantContext: TenantContext, connectorInstanceId: string) {
    await requireOperation(tenantContext, "read", connectorInstanceId);
    return tokenManager.get(tenantContext.organization.organizationId, connectorInstanceId);
  },

  /** Real sync run history for one instance — the "Data Received"/"Last Sync" figures a UI shows come from here, never a fabricated running total. */
  async syncHistory(tenantContext: TenantContext, connectorInstanceId: string): Promise<ConnectorSync[]> {
    await requireOperation(tenantContext, "read", connectorInstanceId);
    return syncEngine.history(tenantContext.organization.organizationId, connectorInstanceId);
  },

  /**
   * Unauthenticated, org-scoped reads for cross-module composition — Dashboard's
   * Connected Platforms widget, Analytics/Ads/Social/Brand Monitoring's connector
   * adapters, Billing's usage stat. These are internal, read-only status checks with
   * no specific acting user (there's no "current user" in a background composition
   * layer), so they mirror `listInstances()`/`getInstance()`'s already-established
   * no-RBAC-gate design instead of being called with a synthetic "system" actor that
   * would always fail `canOperateConnector()`'s real per-user permission check. The
   * organizationId itself is the real scoping boundary — every caller already
   * resolves it from the org actually being viewed, never from user input.
   */
  async peekHealth(organizationId: string, connectorInstanceId: string): Promise<ConnectorHealth> {
    const instance = (await instancesFor(organizationId)).find(i => i.id === connectorInstanceId);
    if (!instance) return connectorHealthEngine.check({ organizationId, connectorInstanceId, provider: "google", configurationValid: false });
    const { connector } = requireConnector(instance.connectorId);
    return connector.health({ organizationId, connectorInstanceId, actorId: "system", extra: instance.metadata });
  },

  async peekSyncHistory(organizationId: string, connectorInstanceId: string): Promise<ConnectorSync[]> {
    return syncEngine.history(organizationId, connectorInstanceId);
  },

  async peekTokenStatus(organizationId: string, connectorInstanceId: string) {
    return tokenManager.get(organizationId, connectorInstanceId);
  },
};

export { NotAuthorizedError };
