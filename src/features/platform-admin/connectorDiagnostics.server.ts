/**
 * Calixo Platform - Universal Connector Framework: Platform Admin Diagnostics
 *
 * Server-only data gathering for the new `/platform-admin/connectors`
 * page. The only place this framework ever reads across every
 * organization at once — an explicitly sanctioned Platform Admin
 * operation (see `ConnectorDataStore.listAllOrganizationIdsWithConnectorData()`'s
 * own header), never something a per-request org-scoped code path does.
 */
import "server-only";
import { connectorRegistry } from "@/core/connectors/ConnectorRegistry";
import { rateLimitManager } from "@/core/connectors/RateLimitManager";
import { tokenManager } from "@/core/connectors/TokenManager";
import { connectorHealthEngine } from "@/core/connectors/ConnectorHealthEngine";
import { webhookManager } from "@/core/connectors/WebhookManager";
import { connectorLogger } from "@/core/connectors/ConnectorLogger";
import { oauthManager } from "@/core/connectors/OAuthManager";
import { listAllOrganizationIdsWithConnectorData } from "@/core/connectors/persistence/ConnectorDataStore";
import { connectorJobScheduler } from "@/core/connectors/ConnectorJobScheduler";
import { schedulerPlatformAPI } from "@/core/platform/execution/SchedulerPlatformAPI";
import { workerRegistry } from "@/background/workers/WorkerRegistry";
import { OAuthApplicationService } from "@/core/platform/secrets/oauth";
import type { ConnectorHealthStatus, ConnectorLog, ConnectorProviderId } from "@/core/connectors/types";

export interface ConnectorDiagnosticsSnapshot {
  connectors: {
    id: string;
    provider: ConnectorProviderId;
    displayName: string;
    category: string;
    version: string;
    status: string;
    capabilities: string[];
    oauthStatus: string;
  }[];
  totals: { organizationsWithData: number; totalCredentials: number; activeCredentials: number; expiredCredentials: number };
  health: { organizationId: string; connectorInstanceId: string; provider: ConnectorProviderId; status: ConnectorHealthStatus; message: string }[];
  rateLimits: ReturnType<typeof rateLimitManager.listAll>;
  webhooks: { organizationId: string; provider: ConnectorProviderId; status: string; deadLetterCount: number }[];
  scheduler: { name: string; frequency: string; nextRunAt?: string; isActive: boolean }[];
  workers: ReturnType<typeof workerRegistry.getWorkerHealth>;
  pendingOAuthAuthorizations: number;
  recentLatency: { provider: ConnectorProviderId; action: string; latencyMs: number; status: string; timestamp: string }[];
}

export async function getConnectorDiagnosticsSnapshot(): Promise<ConnectorDiagnosticsSnapshot> {
  const definitions = connectorRegistry.list();
  const oauthApps = await OAuthApplicationService.list();
  const oauthStatusByProvider = new Map(oauthApps.map(a => [a.provider, a.status]));

  const organizationIds = listAllOrganizationIdsWithConnectorData();

  let totalCredentials = 0;
  let activeCredentials = 0;
  let expiredCredentials = 0;
  const health: ConnectorDiagnosticsSnapshot["health"] = [];
  const webhooks: ConnectorDiagnosticsSnapshot["webhooks"] = [];
  const recentLogs: ConnectorLog[] = [];

  for (const organizationId of organizationIds) {
    const credentials = await tokenManager.listForOrganization(organizationId);
    for (const credential of credentials) {
      totalCredentials += 1;
      if (credential.status === "active" && !tokenManager.isExpired(credential)) activeCredentials += 1;
      if (credential.status === "active" && tokenManager.isExpired(credential)) expiredCredentials += 1;
    }

    const healthRows = await connectorHealthEngine.listForOrganization(organizationId);
    for (const row of healthRows) health.push({ organizationId, connectorInstanceId: row.connectorInstanceId, provider: row.status ? (credentials.find(c => c.connectorInstanceId === row.connectorInstanceId)?.provider ?? "google") : "google", status: row.status, message: row.message });

    const webhookRows = await webhookManager.listForOrganization(organizationId);
    for (const w of webhookRows) webhooks.push({ organizationId, provider: w.provider, status: w.status, deadLetterCount: w.deadLetterCount });

    const logs = await connectorLogger.list(organizationId);
    recentLogs.push(...logs);
  }

  const recentLatency = recentLogs
    .filter(l => typeof l.latencyMs === "number")
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20)
    .map(l => ({ provider: l.provider, action: l.action, latencyMs: l.latencyMs as number, status: l.status, timestamp: l.timestamp }));

  const schedules = await schedulerPlatformAPI.list({});
  const connectorSchedules = schedules.filter(s => s.worker === "connectors");

  return {
    connectors: definitions.map(d => ({
      id: d.id,
      provider: d.provider,
      displayName: d.displayName,
      category: d.category,
      version: d.version,
      status: d.status,
      capabilities: d.supportedCapabilities,
      oauthStatus: oauthStatusByProvider.get(d.provider) ?? "missing",
    })),
    totals: { organizationsWithData: organizationIds.length, totalCredentials, activeCredentials, expiredCredentials },
    health,
    rateLimits: rateLimitManager.listAll(),
    webhooks,
    scheduler: connectorSchedules.map(s => ({ name: s.name, frequency: s.frequency, nextRunAt: s.nextRunAt, isActive: s.isActive })),
    workers: workerRegistry.getWorkerHealth(),
    pendingOAuthAuthorizations: oauthManager.countPendingAuthorizations(),
    recentLatency,
  };
}

export async function isConnectorWorkerRegistered(): Promise<boolean> {
  return connectorJobScheduler.isInitialized();
}
