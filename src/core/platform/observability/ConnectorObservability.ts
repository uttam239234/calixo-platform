/**
 * Calixo Platform - Connector Observability
 *
 * Wraps Phase 5's real `connectorHealthEngine` (0-100 score + uptime%) and
 * `integrationSyncService`'s job history — no second connector telemetry
 * store.
 */
import { connectorHealthEngine } from "@/core/platform/connectors/ConnectorHealthEngine";
import { integrationSyncService } from "@/integrations/sync/SyncService";
import { integrationService } from "@/integrations/services/IntegrationService";
import type { ConnectionId, SyncJob } from "@/integrations/types";
import type { ConnectorObservabilitySummary } from "./types";

export class ConnectorObservability {
  async getSummary(connectionId: ConnectionId): Promise<ConnectorObservabilitySummary> {
    const connection = await integrationService.getConnection(connectionId);
    const score = await connectorHealthEngine.computeScore(connection, connectionId);
    return { connectionId: score.connectionId, status: score.status, score: score.score, uptimePercent: score.uptimePercent, lastSyncAt: score.lastSyncAt };
  }

  async getSyncHistory(connectionId: ConnectionId): Promise<SyncJob[]> {
    return integrationSyncService.getConnectionJobs(connectionId);
  }

  async getOrganizationSummary(organizationId: string): Promise<ConnectorObservabilitySummary[]> {
    const connections = await integrationService.getConnections(organizationId);
    return Promise.all(connections.map(c => this.getSummary(c.id)));
  }
}

export const connectorObservability = new ConnectorObservability();
