/**
 * Calixo Platform - Analytics Dashboard Registry
 *
 * A thin, module-specific instantiation of the shared
 * `core/platform/dashboardBuilder` engine — mirrors Dashboard's own
 * `DashboardLayoutRegistry` wrapper exactly, proving the shared engine is
 * genuinely reusable rather than Dashboard-only.
 */

import { DashboardLayoutRegistry as GenericDashboardLayoutRegistry } from "@/core/platform/dashboardBuilder";
import type { AnalyticsWidgetConfig, AnalyticsWidgetKey } from "./types";

function DEFAULT_WIDGET_SET(): AnalyticsWidgetConfig[] {
  const keys: AnalyticsWidgetKey[] = [
    "executive-summary",
    "goals-scorecard",
    "revenue-chart",
    "traffic-analytics",
    "channel-performance",
    "campaign-performance",
    "conversion-funnel",
    "audience-insights",
    "geo-performance",
    "ai-insights",
    "reports-panel",
  ];
  return keys.map((key, index) => ({ key, visible: true, pinned: false, order: index }));
}

export class AnalyticsDashboardRegistry extends GenericDashboardLayoutRegistry<AnalyticsWidgetKey> {
  constructor() {
    super(DEFAULT_WIDGET_SET);
  }
}

export const analyticsDashboardRegistry = new AnalyticsDashboardRegistry();
