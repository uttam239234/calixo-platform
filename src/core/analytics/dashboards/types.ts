/**
 * Calixo Platform - Analytics Dashboard Layout Types
 *
 * Analytics' own instantiation of the shared `core/platform/dashboardBuilder`
 * SDK — same registry mechanics Dashboard uses, own widget vocabulary.
 */

import type { DashboardLayout as GenericDashboardLayout, DashboardWidgetCatalogEntry as GenericWidgetCatalogEntry, DashboardWidgetConfig as GenericWidgetConfig } from "@/core/platform/dashboardBuilder";

export type AnalyticsWidgetKey =
  | "executive-summary"
  | "goals-scorecard"
  | "health-score"
  | "revenue-chart"
  | "traffic-analytics"
  | "channel-performance"
  | "campaign-performance"
  | "conversion-funnel"
  | "audience-insights"
  | "geo-performance"
  | "ai-insights"
  | "insight-action-center"
  | "reports-panel";

export type AnalyticsWidgetConfig = GenericWidgetConfig<AnalyticsWidgetKey>;

export type AnalyticsDashboardLayout = GenericDashboardLayout<AnalyticsWidgetKey>;

export interface AnalyticsWidgetCatalogEntry extends GenericWidgetCatalogEntry<AnalyticsWidgetKey> {
  group: "Summary" | "Performance" | "Conversion" | "Audience" | "AI";
}

export const ANALYTICS_WIDGET_GROUPS = ["Summary", "Performance", "Conversion", "Audience", "AI"] as const;

export const ANALYTICS_WIDGET_CATALOG: AnalyticsWidgetCatalogEntry[] = [
  { key: "executive-summary", label: "Executive Summary", description: "Top-line KPI cards with period-over-period comparison", group: "Summary", defaultSize: { w: 12, h: 4 }, minSize: { w: 4, h: 3 } },
  { key: "goals-scorecard", label: "Goals & Scorecard", description: "Targets, progress, and benchmark comparison", group: "Summary", defaultSize: { w: 6, h: 6 }, minSize: { w: 3, h: 4 } },
  { key: "health-score", label: "Health Score", description: "Weighted analytics health across revenue, channels, funnel, forecast, and connectors", group: "Summary", defaultSize: { w: 6, h: 6 }, minSize: { w: 3, h: 4 } },
  { key: "revenue-chart", label: "Revenue Chart", description: "Revenue and spend trend over time", group: "Performance", defaultSize: { w: 6, h: 7 }, minSize: { w: 4, h: 5 } },
  { key: "traffic-analytics", label: "Traffic Analytics", description: "Sessions, users, bounce rate, and engagement", group: "Performance", defaultSize: { w: 6, h: 7 }, minSize: { w: 4, h: 5 } },
  { key: "channel-performance", label: "Channel Performance", description: "Per-channel spend, ROAS, and CPA", group: "Performance", defaultSize: { w: 6, h: 6 }, minSize: { w: 4, h: 4 } },
  { key: "campaign-performance", label: "Campaign Performance", description: "Per-campaign clicks, spend, and ROI", group: "Performance", defaultSize: { w: 6, h: 6 }, minSize: { w: 4, h: 4 } },
  { key: "conversion-funnel", label: "Conversion Funnel", description: "Stage-by-stage conversion drop-off", group: "Conversion", defaultSize: { w: 6, h: 6 }, minSize: { w: 4, h: 4 } },
  { key: "audience-insights", label: "Audience Insights", description: "Segment composition and behavior", group: "Audience", defaultSize: { w: 6, h: 6 }, minSize: { w: 4, h: 4 } },
  { key: "geo-performance", label: "Geo Performance", description: "Revenue and conversions by region", group: "Audience", defaultSize: { w: 6, h: 6 }, minSize: { w: 4, h: 4 } },
  { key: "ai-insights", label: "AI Insights", description: "Prioritized recommendations", group: "AI", defaultSize: { w: 6, h: 6 }, minSize: { w: 3, h: 4 } },
  { key: "insight-action-center", label: "Insight & Action Center", description: "Risks, anomalies, opportunities, data quality, and attribution in one place", group: "AI", defaultSize: { w: 6, h: 6 }, minSize: { w: 3, h: 4 } },
  { key: "reports-panel", label: "Reports & Exports", description: "Saved reports, schedules, and recent exports", group: "AI", defaultSize: { w: 6, h: 6 }, minSize: { w: 3, h: 4 }, requiresModule: "reports" },
];
