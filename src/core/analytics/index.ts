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
import { seedAnalyticsDashboards } from "./dashboards/seedAnalyticsDashboards";
import { seedAnalyticsSegments } from "./segments/seedAnalyticsSegments";

export * from "./types";
export type { AnalyticsDataSource } from "./engine/AnalyticsEngine";

export { AnalyticsEngine, analyticsEngine } from "./engine/AnalyticsEngine";

export { AnalyticsMetricRegistry, analyticsMetricRegistry, registerAnalyticsMetrics, registerDefaultAnalyticsMetrics } from "./registry/AnalyticsMetricRegistry";
export type { AnalyticsMetricDefinition, AnalyticsMetricAggregation, AnalyticsMetricFormat } from "./registry/AnalyticsMetricRegistry";

export { registerAnalyticsReports } from "./reports/registerAnalyticsReports";

export { registerAnalyticsSkills } from "./skills/registerAnalyticsSkills";

export { generateAnalyticsFacts } from "./mock/generateAnalyticsFacts";

export * from "./dashboards/types";
export { AnalyticsDashboardRegistry, analyticsDashboardRegistry } from "./dashboards/AnalyticsDashboardRegistry";
export { seedAnalyticsDashboards } from "./dashboards/seedAnalyticsDashboards";

export type { AnalyticsSegment, SegmentKind } from "./segments/types";
export { SegmentRegistry, segmentRegistry } from "./segments/SegmentRegistry";
export { seedAnalyticsSegments } from "./segments/seedAnalyticsSegments";

export * from "./platform/contracts";
export { AnalyticsPlatformAPI, analyticsPlatformAPI } from "./platform/AnalyticsPlatformAPI";

/**
 * Registers the default custom-metric catalog, Analytics' report
 * definitions, its 7 default dashboards, and its starter segments. Safe
 * to call more than once — always returns the same report ids.
 */
export function initializeAnalyticsFoundation(): { channelReportId: string; trafficReportId: string; executiveReportId: string; revenueReportId: string; audienceReportId: string } {
  registerDefaultAnalyticsMetrics();
  seedAnalyticsDashboards();
  seedAnalyticsSegments();
  return registerAnalyticsReports();
}
