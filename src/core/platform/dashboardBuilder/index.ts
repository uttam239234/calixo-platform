/**
 * Calixo Platform - Dashboard-Builder Platform (shared SDK)
 *
 * Any module that needs named, switchable, personalizable dashboard
 * layouts (Create/Clone/Rename/Delete/Favourite/Default/Reset-to-Template)
 * should instantiate `new DashboardLayoutRegistry(defaultWidgetSetFn)`
 * rather than building its own registry. Dashboard and Analytics both
 * consume this; no module owns it exclusively.
 */

export { DashboardLayoutRegistry } from "./DashboardLayoutRegistry";
export type { DashboardLayout, DashboardWidgetConfig, DashboardWidgetCatalogEntry } from "./types";
