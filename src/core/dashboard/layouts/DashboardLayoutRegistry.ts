/**
 * Calixo Platform - Dashboard Layout Registry
 *
 * A thin, module-specific instantiation of the shared
 * `core/platform/dashboardBuilder` engine — Dashboard contributes its own
 * widget-key vocabulary and default widget set; the registry mechanics
 * (create/clone/rename/remove/favourite/default/reset-to-template) are
 * the shared platform's, not re-implemented here.
 */

import { DashboardLayoutRegistry as GenericDashboardLayoutRegistry } from "@/core/platform/dashboardBuilder";
import type { DashboardWidgetConfig } from "./types";

function DEFAULT_WIDGET_SET(): DashboardWidgetConfig[] {
  const keys: DashboardWidgetConfig["key"][] = [
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
  ];
  return keys.map((key, index) => ({ key, visible: true, pinned: false, order: index }));
}

export class DashboardLayoutRegistry extends GenericDashboardLayoutRegistry<DashboardWidgetConfig["key"]> {
  constructor() {
    super(DEFAULT_WIDGET_SET);
  }
}

export const dashboardLayoutRegistry = new DashboardLayoutRegistry();
