/**
 * Calixo Platform - Connector Platform API
 *
 * The single facade for connector lifecycle/governance operations — wraps
 * `ConnectorRuntime` (which itself wraps the reused `integrationService`
 * and gates every mutation through `resourceAuthorizationAPI`). "No module
 * may call connector implementations directly."
 */
import { connectorRuntime } from "./ConnectorRuntime";
import { integrationService } from "@/integrations/services/IntegrationService";
import type { Connection } from "@/integrations/types";
import type { TenantContext } from "../tenant/types";
import { connectorHealthEngine } from "./ConnectorHealthEngine";
import type { ConnectorHealthScore, ConnectorOwnership, ConnectorOwnershipRole } from "./types";

export class ConnectorPlatformAPI {
  install(tenantContext: TenantContext, providerId: string, config: Record<string, unknown> = {}): Promise<Connection> {
    return connectorRuntime.install(tenantContext, providerId, config);
  }

  pause(tenantContext: TenantContext, connectionId: string): Promise<Connection> {
    return connectorRuntime.pause(tenantContext, connectionId);
  }

  resume(tenantContext: TenantContext, connectionId: string): Promise<Connection> {
    return connectorRuntime.resume(tenantContext, connectionId);
  }

  reconnect(tenantContext: TenantContext, connectionId: string): Promise<Connection> {
    return connectorRuntime.reconnect(tenantContext, connectionId);
  }

  disconnect(tenantContext: TenantContext, connectionId: string): Promise<void> {
    return connectorRuntime.disconnect(tenantContext, connectionId);
  }

  delete(tenantContext: TenantContext, connectionId: string): Promise<void> {
    return connectorRuntime.delete(tenantContext, connectionId);
  }

  duplicate(tenantContext: TenantContext, connectionId: string): Promise<Connection> {
    return connectorRuntime.duplicate(tenantContext, connectionId);
  }

  clone(tenantContext: TenantContext, connectionId: string): Promise<Connection> {
    return connectorRuntime.clone(tenantContext, connectionId);
  }

  move(tenantContext: TenantContext, connectionId: string, destination: { workspaceId?: string; brandId?: string }): Promise<ConnectorOwnership> {
    return connectorRuntime.move(tenantContext, connectionId, destination);
  }

  share(tenantContext: TenantContext, connectionId: string, userId: string, role: ConnectorOwnershipRole): Promise<ConnectorOwnership> {
    return connectorRuntime.share(tenantContext, connectionId, userId, role);
  }

  transferOwnership(tenantContext: TenantContext, connectionId: string, newOwnerId: string): Promise<ConnectorOwnership> {
    return connectorRuntime.transferOwnership(tenantContext, connectionId, newOwnerId);
  }

  getOwnership(connectionId: string): ConnectorOwnership | undefined {
    return connectorRuntime.getOwnership(connectionId);
  }

  getConnections(organizationId: string): Promise<Connection[]> {
    return integrationService.getConnections(organizationId);
  }

  getConnection(connectionId: string): Promise<Connection | null> {
    return integrationService.getConnection(connectionId);
  }

  async getHealth(connectionId: string): Promise<ConnectorHealthScore> {
    const connection = await integrationService.getConnection(connectionId);
    return connectorHealthEngine.computeScore(connection, connectionId);
  }
}

export const connectorPlatformAPI = new ConnectorPlatformAPI();
