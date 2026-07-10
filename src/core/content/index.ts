/**
 * Calixo Platform - Content Studio Orchestration Foundation
 *
 * A thin orchestration layer only — never reimplements generation/layout/quality/brand/asset
 * logic. Mirrors `core/reputation`'s registry/engine/platform shape. No `connectors/` or
 * `automation/` subfolder: Content Studio ingests no external data of its own and owns no
 * background jobs (per the brief's explicit scope boundary).
 */

export * from "./types";

export { OutputCatalogRegistry } from "./registry/OutputCatalogRegistry";

export { contentOrchestrationEngine } from "./engine/ContentOrchestrationEngine";
export { assistantConversationEngine, ASSISTANT_QUESTION_BANK } from "./engine/AssistantConversationEngine";

export { contentPlatformAPI, ContentPlatformAPI } from "./platform/ContentPlatformAPI";

export { generateSeedHistory } from "./mock/generateContentMockData";

export { CONTENT_ORGANIZATION_ID, CONTENT_CURRENT_USER_ID } from "./tenant/ContentTenantDefaults";

export { registerContentReports } from "./reports/registerContentReports";

export { logContentEvent, logContentError, trackContentAction, trackContentTiming } from "./observability/ContentTelemetry";

export {
  registerContentUsageTypes,
  canUseContentFeature,
  recordContentUsage,
  getContentUsageTotal,
  CONTENT_USAGE_TYPES,
} from "./commercial/ContentUsageAdapter";
export type { ContentUsageTenantContext } from "./commercial/ContentUsageAdapter";

export { registerContentSkills } from "./skills/registerContentSkills";

import { registerContentReports } from "./reports/registerContentReports";
import { registerContentUsageTypes } from "./commercial/ContentUsageAdapter";

/** Registers Content Studio's Commercial Platform usage types and Reports platform definitions. Safe to call more than once. */
export function initializeContentFoundation() {
  registerContentUsageTypes();
  return registerContentReports();
}
