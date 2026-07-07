/**
 * Calixo Platform - API Analytics Platform API
 */
import { apiAnalyticsEngine } from "./ApiAnalyticsEngine";
import type { ApiRequestRecord, EndpointAnalyticsSummary } from "./types";

export class ApiAnalyticsPlatformAPI {
  forEndpoint(contractId: string): EndpointAnalyticsSummary {
    return apiAnalyticsEngine.forEndpoint(contractId);
  }

  forOrganization(organizationId: string): EndpointAnalyticsSummary {
    return apiAnalyticsEngine.forOrganization(organizationId);
  }

  forVersion(version: string): EndpointAnalyticsSummary {
    return apiAnalyticsEngine.forVersion(version);
  }

  overall(): EndpointAnalyticsSummary {
    return apiAnalyticsEngine.overall();
  }

  recentErrors(limit?: number): ApiRequestRecord[] {
    return apiAnalyticsEngine.recentErrors(limit);
  }
}

export const apiAnalyticsPlatformAPI = new ApiAnalyticsPlatformAPI();
