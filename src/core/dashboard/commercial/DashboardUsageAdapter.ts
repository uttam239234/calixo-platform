/**
 * Calixo Platform - Dashboard Commercial Adapter
 *
 * First real consumer of the Commercial Platform's Entitlement/Usage
 * APIs anywhere in the app (both existed with zero call sites before
 * this). Thin adapter, same convention as the rest of `core/dashboard`:
 * no billing logic here, only entitlement reads and usage writes.
 * Registering a usage type type with no quota configured is
 * "unrestricted" by `EntitlementEngine`'s own design — these gates are
 * real but silently no-op until an admin actually configures a quota,
 * so today's demo behavior is unaffected.
 */
import { entitlementPlatformAPI } from "@/core/platform/commercial/EntitlementPlatformAPI";
import { usagePlatformAPI } from "@/core/platform/commercial/UsagePlatformAPI";
import type { UsagePeriod, UsageTypeDefinition } from "@/core/platform/commercial/types";

export const DASHBOARD_USAGE_TYPES: UsageTypeDefinition[] = [
  { id: "dashboard.view", name: "Dashboard View", description: "The Dashboard landing page was loaded", unit: "view", category: "core", owner: "dashboard" },
  { id: "dashboard.widgetView", name: "Widget View", description: "A dashboard widget rendered for a user", unit: "view", category: "core", owner: "dashboard" },
  { id: "dashboard.widgetVisibilityChange", name: "Widget Hide/Show", description: "A widget was hidden, shown, or pinned via the Widget Library", unit: "action", category: "core", owner: "dashboard" },
  { id: "dashboard.export", name: "Dashboard Export", description: "Exporting a dashboard report to PDF/Excel", unit: "export", category: "core", owner: "dashboard" },
  { id: "dashboard.layoutChange", name: "Layout Switch/Create/Clone", description: "A dashboard layout was switched, created, or cloned", unit: "action", category: "core", owner: "dashboard" },
  { id: "dashboard.aiRecommendationApplied", name: "AI Recommendation Applied", description: "An AI-generated dashboard recommendation was applied or dismissed", unit: "action", category: "ai", owner: "dashboard" },
  { id: "dashboard.search", name: "Command Palette Search", description: "The global command palette was opened or queried", unit: "query", category: "core", owner: "dashboard" },
];

let registered = false;

/** Safe to call more than once — registers Dashboard's usage types exactly once. */
export function registerDashboardUsageTypes(): void {
  if (registered) return;
  registered = true;
  for (const type of DASHBOARD_USAGE_TYPES) usagePlatformAPI.registerType(type);
}

export interface DashboardTenantContext {
  organizationId: string;
  workspaceId?: string;
  userId?: string;
}

/** Reads the real Entitlement Platform — returns `false` only if an admin has actually configured a quota/limit for this key and it's been reached. */
export function canUseDashboardFeature(context: DashboardTenantContext, key: string): boolean {
  return entitlementPlatformAPI.canUse({ organizationId: context.organizationId, workspaceId: context.workspaceId, userId: context.userId, key }).allowed;
}

/**
 * Writes one real Usage Platform record. Never touches billing —
 * metering only. Defensively re-registers Dashboard's usage types first
 * (a cheap, idempotent, synchronous no-op once already registered) so a
 * caller mounted before `initializeDashboardFoundation()` finishes —
 * e.g. a user pressing ⌘K during the initial load — can never race the
 * registration and throw "Unknown usage type".
 */
export function recordDashboardUsage(context: DashboardTenantContext, usageTypeId: string, quantity = 1): void {
  registerDashboardUsageTypes();
  usagePlatformAPI.record({ usageTypeId, organizationId: context.organizationId, workspaceId: context.workspaceId, userId: context.userId, quantity });
}

/** Reads a real usage total for the personalization nudges — how many times this session's org has recorded a given Dashboard usage type this period. */
export function getDashboardUsageTotal(context: DashboardTenantContext, usageTypeId: string, period: UsagePeriod = "monthly"): number {
  registerDashboardUsageTypes();
  return usagePlatformAPI.getTotal(usageTypeId, context.organizationId, period, context.workspaceId, context.userId);
}
