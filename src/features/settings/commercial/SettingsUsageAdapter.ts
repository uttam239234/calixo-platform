/**
 * Calixo Platform - Settings Commercial Adapter
 *
 * Same thin-adapter convention as `ReportsUsageAdapter.ts`/`ContentUsageAdapter.ts`
 * — no billing logic here, only usage writes against the real Commercial
 * Platform. Tracks: organization created, organization updated, setting
 * changed — "track usage, never bill internally."
 */
import { usagePlatformAPI } from "@/core/platform/commercial/UsagePlatformAPI";
import type { UsageTypeDefinition } from "@/core/platform/commercial/types";

export const SETTINGS_USAGE_TYPES: UsageTypeDefinition[] = [
  { id: "settings.organizationCreated", name: "Organization Created", description: "A new organization was created", unit: "action", category: "core", owner: "settings" },
  { id: "settings.organizationUpdated", name: "Organization Updated", description: "Organization profile/branding/preferences/security was changed", unit: "action", category: "core", owner: "settings" },
  { id: "settings.organizationSwitched", name: "Organization Switched", description: "The user switched their current organization", unit: "action", category: "core", owner: "settings" },
];

let registered = false;

/** Safe to call more than once — registers Settings' usage types exactly once. */
export function registerSettingsUsageTypes(): void {
  if (registered) return;
  registered = true;
  for (const type of SETTINGS_USAGE_TYPES) usagePlatformAPI.registerType(type);
}

export interface SettingsUsageTenantContext {
  organizationId: string;
  workspaceId?: string;
  userId?: string;
}

/** Writes one real Usage Platform record. Defensively re-registers Settings' usage types first (cheap, idempotent). */
export function recordSettingsUsage(context: SettingsUsageTenantContext, usageTypeId: string, quantity = 1): void {
  registerSettingsUsageTypes();
  usagePlatformAPI.record({ usageTypeId, organizationId: context.organizationId, workspaceId: context.workspaceId, userId: context.userId, quantity });
}
