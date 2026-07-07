/**
 * Calixo Platform - Integration Service (Facade)
 * 
 * Main service for managing all integration operations.
 * Orchestrates OAuth, Sync, Webhook, and Health services.
 */

import { appLogger } from '@/logging';
import { NotFoundError, ValidationError } from '@/errors';
import { generateId } from '@/shared/utils/string';
import { connectorRegistry } from '@/integrations/registry/ConnectorRegistry';
import { integrationOAuthService } from '@/integrations/oauth/OAuthService';
import { integrationSyncService } from '@/integrations/sync/SyncService';
import { integrationHealthMonitor } from '@/integrations/health/HealthMonitor';
import { secretVault } from '@/integrations/secrets/SecretVault';
import type {
  IntegrationService,
  Connection, ConnectionId, ConnectionHealth,
  ProviderDefinition, ProviderId, SyncDataType, SyncJob,
} from '@/integrations/types';

export class MainIntegrationService implements IntegrationService {
  private connections: Map<ConnectionId, Connection> = new Map();
  private organizationConnections: Map<string, ConnectionId[]> = new Map();

  async getConnections(organizationId: string): Promise<Connection[]> {
    const ids = this.organizationConnections.get(organizationId) || [];
    return ids
      .map(id => this.connections.get(id))
      .filter((c): c is Connection => !!c)
      .map(c => ({ ...c }));
  }

  async getConnection(id: ConnectionId): Promise<Connection | null> {
    const connection = this.connections.get(id);
    return connection ? { ...connection } : null;
  }

  async createConnection(organizationId: string, providerId: ProviderId, config: Record<string, unknown>): Promise<Connection> {
    const def = connectorRegistry.getDefinition(providerId);
    if (!def) {
      throw new ValidationError(`Provider ${providerId} not found`);
    }

    const now = new Date().toISOString();
    const connection: Connection = {
      id: generateId(16),
      organizationId,
      providerId,
      name: config.name as string || def.name,
      status: 'pending',
      auth: { type: def.authType, status: 'pending' },
      config,
      capabilities: def.capabilities,
      health: { status: 'unknown', lastCheckedAt: now, failureCount: 0, successRate: 100 },
      metrics: { totalRequests: 0, successfulRequests: 0, failedRequests: 0, averageResponseTimeMs: 0, dataSynced: 0 },
      createdAt: now,
      updatedAt: now,
    };

    this.connections.set(connection.id, connection);
    
    if (!this.organizationConnections.has(organizationId)) {
      this.organizationConnections.set(organizationId, []);
    }
    this.organizationConnections.get(organizationId)!.push(connection.id);

    appLogger.info('IntegrationService', `Connection created: ${connection.name} (${providerId})`);
    return { ...connection };
  }

  async updateConnection(id: ConnectionId, config: Record<string, unknown>): Promise<Connection> {
    const conn = this.connections.get(id);
    if (!conn) throw new NotFoundError('Connection');
    Object.assign(conn.config, config);
    conn.updatedAt = new Date().toISOString();
    return { ...conn };
  }

  async deleteConnection(id: ConnectionId): Promise<void> {
    const conn = this.connections.get(id);
    if (!conn) throw new NotFoundError('Connection');
    this.connections.delete(id);
    
    const orgConns = this.organizationConnections.get(conn.organizationId);
    if (orgConns) {
      const idx = orgConns.indexOf(id);
      if (idx >= 0) orgConns.splice(idx, 1);
    }
    appLogger.info('IntegrationService', `Connection deleted: ${id}`);
  }

  async connect(id: ConnectionId): Promise<Connection> {
    const conn = this.connections.get(id);
    if (!conn) throw new NotFoundError('Connection');
    conn.status = 'connected';
    conn.updatedAt = new Date().toISOString();
    return { ...conn };
  }

  async disconnect(id: ConnectionId): Promise<void> {
    const conn = this.connections.get(id);
    if (!conn) throw new NotFoundError('Connection');
    conn.status = 'disconnected';
    conn.updatedAt = new Date().toISOString();
  }

