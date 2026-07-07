/**
 * Calixo Platform - API Observability
 *
 * Wraps Phase 6's real `apiAnalyticsEngine`/`apiMonitoring` — no second API
 * telemetry store.
 */
import { apiAnalyticsEngine } from "@/core/platform/api/ApiAnalyticsEngine";
import { apiMonitoring, type ApiHealthSnapshot } from "@/core/platform/api/ApiMonitoring";

export class ApiObservability {
  getHealth(): ApiHealthSnapshot {
    return apiMonitoring.getHealth();
  }

  getOverall() {
    return apiAnalyticsEngine.overall();
  }

  getForEndpoint(contractId: string) {
    return apiAnalyticsEngine.forEndpoint(contractId);
  }

  getForOrganization(organizationId: string) {
    return apiAnalyticsEngine.forOrganization(organizationId);
  }

  getRecentErrors(limit?: number) {
    return apiAnalyticsEngine.recentErrors(limit);
  }
}

export const apiObservability = new ApiObservability();
