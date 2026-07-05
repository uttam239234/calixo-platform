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
import { seedDashboardNotifications } from "./mock/seedDashboardNotifications";

export * from "./types";

export { DashboardEngine, dashboardEngine } from "./engine/DashboardEngine";

export { registerDashboardSkills } from "./skills/registerDashboardSkills";

export { seedDashboardNotifications, DASHBOARD_CURRENT_USER_ID } from "./mock/seedDashboardNotifications";

let initialized = false;

/**
 * Boots the Communication Platform (previously built but never invoked
 * anywhere in the app) and seeds a small, realistic set of demo
 * notifications for the current session user via the real
 * `notificationService`. Safe to call more than once.
 */
export async function initializeDashboardFoundation(): Promise<void> {
  if (initialized) return;
  initialized = true;
  await initializeCommunicationPlatform();
  await seedDashboardNotifications();
}
