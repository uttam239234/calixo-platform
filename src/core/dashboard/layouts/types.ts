/**
 * Calixo Platform - Dashboard Layout Types
 *
 * A "layout" is a named, persona-oriented arrangement of the landing
 * page's own widgets (which sections show, in what order, hidden/pinned,
 * and — Round 23 — at what grid position/size). This is a distinct concept
 * from Reports' `ReportDashboard` (a named collection of full BI reports)
 * — that registry's own docs say as much ("Dashboards are named
 * arrangements of existing reports"). Nothing here duplicates that
 * registry; it models a different domain object.
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
  | "reports-panel"
  | "ai-credits"
  | "brand-sentiment";

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
 * Carried onto each catalog entry's `requiresPermission` and enforced
 * server-side by the layout controller's `filterWidget` hook (Round 23) —
 * previously only checked client-side in `DashboardShell.isVisible()`.
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
  { key: "kpi-grid", label: "KPI Grid", description: "Core marketing KPIs with trend sparklines", group: "Overview", defaultSize: { w: 12, h: 4 }, minSize: { w: 4, h: 3 } },
  { key: "goals-scorecard", label: "Goals & Scorecard", description: "Targets, progress, and benchmark comparison", group: "Overview", defaultSize: { w: 6, h: 6 }, minSize: { w: 3, h: 4 } },
  { key: "health-score", label: "Health Score", description: "Weighted organization health across revenue, connectors, goals, and workflow", group: "Overview", defaultSize: { w: 6, h: 6 }, minSize: { w: 3, h: 4 } },
  { key: "marketing-performance", label: "Marketing Performance", description: "Revenue and spend trend chart", group: "Performance", defaultSize: { w: 6, h: 7 }, minSize: { w: 4, h: 5 }, requiresPermission: DASHBOARD_WIDGET_PERMISSIONS["marketing-performance"] },
  { key: "channel-overview", label: "Channel Overview", description: "Per-channel spend, ROAS, and CPA", group: "Performance", defaultSize: { w: 6, h: 7 }, minSize: { w: 4, h: 5 }, requiresPermission: DASHBOARD_WIDGET_PERMISSIONS["channel-overview"] },
  { key: "quick-actions", label: "Quick Actions", description: "Shortcuts to common tasks", group: "Operations", defaultSize: { w: 4, h: 4 }, minSize: { w: 3, h: 3 } },
  { key: "pending-approvals", label: "Pending Approvals", description: "Workflow items awaiting review", group: "Operations", defaultSize: { w: 6, h: 6 }, minSize: { w: 3, h: 4 }, requiresPermission: DASHBOARD_WIDGET_PERMISSIONS["pending-approvals"] },
  { key: "action-center", label: "Action Center", description: "Approvals, connector issues, and alerts that need a decision", group: "Operations", defaultSize: { w: 6, h: 6 }, minSize: { w: 3, h: 4 } },
  { key: "recent-activity", label: "Recent Activity", description: "Live feed across workflow, assets, and layout changes", group: "Operations", defaultSize: { w: 6, h: 6 }, minSize: { w: 3, h: 4 } },
  { key: "upcoming-tasks", label: "Upcoming Tasks", description: "Workflow items with due dates", group: "Operations", defaultSize: { w: 6, h: 6 }, minSize: { w: 3, h: 4 }, requiresPermission: DASHBOARD_WIDGET_PERMISSIONS["upcoming-tasks"] },
  { key: "ai-recommendations", label: "AI Recommendations", description: "Prioritized, actionable insights", group: "AI", defaultSize: { w: 6, h: 6 }, minSize: { w: 3, h: 4 } },
  { key: "connected-platforms", label: "Connected Platforms", description: "Integration connection status", group: "Integrations", defaultSize: { w: 6, h: 5 }, minSize: { w: 3, h: 3 }, requiresPermission: DASHBOARD_WIDGET_PERMISSIONS["connected-platforms"] },
  { key: "subscription-summary", label: "Subscription", description: "Plan, seats, AI credits, storage, and connector usage", group: "Integrations", defaultSize: { w: 6, h: 5 }, minSize: { w: 3, h: 3 }, requiresPermission: DASHBOARD_WIDGET_PERMISSIONS["subscription-summary"] },
  { key: "reports-panel", label: "Reports & Exports", description: "Saved reports, schedules, and recent exports", group: "Integrations", defaultSize: { w: 6, h: 6 }, minSize: { w: 3, h: 4 }, requiresPermission: DASHBOARD_WIDGET_PERMISSIONS["reports-panel"] },
  { key: "ai-credits", label: "AI Credits", description: "Included vs. purchased AI credit balance and monthly reset", group: "AI", defaultSize: { w: 4, h: 4 }, minSize: { w: 3, h: 3 }, alwaysAvailable: true },
  { key: "brand-sentiment", label: "Brand Sentiment", description: "Live mention sentiment split from Brand Monitoring", group: "AI", defaultSize: { w: 4, h: 4 }, minSize: { w: 3, h: 3 }, requiresModule: "brand" },
];

export const DASHBOARD_WIDGET_GROUPS = ["Overview", "Performance", "Operations", "AI", "Integrations"] as const;
