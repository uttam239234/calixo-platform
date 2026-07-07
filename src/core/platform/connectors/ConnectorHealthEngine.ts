/**
 * Calixo Platform - Connector Health Platform
 *
 * Computes a single 0-100 health score + uptime% on top of the
 * pre-existing `integrationHealthMonitor` (`src/integrations/health`,
 * reused unmodified) and `integrationSyncService`'s job history — real
 * arithmetic over real (if currently simulated-at-the-network-layer) data,
 * not a hardcoded number.
 */
import { integrationHealthMonitor } from "@/integrations/health/HealthMonitor";
import { integrationSyncService } from "@/integrations/sync/SyncService";
import type { Connection, ConnectionId } from "@/integrations/types";
import type { ConnectorHealthScore, ConnectorHealthStatus } from "./types";

const STATUS_BASE_SCORE: Record<ConnectorHealthStatus, number> = {
  healthy: 100, connected: 90, syncing: 85, paused: 60, warning: 50,
  rate_limited: 40, expired: 20, error: 10, disconnected: 0,
};

function mapStatus(connection: Connection | null, healthStatus: string): ConnectorHealthStatus {
  if (!connection || connection.status === "disconnected") return "disconnected";
  if (connection.status === "expired") return "expired";
  if (connection.status === "error") return "error";
  if (healthStatus === "unhealthy") return "error";
  if (healthStatus === "degraded") return "warning";
  return "healthy";
}

export class ConnectorHealthEngine {
  private computedCount = 0;

  async computeScore(connection: Connection | null, connectionId: ConnectionId): Promise<ConnectorHealthScore> {
    this.computedCount++;
    const health = await integrationHealthMonitor.getConnectionHealth(connectionId);
    const jobs = await integrationSyncService.getConnectionJobs(connectionId);

    const status = mapStatus(connection, health.status);
    const baseScore = STATUS_BASE_SCORE[status];

    const recentJobs = jobs.slice(0, 20);
    const failedRecent = recentJobs.filter(j => j.status === "failed").length;
    const failurePenalty = recentJobs.length > 0 ? Math.round((failedRecent / recentJobs.length) * 30) : 0;

    const score = Math.max(0, Math.min(100, baseScore - failurePenalty));
    const uptimePercent = health.successRate;

    const lastSync = jobs.find(j => j.status === "completed")?.completedAt;
    const nextSyncAt = connection?.lastSyncAt ? new Date(new Date(connection.lastSyncAt).getTime() + 60 * 60 * 1000).toISOString() : undefined;

    return { connectionId, status, score, uptimePercent, lastSyncAt: lastSync, nextSyncAt };
  }

  count(): number {
    return this.computedCount;
  }
}

export const connectorHealthEngine = new ConnectorHealthEngine();
