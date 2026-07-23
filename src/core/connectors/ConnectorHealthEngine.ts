/**
 * Calixo Platform - Universal Connector Framework: Connector Health Engine
 *
 * Computes and persists the real health state of one connector instance
 * from real signals already tracked elsewhere in this framework — token
 * expiry (`TokenManager`), rate-limit state (`RateLimitManager`), and the
 * most recent sync result (`SyncEngine`) — rather than a separate,
 * independently-drifting health flag. Publishes `ConnectorHealthChanged`
 * only when the computed status actually changes (not on every check),
 * matching the brief's "continuously reports" without spamming the event
 * bus on every poll.
 */
import { tokenManager } from "./TokenManager";
import { rateLimitManager } from "./RateLimitManager";
import { readOrgTable, writeOrgTable } from "./persistence/ConnectorDataStore";
import { connectorEventBus } from "./ConnectorEventBus";
import type { ConnectorHealth, ConnectorHealthStatus, ConnectorProviderId } from "./types";

async function healthTableFor(organizationId: string): Promise<ConnectorHealth[]> {
  return readOrgTable<ConnectorHealth[]>(organizationId, "health") ?? [];
}

export interface ComputeHealthInput {
  organizationId: string;
  connectorInstanceId: string;
  provider: ConnectorProviderId;
  lastSyncFailed?: boolean;
  permissionIssues?: string[];
  configurationValid?: boolean;
}

function computeStatus(input: ComputeHealthInput, credential: Awaited<ReturnType<typeof tokenManager.get>>, throttled: boolean): { status: ConnectorHealthStatus; message: string } {
  if (input.configurationValid === false) return { status: "configuration_error", message: "Connector configuration is invalid or incomplete." };
  if (!credential || credential.status === "revoked") return { status: "disconnected", message: "No active credential for this connector." };
  if (credential.status === "invalid") return { status: "permission_missing", message: "The provider reported the granted permissions are no longer valid." };
  if (tokenManager.isExpired(credential)) return { status: "expired_token", message: "The access token has expired and could not be refreshed." };
  if (input.permissionIssues?.length) return { status: "permission_missing", message: `Missing scopes: ${input.permissionIssues.join(", ")}` };
  if (throttled) return { status: "rate_limited", message: "The provider is currently rate-limiting this connector." };
  if (input.lastSyncFailed) return { status: "sync_failed", message: "The most recent sync attempt failed." };
  return { status: "healthy", message: "Connected and operating normally." };
}

export const connectorHealthEngine = {
  async check(input: ComputeHealthInput): Promise<ConnectorHealth> {
    const credential = await tokenManager.get(input.organizationId, input.connectorInstanceId);
    const throttled = rateLimitManager.isThrottled(input.connectorInstanceId);
    const { status, message } = computeStatus(input, credential, throttled);

    const table = await healthTableFor(input.organizationId);
    const previous = table.find(h => h.connectorInstanceId === input.connectorInstanceId);

    const record: ConnectorHealth = { connectorInstanceId: input.connectorInstanceId, organizationId: input.organizationId, status, message, checkedAt: new Date().toISOString() };
    const next = [...table.filter(h => h.connectorInstanceId !== input.connectorInstanceId), record];
    await writeOrgTable(input.organizationId, "health", next);

    if (previous?.status !== status) {
      await connectorEventBus.healthChanged({ organizationId: input.organizationId, connectorInstanceId: input.connectorInstanceId }, input.provider, status);
    }

    return record;
  },

  async get(organizationId: string, connectorInstanceId: string): Promise<ConnectorHealth | undefined> {
    const table = await healthTableFor(organizationId);
    return table.find(h => h.connectorInstanceId === connectorInstanceId);
  },

  async listForOrganization(organizationId: string): Promise<ConnectorHealth[]> {
    return healthTableFor(organizationId);
  },
};
