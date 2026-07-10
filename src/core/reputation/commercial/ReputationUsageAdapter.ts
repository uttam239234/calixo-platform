/**
 * Calixo Platform - Reputation Commercial Adapter
 *
 * Same thin-adapter convention as `SocialUsageAdapter.ts`: no billing logic here, only
 * entitlement reads and usage writes against the real Commercial Platform.
 */
import { entitlementPlatformAPI } from "@/core/platform/commercial/EntitlementPlatformAPI";
import { usagePlatformAPI } from "@/core/platform/commercial/UsagePlatformAPI";
import type { UsagePeriod, UsageTypeDefinition } from "@/core/platform/commercial/types";

export const REPUTATION_USAGE_TYPES: UsageTypeDefinition[] = [
  { id: "reputation.dashboardView", name: "Brand Monitoring View", description: "The Brand Monitoring dashboard was loaded", unit: "view", category: "core", owner: "brand-monitoring" },
  { id: "reputation.keywordMonitored", name: "Keyword Monitored", description: "A keyword was added to tracked keywords", unit: "action", category: "core", owner: "brand-monitoring" },
  { id: "reputation.competitorMonitored", name: "Competitor Monitored", description: "A competitor was added to tracked competitors", unit: "action", category: "core", owner: "brand-monitoring" },
  { id: "reputation.mentionResolved", name: "Mention Resolved", description: "A brand mention was marked resolved", unit: "action", category: "core", owner: "brand-monitoring" },
  { id: "reputation.alertTriggered", name: "Alert Triggered", description: "A crisis or mention alert fired", unit: "action", category: "core", owner: "brand-monitoring" },
  { id: "reputation.export", name: "Reputation Export", description: "Exporting mention/sentiment/competitor data", unit: "export", category: "core", owner: "brand-monitoring" },
  { id: "reputation.reportGenerated", name: "Reputation Report Generated", description: "A Brand Monitoring report was generated or scheduled", unit: "action", category: "core", owner: "brand-monitoring" },
];

let registered = false;

/** Safe to call more than once — registers Brand Monitoring's usage types exactly once. */
export function registerReputationUsageTypes(): void {
  if (registered) return;
  registered = true;
  for (const type of REPUTATION_USAGE_TYPES) usagePlatformAPI.registerType(type);
}

export interface ReputationUsageTenantContext {
  organizationId: string;
  workspaceId?: string;
  userId?: string;
}

/** Reads the real Entitlement Platform — returns `false` only if an admin has actually configured a quota/limit for this key and it's been reached. */
export function canUseReputationFeature(context: ReputationUsageTenantContext, key: string): boolean {
  return entitlementPlatformAPI.canUse({ organizationId: context.organizationId, workspaceId: context.workspaceId, userId: context.userId, key }).allowed;
}

/** Writes one real Usage Platform record. Defensively re-registers Reputation's usage types first (cheap, idempotent). */
export function recordReputationUsage(context: ReputationUsageTenantContext, usageTypeId: string, quantity = 1): void {
  registerReputationUsageTypes();
  usagePlatformAPI.record({ usageTypeId, organizationId: context.organizationId, workspaceId: context.workspaceId, userId: context.userId, quantity });
}

/** Reads a real usage total for this period. */
export function getReputationUsageTotal(context: ReputationUsageTenantContext, usageTypeId: string, period: UsagePeriod = "monthly"): number {
  registerReputationUsageTypes();
  return usagePlatformAPI.getTotal(usageTypeId, context.organizationId, period, context.workspaceId, context.userId);
}
