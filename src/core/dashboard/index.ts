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
import { registerDashboardReports } from "./reports/registerDashboardReports";
import { registerDashboardSettings } from "./settings/registerDashboardSettings";
import { registerDashboardUsageTypes } from "./commercial/DashboardUsageAdapter";

export * from "./types";
export * from "./layouts/types";
export { GoalEngine, goalEngine } from "@/core/platform/goals";
export type { Goal, GoalPeriod, GoalScorecardEntry, GoalStatus } from "@/core/platform/goals";

export { DashboardEngine, dashboardEngine, DASHBOARD_ORGANIZATION_ID } from "./engine/DashboardEngine";
// `DashboardLayoutRegistry`/`dashboardLayoutRegistry`/`seedDashboardLayouts`
// are deliberately NOT re-exported here (Round 23): that registry is now
// `import "server-only"`-tagged and file-persisted — re-exporting it from
// this barrel would risk pulling server-only code into every client
// component that imports anything else from `@/core/dashboard`. Server
// Actions (`features/dashboard/layoutActions.ts`) import the deep path
// (`./layouts/DashboardLayoutRegistry`, `./layouts/seedDashboardLayouts`) directly.
export { dashboardActivityLog } from "./activity/DashboardActivityLog";

export { registerDashboardSkills } from "./skills/registerDashboardSkills";
export { registerDashboardReports } from "./reports/registerDashboardReports";
export { registerDashboardSettings } from "./settings/registerDashboardSettings";

export { seedDashboardNotifications, DASHBOARD_CURRENT_USER_ID } from "./mock/seedDashboardNotifications";
export { registerDashboardUsageTypes, canUseDashboardFeature, recordDashboardUsage, getDashboardUsageTotal, DASHBOARD_USAGE_TYPES } from "./commercial/DashboardUsageAdapter";
export type { DashboardTenantContext } from "./commercial/DashboardUsageAdapter";
export { logDashboardEvent, logDashboardError, trackDashboardAction, trackDashboardLoadTime } from "./observability/DashboardTelemetry";

let initPromise: Promise<void> | null = null;

/**
 * Boots the Communication Platform, seeds demo notifications, registers
 * Dashboard's Reports-platform report definitions, registers Dashboard's
 * personalization settings, and registers Dashboard's Commercial Platform
 * usage types. Connected-platform data comes from the real Universal
 * Connector Framework (`connectorFrameworkAPI`) — nothing to seed here.
 * Safe to call more than once — concurrent callers (e.g. React Strict
 * Mode's double effect invocation) all await the same in-flight promise
 * rather than racing a boolean guard. Client-callable (no server-only
 * dependency) — the nine default dashboard layout templates are seeded
 * separately, server-side, by `features/dashboard/layoutActions.ts` (see
 * note above on why the registry itself isn't re-exported from this
 * barrel).
 */
export function initializeDashboardFoundation(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      await initializeCommunicationPlatform();
      await initializeAccessControlFoundation();
      await seedDashboardNotifications();
      registerDashboardReports();
      registerDashboardSettings();
      registerDashboardUsageTypes();
    })();
  }
  return initPromise;
}
