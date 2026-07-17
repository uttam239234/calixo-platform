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
export type { DashboardLayoutPersistenceAdapter } from "./DashboardLayoutRegistry";
export type {
  DashboardLayout,
  DashboardWidgetConfig,
  DashboardWidgetCatalogEntry,
  DashboardLayoutActor,
  DashboardLayoutScope,
  DashboardLayoutTemplateVisibility,
  WidgetGridPosition,
} from "./types";
export { packWidgets, GRID_COLUMNS } from "./packLayout";
// `createLayoutController` (serverActions.ts) is deliberately NOT re-exported
// from this barrel — it's `import "server-only"`-tagged, and a barrel
// re-export risks a bundler pulling the whole file into a client graph even
// when unused. Server Action files import it directly from
// "@/core/platform/dashboardBuilder/serverActions" instead.
export type { LayoutController, LayoutState } from "./serverActions";
