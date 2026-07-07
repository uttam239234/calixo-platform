/**
 * Calixo Platform - API Monitoring
 *
 * The real networked health endpoint `PlatformHealthService`'s own doc
 * comment said didn't exist yet ("not a networked health-check endpoint
 * yet ... that's a later phase"). Wraps it, adds Gateway-specific request
 * volume/error-rate from `ApiAnalyticsEngine` — reused, not reimplemented.
 */
import { platformHealthService } from "../registry/PlatformHealthService";
import { apiAnalyticsEngine } from "./ApiAnalyticsEngine";
import { contractRegistry } from "./ContractRegistry";

export interface ApiHealthSnapshot {
  status: "healthy" | "degraded";
  environment: string;
  registeredEndpoints: number;
  requestVolume: number;
  errorRate: number;
  averageLatencyMs: number;
  checkedAt: string;
}

export class ApiMonitoring {
  getHealth(): ApiHealthSnapshot {
    const platformSnapshot = platformHealthService.getSnapshot();
    const overall = apiAnalyticsEngine.overall();
    return {
      status: platformSnapshot.status,
      environment: platformSnapshot.environment,
      registeredEndpoints: contractRegistry.count(),
      requestVolume: overall.requestCount,
      errorRate: overall.requestCount === 0 ? 0 : Math.round((overall.errorCount / overall.requestCount) * 1000) / 10,
      averageLatencyMs: overall.averageLatencyMs,
      checkedAt: new Date().toISOString(),
    };
  }
}

export const apiMonitoring = new ApiMonitoring();
