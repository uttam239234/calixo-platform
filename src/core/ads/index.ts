/**
 * Calixo Platform - Ads Manager Foundation
 *
 * Same shape as `core/analytics`: an engine that computes every aggregate live
 * from a real campaign array, a recommendation registry, and a platform API
 * facade — replacing the client-only `features/ads/mock-data.ts` + Context
 * data layer with the rest of the codebase's registry/engine/platform pattern.
 */

export * from "./types";

export { AdsEngine, adsEngine } from "./engine/AdsEngine";

export { AdsRecommendationRegistry, adsRecommendationRegistry } from "./registry/AdsRecommendationRegistry";

export { AdsPlatformAPI, adsPlatformAPI } from "./platform/AdsPlatformAPI";

export { generateAdsCampaigns, ADS_PLATFORM_META } from "./mock/generateAdsMockData";

export { ADS_ORGANIZATION_ID, ADS_CURRENT_USER_ID } from "./tenant/AdsTenantDefaults";

export { registerAdsUsageTypes, canUseAdsFeature, recordAdsUsage, getAdsUsageTotal, ADS_USAGE_TYPES } from "./commercial/AdsUsageAdapter";
export type { AdsTenantContext } from "./commercial/AdsUsageAdapter";

export { logAdsEvent, logAdsError, trackAdsAction, trackAdsTiming } from "./observability/AdsTelemetry";

export { syncAdsPlatformsFromConnectors, getLastAdsConnectorSyncResult, getLiveAdsPlatformStatus } from "./connectors/AdsConnectorAdapter";
export type { AdsConnectorSyncResult, AdsLiveConnectorStatus } from "./connectors/AdsConnectorAdapter";

export { registerAdsReports } from "./reports/registerAdsReports";

export { registerAdsAutomationWiring, adsAutomationRuleRegistry, AdsAutomationRuleRegistry } from "./automation/AdsAutomationAdapter";
export type { AdsAutomationAction, AdsAutomationRule } from "./automation/AdsAutomationAdapter";

import { registerAdsUsageTypes } from "./commercial/AdsUsageAdapter";
import { registerAdsReports } from "./reports/registerAdsReports";
import { registerAdsAutomationWiring } from "./automation/AdsAutomationAdapter";

/** Campaigns are generated eagerly by the `adsEngine` singleton's constructor. Registers Ads' Commercial Platform usage types, its Reports platform definitions, and its real Execution Platform worker/execution types. Safe to call more than once — always returns the same report ids. */
export function initializeAdsFoundation(): { campaignReportId: string; budgetReportId: string } {
  registerAdsUsageTypes();
  registerAdsAutomationWiring();
  return registerAdsReports();
}
