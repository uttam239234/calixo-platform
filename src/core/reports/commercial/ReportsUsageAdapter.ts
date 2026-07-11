/**
 * Calixo Platform - Reports Commercial Adapter
 *
 * Same thin-adapter convention as `ContentUsageAdapter.ts`/`CopilotUsageAdapter.ts`:
 * no billing logic here, only entitlement reads and usage writes against
 * the real Commercial Platform. Tracks exactly the brief's named list:
 * report count, exports, schedules, AI-generated reports.
 */
import { entitlementPlatformAPI } from "@/core/platform/commercial/EntitlementPlatformAPI";
import { usagePlatformAPI } from "@/core/platform/commercial/UsagePlatformAPI";
import type { UsagePeriod, UsageTypeDefinition } from "@/core/platform/commercial/types";

export const REPORTS_USAGE_TYPES: UsageTypeDefinition[] = [
  { id: "reports.reportCreated", name: "Report Created", description: "A new report was saved", unit: "action", category: "core", owner: "reports" },
  { id: "reports.export", name: "Report Export", description: "A report was exported", unit: "export", category: "core", owner: "reports" },
  { id: "reports.schedule", name: "Report Schedule", description: "A recurring delivery schedule was created", unit: "action", category: "core", owner: "reports" },
  { id: "reports.aiGenerated", name: "AI-Generated Report", description: "The AI Report Assistant generated a report", unit: "action", category: "core", owner: "reports" },
];

let registered = false;

/** Safe to call more than once — registers Reports' usage types exactly once. */
export function registerReportsUsageTypes(): void {
  if (registered) return;
  registered = true;
  for (const type of REPORTS_USAGE_TYPES) usagePlatformAPI.registerType(type);
}

export interface ReportsUsageTenantContext {
  organizationId: string;
  workspaceId?: string;
  userId?: string;
}

/** Reads the real Entitlement Platform — returns `false` only if an admin has actually configured a quota/limit for this key and it's been reached. */
export function canUseReportsFeature(context: ReportsUsageTenantContext, key: string): boolean {
  return entitlementPlatformAPI.canUse({ organizationId: context.organizationId, workspaceId: context.workspaceId, userId: context.userId, key }).allowed;
}

/** Writes one real Usage Platform record. Defensively re-registers Reports' usage types first (cheap, idempotent). */
export function recordReportsUsage(context: ReportsUsageTenantContext, usageTypeId: string, quantity = 1): void {
  registerReportsUsageTypes();
  usagePlatformAPI.record({ usageTypeId, organizationId: context.organizationId, workspaceId: context.workspaceId, userId: context.userId, quantity });
}

/** Reads a real usage total for this period. */
export function getReportsUsageTotal(context: ReportsUsageTenantContext, usageTypeId: string, period: UsagePeriod = "monthly"): number {
  registerReportsUsageTypes();
  return usagePlatformAPI.getTotal(usageTypeId, context.organizationId, period, context.workspaceId, context.userId);
}
