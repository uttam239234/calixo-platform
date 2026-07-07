/**
 * Calixo Platform - Synchronization Platform API
 *
 * The pre-existing `integrationSyncService.startSync()` (job bookkeeping:
 * queued/running/retry/backoff) never actually called `connector.sync()`
 * — it simulated a random record count (see the Integration Architecture
 * Audit). This API is the fix: it calls the REAL `ProviderConnector.sync()`
 * for the connection's registered connector (manifest-driven connectors
 * genuinely fetch -> normalize -> transform -> persist; hand-written ones
 * run whatever they implement), then records the resulting job into
 * `integrationSyncService` via `recordExternalJob()` so sync history stays
 * one system, not two.
 */
import { integrationService } from "@/integrations/services/IntegrationService";
import { integrationSyncService } from "@/integrations/sync/SyncService";
import { connectorRegistry } from "@/integrations/registry/ConnectorRegistry";
import type { SyncDataType, SyncJob } from "@/integrations/types";
import { platformEventBus } from "../events/PlatformEventBus";

export class SynchronizationPlatformAPI {
  async sync(connectionId: string, dataType: SyncDataType, mode: "full" | "incremental" = "incremental"): Promise<SyncJob> {
    const connection = await integrationService.getConnection(connectionId);
    if (!connection) throw new Error(`Connection not found: ${connectionId}`);

    const connector = connectorRegistry.get(connection.providerId);
    if (!connector) throw new Error(`No connector registered for provider: ${connection.providerId}`);

    const job = await connector.sync(connection, dataType, mode);
    integrationSyncService.recordExternalJob(job);

    await integrationService.updateConnection(connectionId, {});
    const eventType = job.status === "completed" ? "ConnectorSyncCompleted" : "ConnectorSyncFailed";
    await platformEventBus.publish({
      type: eventType,
      organizationId: connection.organizationId,
      payload: { connectionId, dataType, recordsProcessed: job.recordsProcessed, recordsFailed: job.recordsFailed },
    });

    return job;
  }

  getHistory(connectionId: string): Promise<SyncJob[]> {
    return integrationSyncService.getConnectionJobs(connectionId);
  }

  scheduleSync(connectionId: string, frequency: "realtime" | "frequent" | "hourly" | "daily" | "weekly" | "manual", dataTypes: SyncDataType[]): Promise<void> {
    return integrationSyncService.scheduleSync(connectionId, {
      enabled: frequency !== "manual",
      frequency,
      dataTypes,
      fullSyncEnabled: true,
      incrementalSyncEnabled: true,
      retryConfig: { maxRetries: 3, initialDelayMs: 1000, maxDelayMs: 30000, backoffMultiplier: 2 },
    });
  }
}

export const synchronizationPlatformAPI = new SynchronizationPlatformAPI();
