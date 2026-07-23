"use server";

/**
 * Calixo Platform - Universal Connector Framework: Server Actions
 *
 * `ConnectorFrameworkAPI` (and everything under it — `TokenManager`,
 * `OAuthManager`, `ConnectorDataStore`) is `import "server-only"`-tagged:
 * it touches real Node `fs` and makes real network calls with platform
 * secrets. But its consumers are NOT all server-only files — Settings ->
 * Integrations' hook, Analytics/Ads/Social/Brand Monitoring's connector
 * adapters, Dashboard's engine, and Billing's usage stat are all reachable
 * from client component bundles. A plain import of the framework from any
 * of those breaks the client build (`Module not found: fs`).
 *
 * Server Actions are the sanctioned bridge: a `"use server"` export is
 * automatically replaced with an RPC stub in the client bundle and keeps
 * its real implementation server-side, regardless of how deep the calling
 * module is in the import graph. Every argument/return value here is
 * plain, serializable data — no `TenantContext` crosses this boundary;
 * each action builds its own server-side via `tenantContextService`.
 */
import { connectorFrameworkAPI, NotAuthorizedError } from "./ConnectorFrameworkAPI";
import { tenantContextService } from "@/core/platform/tenant";
import { resolveIdentity } from "@/identity/bridge/resolveIdentity.server";
import { getRequestOrigin } from "@/shared/server/requestOrigin";
import type { ConnectorCredential, ConnectorDefinition, ConnectorHealth, ConnectorInstance, ConnectorSync, ConnectorSyncMode, ConnectorTestResult, ConnectorValidateResult } from "./types";

/**
 * Every identity-bearing action below re-derives `userId`/`organizationId`
 * from the real, Clerk-verified session itself, via `resolveIdentity()` —
 * never from a client-supplied argument. `resolveCalixoIdentity()` runs
 * independently in the browser (via `useCalixoIdentity()`) and in this
 * server process (via this call), against two disjoint in-memory registry
 * instances that can mint different ids for the same real person; a
 * Server Action that trusted whichever id the client happened to resolve
 * would authorize against an organization/user this server process has
 * never granted any role to. Matches the pattern already established in
 * `src/features/content/actions.ts`.
 */
async function requireIdentity() {
  const identity = await resolveIdentity();
  if (!identity) throw new NotAuthorizedError("Sign in required.");
  return identity;
}

async function userContext(organizationId: string, userId: string) {
  return tenantContextService.resolve({ organizationId, userId });
}

async function systemContext(organizationId: string) {
  return tenantContextService.createSystemContext(organizationId);
}

// ============================================================================
// Org-agnostic catalog reads — no tenant context needed at all.
// ============================================================================

export async function listConnectorDefinitionsAction(): Promise<ConnectorDefinition[]> {
  return connectorFrameworkAPI.listDefinitions();
}

export async function getConnectorDefinitionAction(connectorId: string): Promise<ConnectorDefinition | undefined> {
  return connectorFrameworkAPI.getDefinition(connectorId);
}

// ============================================================================
// Read-only, system-context actions — for cross-module status adapters
// (Analytics/Ads/Social/Brand Monitoring/Dashboard/Billing) with no specific
// acting user beyond "whoever's session is making this request." Every real
// call site wants the current signed-in session's own organization — there
// is no legitimate cross-org read in this codebase — so organizationId is
// derived from `resolveIdentity()`, never accepted as a parameter.
// `listInstances` has no RBAC gate on the facade; health/syncHistory/
// tokenStatus DO (they require a real per-user permission via
// `resourceAuthorizationAPI.canOperateConnector()`, which a synthetic
// "system" actor can never satisfy in a real organization — confirmed live
// during verification, not assumed) — those three go through the facade's
// unauthenticated `peek*` methods instead, matching `listInstances()`'s own
// no-RBAC-gate design for exactly this cross-module composition use case.
// ============================================================================

export async function listConnectorInstancesAction(): Promise<ConnectorInstance[]> {
  const { organizationId } = await requireIdentity();
  const tenantContext = await systemContext(organizationId);
  return connectorFrameworkAPI.listInstances(tenantContext);
}

