/**
 * Calixo Platform - Analytics Commercial Adapter
 *
 * Same thin-adapter convention as `core/dashboard/commercial/DashboardUsageAdapter.ts`:
 * no billing logic here, only entitlement reads and usage writes against
 * the real Commercial Platform. Registering a usage type with no quota
 * configured is "unrestricted" by `EntitlementEngine`'s own design — these
 * gates are real but silently no-op until an admin actually configures a
 * quota, so today's demo behavior is unaffected.
 */
import { entitlementPlatformAPI } from "@/core/platform/commercial/EntitlementPlatformAPI";
import { usagePlatformAPI } from "@/core/platform/commercial/UsagePlatformAPI";
import type { UsagePeriod, UsageTypeDefinition } from "@/core/platform/commercial/types";

export const ANALYTICS_USAGE_TYPES: UsageTypeDefinition[] = [
  { id: "analytics.dashboardView", name: "Analytics Dashboard View", description: "The Analytics page was loaded", unit: "view", category: "core", owner: "analytics" },
  { id: "analytics.reportExecution", name: "Analytics Report Execution", description: "An Analytics-fed report was executed", unit: "action", category: "core", owner: "analytics" },
  { id: "analytics.export", name: "Analytics Export", description: "Exporting analytics data to PDF/Excel", unit: "export", category: "core", owner: "analytics" },
  { id: "analytics.customMetricCreated", name: "Custom Metric Created", description: "A custom KPI was defined via the Custom KPI Builder", unit: "action", category: "core", owner: "analytics" },
  { id: "analytics.segmentCreated", name: "Segment Created", description: "A saved segment was created", unit: "action", category: "core", owner: "analytics" },
  { id: "analytics.aiInsightViewed", name: "AI Insight Applied", description: "An AI insight was applied or dismissed", unit: "action", category: "ai", owner: "analytics" },
  { id: "analytics.forecastRun", name: "Forecast Run", description: "A revenue forecast was computed", unit: "action", category: "ai", owner: "analytics" },
  { id: "analytics.dashboardCreated", name: "Analytics Dashboard Created", description: "A new Analytics dashboard layout was created or cloned", unit: "action", category: "core", owner: "analytics" },
  { id: "analytics.widgetCreated", name: "Analytics Widget Change", description: "A widget was hidden, shown, or pinned via the Widget Library", unit: "action", category: "core", owner: "analytics" },
  { id: "analytics.chartInteraction", name: "Chart Interaction", description: "A chart/cross-filter interaction (channel/campaign/region selection)", unit: "action", category: "core", owner: "analytics" },
  { id: "analytics.search", name: "Analytics Search", description: "The global Analytics command palette was opened", unit: "query", category: "core", owner: "analytics" },
];

let registered = false;

/** Safe to call more than once — registers Analytics' usage types exactly once. */
export function registerAnalyticsUsageTypes(): void {
  if (registered) return;
  registered = true;
  for (const type of ANALYTICS_USAGE_TYPES) usagePlatformAPI.registerType(type);
}

export interface AnalyticsTenantContext {
  organizationId: string;
  workspaceId?: string;
  userId?: string;
}

/** Reads the real Entitlement Platform — returns `false` only if an admin has actually configured a quota/limit for this key and it's been reached. */
export function canUseAnalyticsFeature(context: AnalyticsTenantContext, key: string): boolean {
  return entitlementPlatformAPI.canUse({ organizationId: context.organizationId, workspaceId: context.workspaceId, userId: context.userId, key }).allowed;
}

/**
 * Writes one real Usage Platform record. Defensively re-registers
 * Analytics' usage types first (cheap, idempotent) so a caller mounted
 * before any explicit registration step can never race it and throw
 * "Unknown usage type" — the exact bug the Dashboard certification pass
 * found and fixed.
 */
export function recordAnalyticsUsage(context: AnalyticsTenantContext, usageTypeId: string, quantity = 1): void {
  registerAnalyticsUsageTypes();
  usagePlatformAPI.record({ usageTypeId, organizationId: context.organizationId, workspaceId: context.workspaceId, userId: context.userId, quantity });
}

/** Reads a real usage total — how many times this session's org has recorded a given Analytics usage type this period. */
export function getAnalyticsUsageTotal(context: AnalyticsTenantContext, usageTypeId: string, period: UsagePeriod = "monthly"): number {
  registerAnalyticsUsageTypes();
  return usagePlatformAPI.getTotal(usageTypeId, context.organizationId, period, context.workspaceId, context.userId);
}
