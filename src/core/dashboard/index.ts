/**
 * Calixo Platform - Dashboard Foundation
 *
 * The Dashboard landing page's own composition layer. It owns no data —
 * it adapts real, already-built engines (WorkflowEngine, the
 * Communication Platform) into dashboard-shaped view models. Modules
 * integrate by being read here; nothing in this folder should ever need
 * to change for a new module to contribute a KPI or activity feed.
 *
 * This is the foundation only: no UI.
 */

import { initializeCommunicationPlatform } from "@/communication";
import { initializeAccessControlFoundation } from "@/core/platform/access";
import { seedDashboardNotifications } from "./mock/seedDashboardNotifications";
import { seedDashboardLayouts } from "./layouts/seedDashboardLayouts";
import { seedDashboardConnections } from "./integrations/seedDashboardConnections";
import { registerDashboardReports } from "./reports/registerDashboardReports";
import { registerDashboardSettings } from "./settings/registerDashboardSettings";
import { registerDashboardUsageTypes } from "./commercial/DashboardUsageAdapter";

export * from "./types";
export * from "./layouts/types";
export { GoalEngine, goalEngine } from "@/core/platform/goals";
export type { Goal, GoalPeriod, GoalScorecardEntry, GoalStatus } from "@/core/platform/goals";

export { DashboardEngine, dashboardEngine } from "./engine/DashboardEngine";
export { DashboardLayoutRegistry, dashboardLayoutRegistry } from "./layouts/DashboardLayoutRegistry";
export { dashboardActivityLog } from "./activity/DashboardActivityLog";

export { registerDashboardSkills } from "./skills/registerDashboardSkills";
export { registerDashboardReports } from "./reports/registerDashboardReports";
export { registerDashboardSettings } from "./settings/registerDashboardSettings";
export { seedDashboardLayouts } from "./layouts/seedDashboardLayouts";
export { seedDashboardConnections, DASHBOARD_ORGANIZATION_ID } from "./integrations/seedDashboardConnections";

export { seedDashboardNotifications, DASHBOARD_CURRENT_USER_ID } from "./mock/seedDashboardNotifications";
export { registerDashboardUsageTypes, canUseDashboardFeature, recordDashboardUsage, getDashboardUsageTotal, DASHBOARD_USAGE_TYPES } from "./commercial/DashboardUsageAdapter";
export type { DashboardTenantContext } from "./commercial/DashboardUsageAdapter";
export { logDashboardEvent, logDashboardError, trackDashboardAction, trackDashboardLoadTime } from "./observability/DashboardTelemetry";

let initPromise: Promise<void> | null = null;

/**
 * Boots the Communication Platform, seeds demo notifications, registers
 * the nine default dashboard layouts, seeds real Integration Framework
 * connections, registers Dashboard's Reports-platform report definitions,
 * registers Dashboard's personalization settings, and registers Dashboard's
 * Commercial Platform usage types. Safe to call more than once —
 * concurrent callers (e.g. React Strict Mode's double effect invocation)
 * all await the same in-flight promise rather than racing a boolean guard.
 */
export function initializeDashboardFoundation(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      await initializeCommunicationPlatform();
      await initializeAccessControlFoundation();
      await seedDashboardNotifications();
      seedDashboardLayouts();
      await seedDashboardConnections();
      registerDashboardReports();
      registerDashboardSettings();
      registerDashboardUsageTypes();
    })();
  }
  return initPromise;
}