export async function getConnectorHealthAction(connectorInstanceId: string): Promise<ConnectorHealth> {
  const { organizationId } = await requireIdentity();
  return connectorFrameworkAPI.peekHealth(organizationId, connectorInstanceId);
}

export async function getConnectorSyncHistoryAction(connectorInstanceId: string): Promise<ConnectorSync[]> {
  const { organizationId } = await requireIdentity();
  return connectorFrameworkAPI.peekSyncHistory(organizationId, connectorInstanceId);
}

export async function getConnectorTokenStatusAction(connectorInstanceId: string): Promise<ConnectorCredential | undefined> {
  const { organizationId } = await requireIdentity();
  return connectorFrameworkAPI.peekTokenStatus(organizationId, connectorInstanceId);
}

// ============================================================================
// Real, user-attributed, RBAC-gated mutations — for Settings -> Integrations.
// `organizationId`/`userId` are derived server-side from the real session,
// never taken as parameters — see `requireIdentity()`'s header comment.
// ============================================================================

export async function installConnectorAction(connectorId: string): Promise<ConnectorInstance> {
  const { organizationId, userId } = await requireIdentity();
  const tenantContext = await userContext(organizationId, userId);
  return connectorFrameworkAPI.installConnector(tenantContext, { connectorId });
}

export async function buildConnectorAuthorizationUrlAction(connectorInstanceId: string): Promise<{ url: string }> {
  const { organizationId, userId } = await requireIdentity();
  const tenantContext = await userContext(organizationId, userId);
  const origin = await getRequestOrigin();
  const result = await connectorFrameworkAPI.buildAuthorizationUrl(tenantContext, connectorInstanceId, origin);
  return { url: result.url };
}

export async function disconnectConnectorAction(connectorInstanceId: string): Promise<{ ok: boolean }> {
  const { organizationId, userId } = await requireIdentity();
  const tenantContext = await userContext(organizationId, userId);
  return connectorFrameworkAPI.disconnect(tenantContext, connectorInstanceId);
}

export async function refreshConnectorAction(connectorInstanceId: string): Promise<{ ok: boolean; expiresAt?: string; error?: string }> {
  const { organizationId, userId } = await requireIdentity();
  const tenantContext = await userContext(organizationId, userId);
  return connectorFrameworkAPI.refresh(tenantContext, connectorInstanceId);
}

export async function syncConnectorAction(connectorInstanceId: string, mode: ConnectorSyncMode = "manual"): Promise<ConnectorSync> {
  const { organizationId, userId } = await requireIdentity();
  const tenantContext = await userContext(organizationId, userId);
  return connectorFrameworkAPI.sync(tenantContext, connectorInstanceId, mode);
}

export async function validateConnectorAction(connectorInstanceId: string): Promise<ConnectorValidateResult> {
  const { organizationId, userId } = await requireIdentity();
  const tenantContext = await userContext(organizationId, userId);
  return connectorFrameworkAPI.validate(tenantContext, connectorInstanceId);
}

export async function testConnectorAction(connectorInstanceId: string): Promise<ConnectorTestResult> {
  const { organizationId, userId } = await requireIdentity();
  const tenantContext = await userContext(organizationId, userId);
  return connectorFrameworkAPI.test(tenantContext, connectorInstanceId);
}

export async function getConnectorHealthForUserAction(connectorInstanceId: string): Promise<ConnectorHealth> {
  const { organizationId, userId } = await requireIdentity();
  const tenantContext = await userContext(organizationId, userId);
  return connectorFrameworkAPI.health(tenantContext, connectorInstanceId);
}

export async function getConnectorSyncHistoryForUserAction(connectorInstanceId: string): Promise<ConnectorSync[]> {
  const { organizationId, userId } = await requireIdentity();
  const tenantContext = await userContext(organizationId, userId);
  return connectorFrameworkAPI.syncHistory(tenantContext, connectorInstanceId);
}
