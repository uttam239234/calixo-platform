/**
 * Calixo Platform - Social Media Foundation
 *
 * Same shape as `core/ads`: an engine that computes every aggregate live from real account/post
 * arrays, a recommendation registry, and a platform API facade — replacing five independent
 * client-only Context providers (each inventing its own "our brand" numbers) with the rest of
 * the codebase's registry/engine/platform pattern.
 */

export * from "./types";

export { SocialEngine, socialEngine, computeSocialOverview, computeSocialPlatformSummaries } from "./engine/SocialEngine";

export { SocialRecommendationRegistry, socialRecommendationRegistry } from "./registry/SocialRecommendationRegistry";

export { SocialPlatformAPI, socialPlatformAPI } from "./platform/SocialPlatformAPI";

export { generateSocialAccounts, generateSocialPosts, createPostId, SOCIAL_RECOMMENDATIONS_SEED, SOCIAL_PLATFORM_ALIAS } from "./mock/generateSocialMockData";

export { SOCIAL_ORGANIZATION_ID, SOCIAL_CURRENT_USER_ID } from "./tenant/SocialTenantDefaults";

export { syncSocialAccountsFromConnectors, getLastSocialConnectorSyncResult, getLiveSocialAccountStatus } from "./connectors/SocialConnectorAdapter";
export type { SocialConnectorSyncResult, SocialLiveConnectorStatus } from "./connectors/SocialConnectorAdapter";

export { registerSocialAutomationWiring, socialAutomationRuleRegistry, SocialAutomationRuleRegistry } from "./automation/SocialAutomationAdapter";
export type { SocialAutomationAction, SocialAutomationRule } from "./automation/SocialAutomationAdapter";

export { registerSocialReports } from "./reports/registerSocialReports";

export { logSocialEvent, logSocialError, trackSocialAction, trackSocialTiming } from "./observability/SocialTelemetry";

export { registerSocialUsageTypes, canUseSocialFeature, recordSocialUsage, getSocialUsageTotal, SOCIAL_USAGE_TYPES } from "./commercial/SocialUsageAdapter";
export type { SocialUsageTenantContext } from "./commercial/SocialUsageAdapter";

import { registerSocialAutomationWiring } from "./automation/SocialAutomationAdapter";
import { registerSocialReports } from "./reports/registerSocialReports";
import { registerSocialUsageTypes } from "./commercial/SocialUsageAdapter";

/** Accounts/posts are generated eagerly by the `socialEngine` singleton's constructor. Registers Social's Commercial Platform usage types, the real Execution Platform worker/execution types, and Social's Reports platform definitions. Safe to call more than once — always returns the same report ids. */
export function initializeSocialFoundation(): { engagementReportId: string; platformReportId: string } {
  registerSocialUsageTypes();
  registerSocialAutomationWiring();
  return registerSocialReports();
}
