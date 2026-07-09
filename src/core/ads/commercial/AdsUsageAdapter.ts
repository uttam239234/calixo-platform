/**
 * Calixo Platform - Ads Commercial Adapter
 *
 * Same thin-adapter convention as `AnalyticsUsageAdapter.ts`: no billing logic here, only
 * entitlement reads and usage writes against the real Commercial Platform.
 */
import { entitlementPlatformAPI } from "@/core/platform/commercial/EntitlementPlatformAPI";
import { usagePlatformAPI } from "@/core/platform/commercial/UsagePlatformAPI";
import type { UsagePeriod, UsageTypeDefinition } from "@/core/platform/commercial/types";

export const ADS_USAGE_TYPES: UsageTypeDefinition[] = [
  { id: "ads.campaignView", name: "Ads Manager View", description: "The Ads Manager page was loaded", unit: "view", category: "core", owner: "ads" },
  { id: "ads.campaignCreated", name: "Campaign Created", description: "A new campaign was published via the campaign wizard", unit: "action", category: "core", owner: "ads" },
  { id: "ads.campaignAction", name: "Campaign Action", description: "A pause/resume/archive/delete/duplicate action was applied to a campaign", unit: "action", category: "core", owner: "ads" },
  { id: "ads.export", name: "Ads Export", description: "Exporting campaign data to CSV", unit: "export", category: "core", owner: "ads" },
  { id: "ads.recommendationApplied", name: "Recommendation Applied", description: "An AI optimization recommendation was applied or dismissed", unit: "action", category: "ai", owner: "ads" },
  { id: "ads.automationRuleCreated", name: "Automation Rule Created", description: "A new campaign automation rule was created", unit: "action", category: "core", owner: "ads" },
  { id: "ads.search", name: "Ads Search", description: "The global Ads Manager command palette was opened", unit: "query", category: "core", owner: "ads" },
];

let registered = false;

/** Safe to call more than once — registers Ads Manager's usage types exactly once. */
export function registerAdsUsageTypes(): void {
  if (registered) return;
  registered = true;
  for (const type of ADS_USAGE_TYPES) usagePlatformAPI.registerType(type);
}

export interface AdsTenantContext {
  organizationId: string;
  workspaceId?: string;
  userId?: string;
}

/** Reads the real Entitlement Platform — returns `false` only if an admin has actually configured a quota/limit for this key and it's been reached. */
export function canUseAdsFeature(context: AdsTenantContext, key: string): boolean {
  return entitlementPlatformAPI.canUse({ organizationId: context.organizationId, workspaceId: context.workspaceId, userId: context.userId, key }).allowed;
}

/**
 * Writes one real Usage Platform record. Defensively re-registers Ads' usage types first
 * (cheap, idempotent) so a caller mounted before any explicit registration step can never
 * race it and throw "Unknown usage type" — the same class of bug the Dashboard certification
 * pass found and fixed in `DashboardUsageAdapter.ts`.
 */
export function recordAdsUsage(context: AdsTenantContext, usageTypeId: string, quantity = 1): void {
  registerAdsUsageTypes();
  usagePlatformAPI.record({ usageTypeId, organizationId: context.organizationId, workspaceId: context.workspaceId, userId: context.userId, quantity });
}

/** Reads a real usage total — how many times this session's org has recorded a given Ads usage type this period. */
export function getAdsUsageTotal(context: AdsTenantContext, usageTypeId: string, period: UsagePeriod = "monthly"): number {
  registerAdsUsageTypes();
  return usagePlatformAPI.getTotal(usageTypeId, context.organizationId, period, context.workspaceId, context.userId);
}
