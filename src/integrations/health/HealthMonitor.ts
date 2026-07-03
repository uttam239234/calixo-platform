/**
 * Calixo Platform - Integration Health Monitor
 * 
 * Monitors connection health, tracks failures, and provides health status.
 */

import { appLogger } from '@/logging';
import { generateId } from '@/shared/utils/string';
import { connectorRegistry } from '@/integrations/registry/ConnectorRegistry';
import type { HealthMonitor, ConnectionHealth, ConnectionId, Connection } from '@/integrations/types';

export class IntegrationHealthMonitor implements HealthMonitor {
  private healthCache: Map<ConnectionId, ConnectionHealth> = new Map();
  private healthHistory: Map<ConnectionId, ConnectionHealth[]> = new Map();
  private monitoringIntervals: Map<ConnectionId, ReturnType<typeof setInterval>> = new Map();

  async checkConnection(connectionId: ConnectionId): Promise<ConnectionHealth> {
    const now = new Date().toISOString();
    
    // Simulated health check - in production, call connector.checkHealth()
    const health: ConnectionHealth = {
      status: 'healthy',
      lastCheckedAt: now,
      failureCount: 0,
      successRate: 100,
      responseTimeMs: Math.floor(Math.random() * 500) + 50,
    };

    this.healthCache.set(connectionId, health);
    this.recordHealthHistory(connectionId, health);
    
    return health;
  }

  async getConnectionHealth(connectionId: ConnectionId): Promise<ConnectionHealth> {
    return this.healthCache.get(connectionId) || {
      status: 'unknown',
      lastCheckedAt: new Date().toISOString(),
      failureCount: 0,
      successRate: 100,
    };
  }

  async getAllConnectionsHealth(organizationId: string): Promise<Map<ConnectionId, ConnectionHealth>> {
    return new Map(this.healthCache);
  }

  async getUnhealthyConnections(organizationId: string): Promise<Connection[]> {
    const unhealthy: Connection[] = [];
    this.healthCache.forEach((health, connectionId) => {
      if (health.status === 'unhealthy' || health.status === 'degraded') {
        unhealthy.push({ id: connectionId } as Connection);
      }
    });
    return unhealthy;
  }

  startMonitoring(connectionId: ConnectionId): void {
    if (this.monitoringIntervals.has(connectionId)) return;

    const interval = setInterval(async () => {
      try {
        await this.checkConnection(connectionId);
      } catch (error) {
        appLogger.error('HealthMonitor', `Health check failed for ${connectionId}`, error);
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    this.monitoringIntervals.set(connectionId, interval);
    appLogger.info('HealthMonitor', `Monitoring started for connection ${connectionId}`);
  }

  stopMonitoring(connectionId: ConnectionId): void {
    const interval = this.monitoringIntervals.get(connectionId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(connectionId);
      appLogger.info('HealthMonitor', `Monitoring stopped for connection ${connectionId}`);
    }
  }

  async getHealthHistory(connectionId: ConnectionId, hours: number = 24): Promise<ConnectionHealth[]> {
    const history = this.healthHistory.get(connectionId) || [];
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return history.filter(h => new Date(h.lastCheckedAt).getTime() > cutoff);
  }

  private recordHealthHistory(connectionId: ConnectionId, health: ConnectionHealth): void {
    if (!this.healthHistory.has(connectionId)) {
      this.healthHistory.set(connectionId, []);
    }
    this.healthHistory.get(connectionId)!.push(health);

    // Keep only last 1000 entries
    const history = this.healthHistory.get(connectionId)!;
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }
  }

  stopAllMonitoring(): void {
    this.monitoringIntervals.forEach((interval, connectionId) => {
      clearInterval(interval);
    });
    this.monitoringIntervals.clear();
    appLogger.info('HealthMonitor', 'All monitoring stopped');
  }
}

export const integrationHealthMonitor = new IntegrationHealthMonitor();