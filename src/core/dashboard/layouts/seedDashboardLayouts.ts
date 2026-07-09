/**
 * Calixo Platform - Default Dashboard Layout Templates
 *
 * Nine persona-oriented starting points, each a real, distinct widget
 * arrangement (not just a renamed copy of the others). All are
 * `isTemplate: true` so users can clone them into their own Custom
 * dashboards via `dashboardLayoutRegistry.clone()`.
 */

import type { DashboardLayout, DashboardWidgetConfig, DashboardWidgetKey } from "./types";
import { dashboardLayoutRegistry, DashboardLayoutRegistry } from "./DashboardLayoutRegistry";

const TEMPLATE_OWNER = "system";

function widgets(order: DashboardWidgetKey[], hidden: DashboardWidgetKey[] = [], pinned: DashboardWidgetKey[] = []): DashboardWidgetConfig[] {
  return order.map((key, index) => ({ key, visible: !hidden.includes(key), pinned: pinned.includes(key), order: index }));
}

const TEMPLATES: Omit<DashboardLayout, "createdAt" | "updatedAt">[] = [
  {
    id: "layout-personal",
    name: "Personal",
    description: "Your own KPIs, tasks, and AI recommendations",
    persona: "personal",
    owner: TEMPLATE_OWNER,
    isDefault: true,
    isFavorite: true,
    isTemplate: true,
    sharedWith: [],
    widgets: widgets(
      ["kpi-grid", "upcoming-tasks", "ai-recommendations", "recent-activity", "quick-actions", "pending-approvals", "action-center", "goals-scorecard", "health-score", "marketing-performance", "channel-overview", "connected-platforms", "subscription-summary", "reports-panel"],
      ["marketing-performance", "channel-overview", "connected-platforms", "subscription-summary"]
    ),
  },
  {
    id: "layout-executive",
    name: "Executive",
    description: "Health score, goals, approvals, and top-line KPIs for leadership",
    persona: "executive",
    owner: TEMPLATE_OWNER,
    isDefault: false,
    isFavorite: false,
    isTemplate: true,
    sharedWith: [],
    widgets: widgets(
      ["goals-scorecard", "health-score", "kpi-grid", "pending-approvals", "action-center", "ai-recommendations", "recent-activity", "marketing-performance", "channel-overview", "upcoming-tasks", "quick-actions", "connected-platforms", "subscription-summary", "reports-panel"],
      ["quick-actions", "connected-platforms"],
      ["goals-scorecard", "kpi-grid", "health-score"]
    ),
  },
  {
    id: "layout-marketing",
    name: "Marketing",
    description: "Revenue trend, channel mix, and campaign KPIs",
    persona: "marketing",
    owner: TEMPLATE_OWNER,
    isDefault: false,
    isFavorite: false,
    isTemplate: true,
    sharedWith: [],
    widgets: widgets(
      ["kpi-grid", "marketing-performance", "channel-overview", "ai-recommendations", "goals-scorecard", "health-score", "pending-approvals", "action-center", "recent-activity", "upcoming-tasks", "quick-actions", "connected-platforms", "subscription-summary", "reports-panel"],
      ["connected-platforms", "subscription-summary"],
      ["marketing-performance"]
    ),
  },
  {
    id: "layout-performance",
    name: "Performance",
    description: "Channel ROAS/CPA and marketing trend, no operational noise",
    persona: "performance",
    owner: TEMPLATE_OWNER,
    isDefault: false,
    isFavorite: false,
    isTemplate: true,
    sharedWith: [],
    widgets: widgets(
      ["channel-overview", "marketing-performance", "kpi-grid", "goals-scorecard", "health-score", "ai-recommendations", "pending-approvals", "action-center", "recent-activity", "upcoming-tasks", "quick-actions", "connected-platforms", "subscription-summary", "reports-panel"],
      ["pending-approvals", "upcoming-tasks", "quick-actions", "action-center", "subscription-summary"],
      ["channel-overview"]
    ),
  },
  {
    id: "layout-social",
    name: "Social",
    description: "Channel mix and AI recommendations for social-first teams",
    persona: "social",
    owner: TEMPLATE_OWNER,
    isDefault: false,
    isFavorite: false,
    isTemplate: true,
    sharedWith: [],
    widgets: widgets(
      ["channel-overview", "ai-recommendations", "kpi-grid", "recent-activity", "upcoming-tasks", "quick-actions", "goals-scorecard", "health-score", "marketing-performance", "pending-approvals", "action-center", "connected-platforms", "subscription-summary", "reports-panel"],
      ["goals-scorecard", "marketing-performance", "connected-platforms", "health-score", "subscription-summary"]
    ),
  },
  {
    id: "layout-content",
    name: "Content",
    description: "Approvals, upcoming tasks, and recent activity for content teams",
    persona: "content",
    owner: TEMPLATE_OWNER,
    isDefault: false,
    isFavorite: false,
    isTemplate: true,
    sharedWith: [],
    widgets: widgets(
      ["pending-approvals", "action-center", "upcoming-tasks", "recent-activity", "quick-actions", "ai-recommendations", "kpi-grid", "goals-scorecard", "health-score", "marketing-performance", "channel-overview", "connected-platforms", "subscription-summary", "reports-panel"],
      ["goals-scorecard", "marketing-performance", "channel-overview", "connected-platforms", "health-score", "subscription-summary"],
      ["pending-approvals"]
    ),
  },
  {
    id: "layout-brand",
    name: "Brand",
    description: "Approvals and activity for brand governance",
    persona: "brand",
    owner: TEMPLATE_OWNER,
    isDefault: false,
    isFavorite: false,
    isTemplate: true,
    sharedWith: [],
    widgets: widgets(
      ["pending-approvals", "action-center", "recent-activity", "ai-recommendations", "kpi-grid", "quick-actions", "goals-scorecard", "health-score", "marketing-performance", "channel-overview", "upcoming-tasks", "connected-platforms", "subscription-summary", "reports-panel"],
      ["goals-scorecard", "marketing-performance", "channel-overview", "connected-platforms", "health-score", "subscription-summary"]
    ),
  },
  {
    id: "layout-team",
    name: "Team",
    description: "Shared operational view: approvals, tasks, and activity",
    persona: "team",
    owner: TEMPLATE_OWNER,
    isDefault: false,
    isFavorite: false,
    isTemplate: true,
    sharedWith: [],
    widgets: widgets(
      ["pending-approvals", "action-center", "upcoming-tasks", "recent-activity", "quick-actions", "kpi-grid", "ai-recommendations", "goals-scorecard", "health-score", "marketing-performance", "channel-overview", "connected-platforms", "subscription-summary", "reports-panel"],
      ["goals-scorecard", "marketing-performance", "channel-overview", "health-score", "subscription-summary"]
    ),
  },
  {
    id: "layout-workspace",
    name: "Workspace",
    description: "Everything — the full widget set for workspace admins",
    persona: "workspace",
    owner: TEMPLATE_OWNER,
    isDefault: false,
    isFavorite: false,
    isTemplate: true,
    sharedWith: [],
    widgets: widgets([
      "kpi-grid",
      "goals-scorecard",
      "health-score",
      "marketing-performance",
      "channel-overview",
      "quick-actions",
      "pending-approvals",
      "action-center",
      "recent-activity",
      "upcoming-tasks",
      "ai-recommendations",
      "connected-platforms",
      "subscription-summary",
      "reports-panel",
    ]),
  },
];

let seeded = false;

/** Safe to call more than once — registers the 9 default templates exactly once. */
export function seedDashboardLayouts(registry: DashboardLayoutRegistry = dashboardLayoutRegistry): void {
  if (seeded) return;
  const now = new Date().toISOString();
  registry.registerMany(TEMPLATES.map(t => ({ ...t, createdAt: now, updatedAt: now })));
  seeded = true;
}
