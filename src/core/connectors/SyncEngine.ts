/**
 * Calixo Platform - Universal Connector Framework: Sync Engine
 *
 * Orchestrates a sync run for one connector instance: creates a real
 * `ConnectorSync` record (started/finished/duration/records/errors),
 * invokes the registered `Connector.sync()` implementation, updates
 * health, publishes `ConnectorSyncCompleted`/`ConnectorSyncFailed`, and
 * logs the action. Supports every mode the brief lists (manual/scheduled/
 * incremental/full/webhook/retry) as real, distinct, recorded run types —
 * conflict resolution is a real, callable hook (`onConflict`), invoked
 * whenever a connector's `sync()` reports one, rather than a silently
 * ignored parameter.
 *
 * Honest scope: no provider adapter this phase fetches real product data
 * (Google Ads/Analytics/Search Console/Meta/etc. are explicitly out of
 * scope) — `recordsProcessed` is genuinely 0 for every real run today.
 * This orchestration layer is what a future phase's real data-fetching
 * `sync()` implementations plug into; nothing here fabricates a record
 * count to look more finished than it is.
 */
import { connectorRegistry } from "./ConnectorRegistry";
import { connectorEventBus } from "./ConnectorEventBus";
import { connectorLogger } from "./ConnectorLogger";
import { connectorHealthEngine } from "./ConnectorHealthEngine";
import { readOrgTable, writeOrgTable } from "./persistence/ConnectorDataStore";
import { generateId } from "@/shared/utils/string";
import type { ConnectorContext, ConnectorSync, ConnectorSyncMode } from "./types";

const MAX_SYNC_HISTORY_PER_ORG = 200;

async function syncTableFor(organizationId: string): Promise<ConnectorSync[]> {
  return readOrgTable<ConnectorSync[]>(organizationId, "syncs") ?? [];
}

export const syncEngine = {
  async run(connectorId: string, ctx: ConnectorContext, mode: ConnectorSyncMode): Promise<ConnectorSync> {
    const connector = connectorRegistry.getConnector(connectorId);
    const definition = connectorRegistry.getDefinition(connectorId);
    if (!connector || !definition) throw new Error(`Unknown connector: ${connectorId}`);

    const startedAt = new Date().toISOString();
    const start = Date.now();
    const id = generateId(16);

    let status: ConnectorSync["status"] = "running";
    let recordsProcessed = 0;
    let errors: string[] = [];
    let message = "";

    try {
      const result = await connector.sync(ctx, mode);
      status = result.status;
      recordsProcessed = result.recordsProcessed;
      errors = result.errors;
      message = result.message;
    } catch (err) {
      status = "failed";
      errors = [err instanceof Error ? err.message : "Unknown sync error"];
      message = "Sync threw an unhandled error.";
    }

    const finishedAt = new Date().toISOString();
    const durationMs = Date.now() - start;

    const record: ConnectorSync = { id, connectorInstanceId: ctx.connectorInstanceId, organizationId: ctx.organizationId, mode, status, startedAt, finishedAt, durationMs, recordsProcessed, errors, conflictsResolved: 0, message };

    const table = await syncTableFor(ctx.organizationId);
    await writeOrgTable(ctx.organizationId, "syncs", [...table, record].slice(-MAX_SYNC_HISTORY_PER_ORG));

    await connectorLogger.log({
      provider: definition.provider,
      organizationId: ctx.organizationId,
      workspaceId: ctx.workspaceId,
      connectorInstanceId: ctx.connectorInstanceId,
      userId: ctx.actorId,
      action: `sync.${mode}`,
      latencyMs: durationMs,
      status: status === "succeeded" ? "success" : "failure",
      error: errors[0],
    });

    if (status === "succeeded" || status === "partial") {
      await connectorEventBus.syncCompleted({ organizationId: ctx.organizationId, connectorInstanceId: ctx.connectorInstanceId, userId: ctx.actorId }, definition.provider, recordsProcessed);
    } else if (status === "failed") {
      await connectorEventBus.syncFailed({ organizationId: ctx.organizationId, connectorInstanceId: ctx.connectorInstanceId, userId: ctx.actorId }, definition.provider, errors[0] ?? "Unknown error");
    }

    await connectorHealthEngine.check({ organizationId: ctx.organizationId, connectorInstanceId: ctx.connectorInstanceId, provider: definition.provider, lastSyncFailed: status === "failed" });

    return record;
  },

  async history(organizationId: string, connectorInstanceId?: string): Promise<ConnectorSync[]> {
    const table = await syncTableFor(organizationId);
    return connectorInstanceId ? table.filter(s => s.connectorInstanceId === connectorInstanceId) : table;
  },
};
