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
  | "revenue-chart"
  | "traffic-analytics"
  | "channel-performance"
  | "campaign-performance"
  | "conversion-funnel"
  | "audience-insights"
  | "geo-performance"
  | "ai-insights"
  | "reports-panel";

export type AnalyticsWidgetConfig = GenericWidgetConfig<AnalyticsWidgetKey>;

export type AnalyticsDashboardLayout = GenericDashboardLayout<AnalyticsWidgetKey>;

export interface AnalyticsWidgetCatalogEntry extends GenericWidgetCatalogEntry<AnalyticsWidgetKey> {
  group: "Summary" | "Performance" | "Conversion" | "Audience" | "AI";
}

export const ANALYTICS_WIDGET_GROUPS = ["Summary", "Performance", "Conversion", "Audience", "AI"] as const;

export const ANALYTICS_WIDGET_CATALOG: AnalyticsWidgetCatalogEntry[] = [
  { key: "executive-summary", label: "Executive Summary", description: "Top-line KPI cards with period-over-period comparison", group: "Summary" },
  { key: "goals-scorecard", label: "Goals & Scorecard", description: "Targets, progress, and benchmark comparison", group: "Summary" },
  { key: "revenue-chart", label: "Revenue Chart", description: "Revenue and spend trend over time", group: "Performance" },
  { key: "traffic-analytics", label: "Traffic Analytics", description: "Sessions, users, bounce rate, and engagement", group: "Performance" },
  { key: "channel-performance", label: "Channel Performance", description: "Per-channel spend, ROAS, and CPA", group: "Performance" },
  { key: "campaign-performance", label: "Campaign Performance", description: "Per-campaign clicks, spend, and ROI", group: "Performance" },
  { key: "conversion-funnel", label: "Conversion Funnel", description: "Stage-by-stage conversion drop-off", group: "Conversion" },
  { key: "audience-insights", label: "Audience Insights", description: "Segment composition and behavior", group: "Audience" },
  { key: "geo-performance", label: "Geo Performance", description: "Revenue and conversions by region", group: "Audience" },
  { key: "ai-insights", label: "AI Insights", description: "Prioritized recommendations", group: "AI" },
  { key: "reports-panel", label: "Reports & Exports", description: "Saved reports, schedules, and recent exports", group: "AI" },
];
