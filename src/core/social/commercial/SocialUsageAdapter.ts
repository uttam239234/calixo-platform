/**
 * Calixo Platform - Social Commercial Adapter
 *
 * Same thin-adapter convention as `AdsUsageAdapter.ts`: no billing logic here, only entitlement
 * reads and usage writes against the real Commercial Platform.
 */
import { entitlementPlatformAPI } from "@/core/platform/commercial/EntitlementPlatformAPI";
import { usagePlatformAPI } from "@/core/platform/commercial/UsagePlatformAPI";
import type { UsagePeriod, UsageTypeDefinition } from "@/core/platform/commercial/types";

export const SOCIAL_USAGE_TYPES: UsageTypeDefinition[] = [
  { id: "social.dashboardView", name: "Social Media View", description: "The Social Media dashboard was loaded", unit: "view", category: "core", owner: "social" },
  { id: "social.accountConnected", name: "Social Account Connected", description: "A social account connection was toggled", unit: "action", category: "core", owner: "social" },
  { id: "social.postPublished", name: "Post Published", description: "A post was published or scheduled across one or more platforms", unit: "action", category: "core", owner: "social" },
  { id: "social.aiGeneration", name: "AI Generation", description: "The composer's AI assistant generated or rewrote content", unit: "action", category: "ai", owner: "social" },
  { id: "social.export", name: "Social Export", description: "Exporting social/engagement/competitor data", unit: "export", category: "core", owner: "social" },
  { id: "social.reportGenerated", name: "Social Report Generated", description: "A Social report was generated or scheduled", unit: "action", category: "core", owner: "social" },
  { id: "social.automationRuleCreated", name: "Automation Rule Created", description: "A new social automation rule was created", unit: "action", category: "core", owner: "social" },
];

let registered = false;

/** Safe to call more than once — registers Social Media's usage types exactly once. */
export function registerSocialUsageTypes(): void {
  if (registered) return;
  registered = true;
  for (const type of SOCIAL_USAGE_TYPES) usagePlatformAPI.registerType(type);
}

export interface SocialUsageTenantContext {
  organizationId: string;
  workspaceId?: string;
  userId?: string;
}

/** Reads the real Entitlement Platform — returns `false` only if an admin has actually configured a quota/limit for this key and it's been reached. */
export function canUseSocialFeature(context: SocialUsageTenantContext, key: string): boolean {
  return entitlementPlatformAPI.canUse({ organizationId: context.organizationId, workspaceId: context.workspaceId, userId: context.userId, key }).allowed;
}

/**
 * Writes one real Usage Platform record. Defensively re-registers Social's usage types first
 * (cheap, idempotent) so a caller mounted before any explicit registration step can never race
 * it and throw "Unknown usage type" — the same class of bug the Dashboard certification pass
 * found and fixed.
 */
export function recordSocialUsage(context: SocialUsageTenantContext, usageTypeId: string, quantity = 1): void {
  registerSocialUsageTypes();
  usagePlatformAPI.record({ usageTypeId, organizationId: context.organizationId, workspaceId: context.workspaceId, userId: context.userId, quantity });
}

/** Reads a real usage total — how many times this session's org has recorded a given Social usage type this period. */
export function getSocialUsageTotal(context: SocialUsageTenantContext, usageTypeId: string, period: UsagePeriod = "monthly"): number {
  registerSocialUsageTypes();
  return usagePlatformAPI.getTotal(usageTypeId, context.organizationId, period, context.workspaceId, context.userId);
}
