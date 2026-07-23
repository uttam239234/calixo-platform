/**
 * Calixo Platform - Universal Connector Framework: Connector Logger
 *
 * Every connector action (connect/disconnect/refresh/sync/webhook/test/...)
 * logs a real `ConnectorLog` row — provider, organization, workspace,
 * connector, user, action, latency, status, request id, correlation id,
 * error — persisted per-organization via `ConnectorDataStore` (never one
 * global in-memory array), and piped through the existing structured
 * `appLogger` for console/dev visibility, matching the convention already
 * established for AI request logging (`features/content/actions.ts`).
 *
 * Bounded per organization (keeps the last `MAX_LOGS_PER_ORG` entries) —
 * the same reason `PlatformConfigFileStore`'s tables stay small: this is a
 * real, durable log, not an unbounded audit trail (mutations that need
 * permanent audit history go through `auditService.recordEvent()` instead,
 * same separation of concerns as every other module in this codebase).
 */
import { appLogger } from "@/logging";
import { generateId } from "@/shared/utils/string";
import { readOrgTable, writeOrgTable } from "./persistence/ConnectorDataStore";
import type { ConnectorLog, ConnectorProviderId } from "./types";

const MODULE = "ConnectorFramework";
const MAX_LOGS_PER_ORG = 500;

export interface ConnectorLogInput {
  provider: ConnectorProviderId;
  organizationId?: string;
  workspaceId?: string;
  connectorInstanceId?: string;
  userId?: string;
  action: string;
  latencyMs?: number;
  status: "success" | "failure";
  requestId?: string;
  correlationId?: string;
  error?: string;
}

export const connectorLogger = {
  async log(input: ConnectorLogInput): Promise<ConnectorLog> {
    const entry: ConnectorLog = {
      id: generateId(16),
      provider: input.provider,
      organizationId: input.organizationId,
      workspaceId: input.workspaceId,
      connectorInstanceId: input.connectorInstanceId,
      userId: input.userId,
      action: input.action,
      latencyMs: input.latencyMs,
      status: input.status,
      requestId: input.requestId ?? generateId(12),
      correlationId: input.correlationId,
      error: input.error,
      timestamp: new Date().toISOString(),
    };

    if (input.status === "success") {
      appLogger.info(MODULE, `${input.provider}.${input.action}`, { organizationId: input.organizationId, connectorInstanceId: input.connectorInstanceId, latencyMs: input.latencyMs, requestId: entry.requestId });
    } else {
      appLogger.error(MODULE, `${input.provider}.${input.action} failed`, new Error(input.error ?? "Unknown connector error"), { organizationId: input.organizationId, connectorInstanceId: input.connectorInstanceId, requestId: entry.requestId });
    }

    if (input.organizationId) {
      const existing = readOrgTable<ConnectorLog[]>(input.organizationId, "logs") ?? [];
      const next = [...existing, entry].slice(-MAX_LOGS_PER_ORG);
      await writeOrgTable(input.organizationId, "logs", next);
    }

    return entry;
  },

  async list(organizationId: string, filter?: { connectorInstanceId?: string; provider?: ConnectorProviderId }): Promise<ConnectorLog[]> {
    const logs = readOrgTable<ConnectorLog[]>(organizationId, "logs") ?? [];
    return logs.filter(l => (!filter?.connectorInstanceId || l.connectorInstanceId === filter.connectorInstanceId) && (!filter?.provider || l.provider === filter.provider));
  },
};
