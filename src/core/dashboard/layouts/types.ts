/**
 * Calixo Platform - Dashboard Layout Types
 *
 * A "layout" is a named, persona-oriented arrangement of the landing
 * page's own widgets (which sections show, in what order, hidden/pinned).
 * This is a distinct concept from Reports' `ReportDashboard` (a named
 * collection of full BI reports) — that registry's own docs say as much
 * ("Dashboards are named arrangements of existing reports"). Nothing here
 * duplicates that registry; it models a different domain object.
 *
 * The registry/widget-config/layout shapes themselves come from the
 * shared `core/platform/dashboardBuilder` SDK — this file only declares
 * Dashboard's own widget-key vocabulary and catalog, parameterizing that
 * shared engine rather than re-implementing it.
 */

import type { DashboardLayout as GenericDashboardLayout, DashboardWidgetCatalogEntry as GenericWidgetCatalogEntry, DashboardWidgetConfig as GenericWidgetConfig } from "@/core/platform/dashboardBuilder";

export type DashboardWidgetKey =
  | "kpi-grid"
  | "goals-scorecard"
  | "marketing-performance"
  | "channel-overview"
  | "quick-actions"
  | "pending-approvals"
  | "recent-activity"
  | "upcoming-tasks"
  | "ai-recommendations"
  | "connected-platforms"
  | "reports-panel";

export type DashboardWidgetConfig = GenericWidgetConfig<DashboardWidgetKey>;

export type DashboardLayoutPersona =
  | "personal"
  | "executive"
  | "marketing"
  | "performance"
  | "social"
  | "content"
  | "brand"
  | "team"
  | "workspace"
  | "custom";

export type DashboardLayout = GenericDashboardLayout<DashboardWidgetKey>;

export interface DashboardWidgetCatalogEntry extends GenericWidgetCatalogEntry<DashboardWidgetKey> {
  group: "Overview" | "Performance" | "Operations" | "AI" | "Integrations";
}

export const DASHBOARD_WIDGET_CATALOG: DashboardWidgetCatalogEntry[] = [
  { key: "kpi-grid", label: "KPI Grid", description: "Core marketing KPIs with trend sparklines", group: "Overview" },
  { key: "goals-scorecard", label: "Goals & Scorecard", description: "Targets, progress, and benchmark comparison", group: "Overview" },
  { key: "marketing-performance", label: "Marketing Performance", description: "Revenue and spend trend chart", group: "Performance" },
  { key: "channel-overview", label: "Channel Overview", description: "Per-channel spend, ROAS, and CPA", group: "Performance" },
  { key: "quick-actions", label: "Quick Actions", description: "Shortcuts to common tasks", group: "Operations" },
  { key: "pending-approvals", label: "Pending Approvals", description: "Workflow items awaiting review", group: "Operations" },
  { key: "recent-activity", label: "Recent Activity", description: "Live feed across workflow, assets, and layout changes", group: "Operations" },
  { key: "upcoming-tasks", label: "Upcoming Tasks", description: "Workflow items with due dates", group: "Operations" },
  { key: "ai-recommendations", label: "AI Recommendations", description: "Prioritized, actionable insights", group: "AI" },
  { key: "connected-platforms", label: "Connected Platforms", description: "Integration connection status", group: "Integrations" },
  { key: "reports-panel", label: "Reports & Exports", description: "Saved reports, schedules, and recent exports", group: "Integrations" },
];
