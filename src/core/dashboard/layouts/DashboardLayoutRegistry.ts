import "server-only";

/**
 * Calixo Platform - Dashboard Layout Registry
 *
 * A thin, module-specific instantiation of the shared
 * `core/platform/dashboardBuilder` engine — Dashboard contributes its own
 * widget-key vocabulary and default widget set; the registry mechanics
 * (create/clone/rename/remove/favourite/default/reset-to-template,
 * disk persistence, tenant hierarchy) are the shared platform's, not
 * re-implemented here.
 *
 * `import "server-only"` (Round 23): this registry now owns real,
 * file-persisted, organization-scoped state — it must only ever be
 * touched from Server Actions (`features/dashboard/layoutActions.ts`),
 * never imported into a `"use client"` module directly.
 */

import { DashboardLayoutRegistry as GenericDashboardLayoutRegistry, packWidgets } from "@/core/platform/dashboardBuilder";
import { readLayoutsFromDisk, writeLayoutsToDisk } from "@/core/platform/dashboardBuilder/persistence";
import type { DashboardWidgetConfig } from "./types";
import { DASHBOARD_WIDGET_CATALOG } from "./types";

const PERSISTENCE_KEY = "dashboard_layouts";

const DEFAULT_ORDER: DashboardWidgetConfig["key"][] = [
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

function sizeFor(key: DashboardWidgetConfig["key"]) {
  return DASHBOARD_WIDGET_CATALOG.find(c => c.key === key)?.defaultSize ?? { w: 6, h: 6 };
}

export function defaultDashboardWidgetSet(keys: DashboardWidgetConfig["key"][] = DEFAULT_ORDER): DashboardWidgetConfig[] {
  const positions = packWidgets(keys.map(key => sizeFor(key)));
  return keys.map((key, index) => ({ key, instanceId: key, visible: true, pinned: false, collapsed: false, order: index, layout: positions[index] }));
}

export class DashboardLayoutRegistry extends GenericDashboardLayoutRegistry<DashboardWidgetConfig["key"]> {
  constructor() {
    super(() => defaultDashboardWidgetSet(), {
      load: () => readLayoutsFromDisk(PERSISTENCE_KEY),
      save: layouts => writeLayoutsToDisk(PERSISTENCE_KEY, layouts),
    });
  }
}

export const dashboardLayoutRegistry = new DashboardLayoutRegistry();