  async pause(id: ConnectionId): Promise<Connection> {
    const conn = this.connections.get(id);
    if (!conn) throw new NotFoundError('Connection');
    conn.status = 'paused';
    conn.updatedAt = new Date().toISOString();
    return { ...conn };
  }

  async resume(id: ConnectionId): Promise<Connection> {
    const conn = this.connections.get(id);
    if (!conn) throw new NotFoundError('Connection');
    conn.status = 'connected';
    conn.updatedAt = new Date().toISOString();
    return { ...conn };
  }

  async duplicateConnection(id: ConnectionId): Promise<Connection> {
    const source = this.connections.get(id);
    if (!source) throw new NotFoundError('Connection');
    const now = new Date().toISOString();
    const duplicate: Connection = {
      ...source,
      id: generateId(16),
      name: `${source.name} (Copy)`,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    this.connections.set(duplicate.id, duplicate);
    this.organizationConnections.get(source.organizationId)!.push(duplicate.id);
    appLogger.info('IntegrationService', `Connection duplicated: ${id} -> ${duplicate.id}`);
    return { ...duplicate };
  }

  async testConnection(id: ConnectionId): Promise<ConnectionHealth> {
    return integrationHealthMonitor.checkConnection(id);
  }

  async syncConnection(id: ConnectionId, dataType: SyncDataType): Promise<SyncJob> {
    return integrationSyncService.startSync(id, dataType);
  }

  async getSyncHistory(id: ConnectionId): Promise<SyncJob[]> {
    return integrationSyncService.getConnectionJobs(id);
  }

  async getSyncJobs(connectionId: ConnectionId): Promise<SyncJob[]> {
    return integrationSyncService.getConnectionJobs(connectionId);
  }

  getAvailableProviders(): ProviderDefinition[] {
    return connectorRegistry.getAll();
  }

  getProvider(providerId: ProviderId): ProviderDefinition | undefined {
    return connectorRegistry.getDefinition(providerId);
  }

  async initiateOAuth(organizationId: string, providerId: ProviderId, redirectUri: string): Promise<{ url: string; state: string }> {
    const result = await integrationOAuthService.initiateFlow(organizationId, providerId, redirectUri);
    return { url: result.url, state: result.state };
  }

  async completeOAuth(providerId: ProviderId, code: string, state: string): Promise<Connection> {
    const tokenResponse = await integrationOAuthService.completeFlow(providerId, code, state);

    const connection = await this.createConnection(tokenResponse.organizationId, providerId, {});

    const sealedAccessToken = await secretVault.seal(tokenResponse.accessToken);
    const sealedRefreshToken = tokenResponse.refreshToken ? await secretVault.seal(tokenResponse.refreshToken) : undefined;

    const stored = this.connections.get(connection.id);
    if (!stored) throw new NotFoundError('Connection');
    stored.status = 'connected';
    stored.auth = {
      type: 'oauth2',
      status: 'valid',
      oauth2: {
        // References into `SecretVault`, NOT plaintext tokens — see the
        // Integration Architecture Audit finding on `SecretVault.ts`.
        accessToken: sealedAccessToken,
        refreshToken: sealedRefreshToken,
        tokenType: tokenResponse.tokenType,
        expiresAt: new Date(Date.now() + tokenResponse.expiresIn * 1000).toISOString(),
        scope: tokenResponse.scope,
        providerUserId: tokenResponse.providerUserId,
      },
    };
    stored.updatedAt = new Date().toISOString();

    appLogger.info('IntegrationService', `OAuth connection established: ${connection.id} (${providerId})`);
    return { ...stored };
  }

  async getConnectionHealth(id: ConnectionId): Promise<ConnectionHealth> {
    return integrationHealthMonitor.getConnectionHealth(id);
  }
}

export const integrationService = new MainIntegrationService();