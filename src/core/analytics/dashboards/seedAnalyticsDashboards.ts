/**
 * Calixo Platform - Default Analytics Dashboard Templates
 *
 * Seven persona/vertical-oriented starting points covering the "Enterprise
 * Analytics" breadth that's genuinely backed by real computed data today
 * (Executive, Marketing, Campaign, Traffic, Revenue, Conversion, Audience).
 * SEO/Social/Brand/Lead/Sales/Customer analytics are NOT included here —
 * no real fact-table dimension backs them yet (see completion report).
 */

import type { AnalyticsDashboardLayout, AnalyticsWidgetConfig, AnalyticsWidgetKey } from "./types";
import { analyticsDashboardRegistry, AnalyticsDashboardRegistry } from "./AnalyticsDashboardRegistry";

const TEMPLATE_OWNER = "system";

function widgets(order: AnalyticsWidgetKey[], hidden: AnalyticsWidgetKey[] = [], pinned: AnalyticsWidgetKey[] = []): AnalyticsWidgetConfig[] {
  return order.map((key, index) => ({ key, visible: !hidden.includes(key), pinned: pinned.includes(key), order: index }));
}

const ALL_KEYS: AnalyticsWidgetKey[] = [
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

const TEMPLATES: Omit<AnalyticsDashboardLayout, "createdAt" | "updatedAt">[] = [
  {
    id: "analytics-layout-executive",
    name: "Executive Analytics",
    description: "Top-line KPIs, goal progress, and AI insights for leadership",
    persona: "executive",
    owner: TEMPLATE_OWNER,
    isDefault: true,
    isFavorite: true,
    isTemplate: true,
    sharedWith: [],
    widgets: widgets(["executive-summary", "goals-scorecard", "revenue-chart", "ai-insights", "reports-panel", "traffic-analytics", "channel-performance", "campaign-performance", "conversion-funnel", "audience-insights", "geo-performance"], ["traffic-analytics", "channel-performance", "campaign-performance", "conversion-funnel", "audience-insights", "geo-performance"], ["executive-summary", "goals-scorecard"]),
  },
  {
    id: "analytics-layout-marketing",
    name: "Marketing Analytics",
    description: "Revenue, channel mix, and campaign performance for marketing teams",
    persona: "marketing",
    owner: TEMPLATE_OWNER,
    isDefault: false,
    isFavorite: false,
    isTemplate: true,
    sharedWith: [],
    widgets: widgets(["executive-summary", "revenue-chart", "channel-performance", "campaign-performance", "ai-insights", "goals-scorecard", "traffic-analytics", "conversion-funnel", "audience-insights", "geo-performance", "reports-panel"], ["goals-scorecard", "traffic-analytics", "conversion-funnel", "audience-insights", "geo-performance"], ["revenue-chart"]),
  },
  {
    id: "analytics-layout-campaign",
    name: "Campaign Analytics",
    description: "Per-campaign performance, ROI, and conversion drop-off",
    persona: "campaign",
    owner: TEMPLATE_OWNER,
    isDefault: false,
    isFavorite: false,
    isTemplate: true,
    sharedWith: [],
    widgets: widgets(["campaign-performance", "channel-performance", "conversion-funnel", "ai-insights", "executive-summary", "goals-scorecard", "revenue-chart", "traffic-analytics", "audience-insights", "geo-performance", "reports-panel"], ["goals-scorecard", "revenue-chart", "traffic-analytics", "audience-insights", "geo-performance", "reports-panel"], ["campaign-performance"]),
  },
  {
    id: "analytics-layout-traffic",
    name: "Traffic Analytics",
    description: "Sessions, engagement, and geo distribution",
    persona: "traffic",
    owner: TEMPLATE_OWNER,
    isDefault: false,
    isFavorite: false,
    isTemplate: true,
    sharedWith: [],
    widgets: widgets(["traffic-analytics", "geo-performance", "audience-insights", "revenue-chart", "ai-insights", "executive-summary", "goals-scorecard", "channel-performance", "campaign-performance", "conversion-funnel", "reports-panel"], ["executive-summary", "goals-scorecard", "channel-performance", "campaign-performance", "conversion-funnel", "reports-panel"], ["traffic-analytics"]),
  },
  {
    id: "analytics-layout-revenue",
    name: "Revenue Analytics",
    description: "Revenue trend, channel ROAS, and goal tracking",
    persona: "revenue",
    owner: TEMPLATE_OWNER,
    isDefault: false,
    isFavorite: false,
    isTemplate: true,
    sharedWith: [],
    widgets: widgets(["revenue-chart", "executive-summary", "channel-performance", "goals-scorecard", "ai-insights", "traffic-analytics", "campaign-performance", "conversion-funnel", "audience-insights", "geo-performance", "reports-panel"], ["traffic-analytics", "campaign-performance", "conversion-funnel", "audience-insights", "geo-performance", "reports-panel"], ["revenue-chart"]),
  },
  {
    id: "analytics-layout-conversion",
    name: "Conversion Analytics",
    description: "Funnel drop-off and campaign conversion efficiency",
    persona: "conversion",
    owner: TEMPLATE_OWNER,
    isDefault: false,
    isFavorite: false,
    isTemplate: true,
    sharedWith: [],
    widgets: widgets(["conversion-funnel", "campaign-performance", "traffic-analytics", "ai-insights", "executive-summary", "goals-scorecard", "revenue-chart", "channel-performance", "audience-insights", "geo-performance", "reports-panel"], ["executive-summary", "goals-scorecard", "revenue-chart", "channel-performance", "audience-insights", "geo-performance", "reports-panel"], ["conversion-funnel"]),
  },
  {
    id: "analytics-layout-audience",
    name: "Audience Analytics",
    description: "Segment composition, behavior, and geographic distribution",
    persona: "audience",
    owner: TEMPLATE_OWNER,
    isDefault: false,
    isFavorite: false,
    isTemplate: true,
    sharedWith: [],
    widgets: widgets(["audience-insights", "geo-performance", "traffic-analytics", "ai-insights", "executive-summary", "goals-scorecard", "revenue-chart", "channel-performance", "campaign-performance", "conversion-funnel", "reports-panel"], ["executive-summary", "goals-scorecard", "revenue-chart", "channel-performance", "campaign-performance", "conversion-funnel", "reports-panel"], ["audience-insights"]),
  },
];

let seeded = false;

/** Safe to call more than once — registers the 7 default templates exactly once. */
export function seedAnalyticsDashboards(registry: AnalyticsDashboardRegistry = analyticsDashboardRegistry): void {
  if (seeded) return;
  const now = new Date().toISOString();
  registry.registerMany(TEMPLATES.map(t => ({ ...t, createdAt: now, updatedAt: now })));
  seeded = true;
}

export { ALL_KEYS as ANALYTICS_ALL_WIDGET_KEYS };
