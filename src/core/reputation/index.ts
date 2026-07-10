/**
 * Calixo Platform - Reputation Intelligence Foundation
 *
 * Same shape as `core/social`: an engine that computes every aggregate live from a real mention
 * array, a crisis-detection registry, and a platform API facade — replacing 10 presentational
 * components that all imported directly from a static `lib/brand-data.ts` fixture with the rest
 * of the codebase's registry/engine/platform pattern.
 */

export * from "./types";

export { ReputationEngine, reputationEngine, computeCountryDistribution, computeKeywordCloud, computeOverview, computePlatformDistribution, computeSentimentTimeline } from "./engine/ReputationEngine";

export { CrisisDetectionRegistry, crisisDetectionRegistry } from "./registry/CrisisDetectionRegistry";

export { ReputationPlatformAPI, reputationPlatformAPI } from "./platform/ReputationPlatformAPI";
export type { SentimentDriver } from "./platform/ReputationPlatformAPI";

export {
  ALERT_RULES_SEED,
  BRAND_REPORTS_SEED,
  COMPETITOR_SEED,
  generateBrandMentions,
  createMentionId,
  REPUTATION_PLATFORM_COLOR,
  REPUTATION_PLATFORM_ICON,
  REPUTATION_SETTINGS_SEED,
  SHARE_OF_VOICE_TIMELINE_SEED,
  TRENDING_TOPICS_SEED,
} from "./mock/generateReputationMockData";

export { REPUTATION_ORGANIZATION_ID, REPUTATION_CURRENT_USER_ID } from "./tenant/ReputationTenantDefaults";

export { getLiveReputationSourceStatus, getReputationSourceStatuses, syncReputationSourcesFromConnectors } from "./connectors/ReputationConnectorAdapter";
export type { ReputationSourceHealth, ReputationSourceStatus } from "./connectors/ReputationConnectorAdapter";

export { registerReputationAutomationWiring, reputationAutomationRuleRegistry, ReputationAutomationRuleRegistry, REPUTATION_MENTIONS_SYNC_EXECUTION_TYPE, REPUTATION_REPORT_GENERATE_EXECUTION_TYPE } from "./automation/ReputationAutomationAdapter";
export type { ReputationAutomationAction, ReputationAutomationRule } from "./automation/ReputationAutomationAdapter";

export { registerReputationReports } from "./reports/registerReputationReports";

export { logReputationEvent, logReputationError, trackReputationAction, trackReputationTiming } from "./observability/ReputationTelemetry";

export { registerReputationUsageTypes, canUseReputationFeature, recordReputationUsage, getReputationUsageTotal, REPUTATION_USAGE_TYPES } from "./commercial/ReputationUsageAdapter";
export type { ReputationUsageTenantContext } from "./commercial/ReputationUsageAdapter";

export { registerReputationSkills } from "./skills/registerReputationSkills";

import { registerReputationAutomationWiring } from "./automation/ReputationAutomationAdapter";
import { registerReputationReports } from "./reports/registerReputationReports";
import { registerReputationUsageTypes } from "./commercial/ReputationUsageAdapter";

/** Mentions are generated eagerly by the `reputationEngine` singleton's constructor. Registers Reputation's Commercial Platform usage types, the real Execution Platform worker/execution types, and Reputation's Reports platform definitions. Safe to call more than once. */
export function initializeReputationFoundation() {
  registerReputationUsageTypes();
  registerReputationAutomationWiring();
  return registerReputationReports();
}
