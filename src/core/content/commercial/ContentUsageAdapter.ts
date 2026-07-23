/**
 * Calixo Platform - Content Studio Commercial Adapter
 *
 * Same thin-adapter convention as `ReputationUsageAdapter.ts`: no billing logic here, only
 * entitlement reads and usage writes against the real Commercial Platform. Tracks exactly the
 * brief's named usage list: AI generations, creative generations, content generations, exports,
 * variants, translations.
 */
import { entitlementPlatformAPI } from "@/core/platform/commercial/EntitlementPlatformAPI";
import { usagePlatformAPI } from "@/core/platform/commercial/UsagePlatformAPI";
import type { UsagePeriod, UsageTypeDefinition } from "@/core/platform/commercial/types";

export const CONTENT_USAGE_TYPES: UsageTypeDefinition[] = [
  { id: "content.aiGeneration", name: "AI Generation", description: "Content Studio produced a generation", unit: "action", category: "core", owner: "content-studio" },
  { id: "content.creativeGeneration", name: "Creative Generation", description: "Creative Design Studio generated a visual output", unit: "action", category: "core", owner: "content-studio" },
  { id: "content.contentGeneration", name: "Content Generation", description: "Content Creation Studio generated a text output", unit: "action", category: "core", owner: "content-studio" },
  { id: "content.export", name: "Content Export", description: "A generated output was saved or exported", unit: "export", category: "core", owner: "content-studio" },
  { id: "content.variant", name: "Content Variant", description: "An additional variant was generated for an existing output", unit: "action", category: "core", owner: "content-studio" },
  { id: "content.translation", name: "Content Translation", description: "A localized version was generated for an existing output", unit: "action", category: "core", owner: "content-studio" },
];

let registered = false;

/** Safe to call more than once — registers Content Studio's usage types exactly once. */
export function registerContentUsageTypes(): void {
  if (registered) return;
  registered = true;
  for (const type of CONTENT_USAGE_TYPES) usagePlatformAPI.registerType(type);
}

export interface ContentUsageTenantContext {
  organizationId: string;
  workspaceId?: string;
  userId?: string;
}

/** Reads the real Entitlement Platform — returns `false` only if an admin has actually configured a quota/limit for this key and it's been reached. */
export function canUseContentFeature(context: ContentUsageTenantContext, key: string): boolean {
  return entitlementPlatformAPI.canUse({ organizationId: context.organizationId, workspaceId: context.workspaceId, userId: context.userId, key }).allowed;
}

/** Writes one real Usage Platform record. Defensively re-registers Content Studio's usage types first (cheap, idempotent). */
export function recordContentUsage(context: ContentUsageTenantContext, usageTypeId: string, quantity = 1): void {
  registerContentUsageTypes();
  usagePlatformAPI.record({ usageTypeId, organizationId: context.organizationId, workspaceId: context.workspaceId, userId: context.userId, quantity });
}

/** Reads a real usage total for this period. */
export function getContentUsageTotal(context: ContentUsageTenantContext, usageTypeId: string, period: UsagePeriod = "monthly"): number {
  registerContentUsageTypes();
  return usagePlatformAPI.getTotal(usageTypeId, context.organizationId, period, context.workspaceId, context.userId);
}
