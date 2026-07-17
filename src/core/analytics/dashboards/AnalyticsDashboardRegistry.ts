import "server-only";

/**
 * Calixo Platform - Analytics Dashboard Registry
 *
 * A thin, module-specific instantiation of the shared
 * `core/platform/dashboardBuilder` engine — mirrors Dashboard's own
 * `DashboardLayoutRegistry` wrapper exactly, proving the shared engine is
 * genuinely reusable rather than Dashboard-only. `import "server-only"`
 * (Round 23): this registry now owns real, file-persisted,
 * organization-scoped state — touch it only from Server Actions
 * (`features/analytics/layoutActions.ts`).
 */

import { DashboardLayoutRegistry as GenericDashboardLayoutRegistry, packWidgets } from "@/core/platform/dashboardBuilder";
import { readLayoutsFromDisk, writeLayoutsToDisk } from "@/core/platform/dashboardBuilder/persistence";
import type { AnalyticsWidgetConfig, AnalyticsWidgetKey } from "./types";
import { ANALYTICS_WIDGET_CATALOG } from "./types";

const PERSISTENCE_KEY = "analytics_layouts";

const DEFAULT_ORDER: AnalyticsWidgetKey[] = [
  "executive-summary",
  "goals-scorecard",
  "health-score",
  "revenue-chart",
  "traffic-analytics",
  "channel-performance",
  "campaign-performance",
  "conversion-funnel",
  "audience-insights",
  "geo-performance",
  "ai-insights",
  "insight-action-center",
  "reports-panel",
];

function sizeFor(key: AnalyticsWidgetKey) {
  return ANALYTICS_WIDGET_CATALOG.find(c => c.key === key)?.defaultSize ?? { w: 6, h: 6 };
}

export function defaultAnalyticsWidgetSet(keys: AnalyticsWidgetKey[] = DEFAULT_ORDER): AnalyticsWidgetConfig[] {
  const positions = packWidgets(keys.map(key => sizeFor(key)));
  return keys.map((key, index) => ({ key, instanceId: key, visible: true, pinned: false, collapsed: false, order: index, layout: positions[index] }));
}

export class AnalyticsDashboardRegistry extends GenericDashboardLayoutRegistry<AnalyticsWidgetKey> {
  constructor() {
    super(() => defaultAnalyticsWidgetSet(), {
      load: () => readLayoutsFromDisk(PERSISTENCE_KEY),
      save: layouts => writeLayoutsToDisk(PERSISTENCE_KEY, layouts),
    });
  }
}

export const analyticsDashboardRegistry = new AnalyticsDashboardRegistry();
