/**
 * Calixo Platform - Enterprise Analytics Foundation
 *
 * Reusable, module-agnostic analytics building blocks: a fact-based
 * computation engine, a custom-metric registry, and integration points
 * into the Reports platform and AIOS. Everything a view renders is
 * computed from the fact table at query time — nothing is hardcoded
 * per-view.
 *
 * This is the foundation only: no UI, no real data warehouse — the fact
 * table is realistic synthetic data, exactly like every other platform's
 * mock layer in this codebase.
 */

import { registerDefaultAnalyticsMetrics } from "./registry/AnalyticsMetricRegistry";
import { registerAnalyticsReports } from "./reports/registerAnalyticsReports";
import { seedAnalyticsSegments } from "./segments/seedAnalyticsSegments";
import { registerAnalyticsUsageTypes } from "./commercial/AnalyticsUsageAdapter";

export * from "./types";
export type { AnalyticsDataSource } from "./engine/AnalyticsEngine";

export { AnalyticsEngine, analyticsEngine } from "./engine/AnalyticsEngine";

export { AnalyticsMetricRegistry, analyticsMetricRegistry, registerAnalyticsMetrics, registerDefaultAnalyticsMetrics } from "./registry/AnalyticsMetricRegistry";
export type { AnalyticsMetricDefinition, AnalyticsMetricAggregation, AnalyticsMetricFormat } from "./registry/AnalyticsMetricRegistry";

export { registerAnalyticsReports } from "./reports/registerAnalyticsReports";

export { registerAnalyticsSkills } from "./skills/registerAnalyticsSkills";

export { generateAnalyticsFacts } from "./mock/generateAnalyticsFacts";

export * from "./dashboards/types";
// `AnalyticsDashboardRegistry`/`analyticsDashboardRegistry`/`seedAnalyticsDashboards`
// are deliberately NOT re-exported here (Round 23): that registry is now
// `import "server-only"`-tagged and file-persisted — re-exporting it from
// this barrel would risk pulling server-only code into every client
// component that imports anything else from `@/core/analytics`. Server
// Actions (`features/analytics/layoutActions.ts`) import the deep path
// (`./dashboards/AnalyticsDashboardRegistry`, `./dashboards/seedAnalyticsDashboards`) directly.

export type { AnalyticsSegment, SegmentKind } from "./segments/types";
export { SegmentRegistry, segmentRegistry } from "./segments/SegmentRegistry";
export { seedAnalyticsSegments } from "./segments/seedAnalyticsSegments";

export * from "./platform/contracts";
export { AnalyticsPlatformAPI, analyticsPlatformAPI } from "./platform/AnalyticsPlatformAPI";

export { ANALYTICS_ORGANIZATION_ID, ANALYTICS_CURRENT_USER_ID } from "./tenant/AnalyticsTenantDefaults";

export { registerAnalyticsUsageTypes, canUseAnalyticsFeature, recordAnalyticsUsage, getAnalyticsUsageTotal, ANALYTICS_USAGE_TYPES } from "./commercial/AnalyticsUsageAdapter";
export type { AnalyticsTenantContext } from "./commercial/AnalyticsUsageAdapter";

export { logAnalyticsEvent, logAnalyticsError, trackAnalyticsAction, trackAnalyticsTiming } from "./observability/AnalyticsTelemetry";

export { syncAnalyticsFactsFromConnectors, getLastConnectorSyncResult } from "./connectors/AnalyticsConnectorFactsAdapter";
export type { AnalyticsConnectorSyncResult } from "./connectors/AnalyticsConnectorFactsAdapter";

export type { AnalyticsAnnotation } from "./annotations/types";
export { AnalyticsAnnotationRegistry, analyticsAnnotationRegistry } from "./annotations/AnalyticsAnnotationRegistry";

/**
 * Registers the default custom-metric catalog, Analytics' report
 * definitions, its starter segments, and its Commercial Platform usage
 * types. Safe to call more than once — always returns the same report
 * ids. Client-callable (no server-only dependency) — the 7 default
 * dashboard templates are seeded separately, server-side, by
 * `features/analytics/layoutActions.ts` (see note above on why the
 * registry itself isn't re-exported from this barrel).
 */
export function initializeAnalyticsFoundation(): { channelReportId: string; trafficReportId: string; executiveReportId: string; revenueReportId: string; audienceReportId: string } {
  registerDefaultAnalyticsMetrics();
  seedAnalyticsSegments();
  registerAnalyticsUsageTypes();
  return registerAnalyticsReports();
}
