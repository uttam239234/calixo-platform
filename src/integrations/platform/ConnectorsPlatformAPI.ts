/**
 * Calixo Platform - Connectors Platform API
 *
 * The sanctioned way another module reads connection data — wraps
 * `integrationService`/`connectorRegistry` so Dashboard no longer needs to
 * import them directly (flagged as direct engine coupling by the
 * Enterprise Architecture Audit).
 */
import { integrationService } from "../services/IntegrationService";
import { connectorRegistry } from "../registry/ConnectorRegistry";
import type { ConnectorSummary } from "@/core/platform/contracts";

export class ConnectorsPlatformAPI {
  async getConnectorSummaries(organizationId: string): Promise<ConnectorSummary[]> {
    const connections = await integrationService.getConnections(organizationId);
    return connections.map(c => {
      const definition = connectorRegistry.getDefinition(c.providerId);
      return {
        id: c.id,
        providerId: c.providerId,
        name: definition?.name ?? c.name,
        status: c.status,
        lastSyncAt: c.lastSyncAt,
      };
    });
  }

  async reconnect(connectionId: string): Promise<void> {
    await integrationService.connect(connectionId);
  }
}

export const connectorsPlatformAPI = new ConnectorsPlatformAPI();
