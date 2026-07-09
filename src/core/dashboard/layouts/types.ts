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
import { permissionName } from "@/core/platform/access";

export type DashboardWidgetKey =
  | "kpi-grid"
  | "goals-scorecard"
  | "health-score"
  | "marketing-performance"
  | "channel-overview"
  | "quick-actions"
  | "pending-approvals"
  | "action-center"
  | "recent-activity"
  | "upcoming-tasks"
  | "ai-recommendations"
  | "connected-platforms"
  | "subscription-summary"
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

/**
 * Widgets tied to a specific resource domain require that resource's
 * `read` permission (via the canonical `permissionName()` matrix) to be
 * visible — widgets with no clear single-resource mapping (KPI grid,
 * goals, quick actions, activity feed, AI recommendations) stay ungated.
 * Checked in `DashboardShell.isVisible()` alongside layout visibility.
 */
export const DASHBOARD_WIDGET_PERMISSIONS: Partial<Record<DashboardWidgetKey, string>> = {
  "marketing-performance": permissionName("analytics", "read"),
  "channel-overview": permissionName("analytics", "read"),
  "pending-approvals": permissionName("workflow", "read"),
  "upcoming-tasks": permissionName("workflow", "read"),
  "reports-panel": permissionName("report", "read"),
  "connected-platforms": permissionName("connector", "read"),
  "subscription-summary": permissionName("billing", "read"),
};

/** The 9 system layout templates carry a real `persona`; this maps a free-form `AuthenticatedUser.role` string to the closest one, for auto-selecting a sensible default layout on a user's first visit (before they've picked one themselves). */
const ROLE_PERSONA_HINTS: [RegExp, DashboardLayoutPersona][] = [
  [/exec|ceo|cmo|cfo|coo|founder/i, "executive"],
  [/admin|owner|workspace/i, "workspace"],
  [/market/i, "marketing"],
  [/sales|growth|performance/i, "performance"],
  [/social/i, "social"],
  [/content|editor|writer|copy/i, "content"],
  [/brand/i, "brand"],
  [/team|manager|lead/i, "team"],
];

export function personaForRole(role: string | undefined | null): DashboardLayoutPersona | null {
  if (!role) return null;
  for (const [pattern, persona] of ROLE_PERSONA_HINTS) {
    if (pattern.test(role)) return persona;
  }
  return null;
}

export const DASHBOARD_WIDGET_CATALOG: DashboardWidgetCatalogEntry[] = [
  { key: "kpi-grid", label: "KPI Grid", description: "Core marketing KPIs with trend sparklines", group: "Overview" },
  { key: "goals-scorecard", label: "Goals & Scorecard", description: "Targets, progress, and benchmark comparison", group: "Overview" },
  { key: "health-score", label: "Health Score", description: "Weighted organization health across revenue, connectors, goals, and workflow", group: "Overview" },
  { key: "marketing-performance", label: "Marketing Performance", description: "Revenue and spend trend chart", group: "Performance" },
  { key: "channel-overview", label: "Channel Overview", description: "Per-channel spend, ROAS, and CPA", group: "Performance" },
  { key: "quick-actions", label: "Quick Actions", description: "Shortcuts to common tasks", group: "Operations" },
  { key: "pending-approvals", label: "Pending Approvals", description: "Workflow items awaiting review", group: "Operations" },
  { key: "action-center", label: "Action Center", description: "Approvals, connector issues, and alerts that need a decision", group: "Operations" },
  { key: "recent-activity", label: "Recent Activity", description: "Live feed across workflow, assets, and layout changes", group: "Operations" },
  { key: "upcoming-tasks", label: "Upcoming Tasks", description: "Workflow items with due dates", group: "Operations" },
  { key: "ai-recommendations", label: "AI Recommendations", description: "Prioritized, actionable insights", group: "AI" },
  { key: "connected-platforms", label: "Connected Platforms", description: "Integration connection status", group: "Integrations" },
  { key: "subscription-summary", label: "Subscription", description: "Plan, seats, AI credits, storage, and connector usage", group: "Integrations" },
  { key: "reports-panel", label: "Reports & Exports", description: "Saved reports, schedules, and recent exports", group: "Integrations" },
];
