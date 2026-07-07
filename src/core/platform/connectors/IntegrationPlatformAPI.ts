/**
 * Calixo Platform - Integration Platform API
 *
 * The broad read/query facade over the reused `integrationService` (provider
 * catalog, connection health, sync/OAuth history) — distinct from the
 * pre-existing, narrower `src/integrations/platform/ConnectorsPlatformAPI`
 * (kept as-is; it's Dashboard's specific summary shape). This is the
 * general-purpose one other modules should reach for.
 */
import { integrationService } from "@/integrations/services/IntegrationService";
import type { Connection, ConnectionHealth, ProviderDefinition, SyncJob } from "@/integrations/types";

export class IntegrationPlatformAPI {
  getAvailableProviders(): ProviderDefinition[] {
    return integrationService.getAvailableProviders();
  }

  getProvider(providerId: string): ProviderDefinition | undefined {
    return integrationService.getProvider(providerId);
  }

  getConnections(organizationId: string): Promise<Connection[]> {
    return integrationService.getConnections(organizationId);
  }

  getConnectionHealth(connectionId: string): Promise<ConnectionHealth> {
    return integrationService.getConnectionHealth(connectionId);
  }

  getSyncHistory(connectionId: string): Promise<SyncJob[]> {
    return integrationService.getSyncHistory(connectionId);
  }

  initiateOAuth(organizationId: string, providerId: string, redirectUri: string): Promise<{ url: string; state: string }> {
    return integrationService.initiateOAuth(organizationId, providerId, redirectUri);
  }

  completeOAuth(providerId: string, code: string, state: string): Promise<Connection> {
    return integrationService.completeOAuth(providerId, code, state);
  }
}

export const integrationPlatformAPI = new IntegrationPlatformAPI();
