/**
 * Calixo Platform - Analytics Core Types
 *
 * `AnalyticsFact` is the single raw fact-table row shape the engine
 * aggregates over. Every other type here is a COMPUTED view model —
 * nothing is hand-authored output; it's all derived from facts at query
 * time by the engine.
 */

export type AnalyticsRange = "7d" | "30d" | "90d" | "custom";

export type AnalyticsChannel = "Google Ads" | "Meta" | "LinkedIn" | "Organic" | "Referral" | "Email" | "Display";
export type AnalyticsDevice = "Desktop" | "Mobile" | "Tablet";
export type AnalyticsRegion = "United States" | "United Kingdom" | "Canada" | "Germany";
export type AnalyticsAudience = "New Visitors" | "Returning Visitors" | "High Intent" | "Enterprise";

/** One raw daily fact row — the fact table every computed view derives from. */
export interface AnalyticsFact {
  date: string;
  channel: AnalyticsChannel;
  campaign: string;
  region: AnalyticsRegion;
  city: string;
  device: AnalyticsDevice;
  audience: AnalyticsAudience;
  sessions: number;
  users: number;
  returningUsers: number;
  bounces: number;
  sessionSeconds: number;
  revenue: number;
  spend: number;
  leads: number;
  qualifiedLeads: number;
  conversions: number;
  clicks: number;
  landingPageViews: number;
}

export interface AnalyticsFilterState {
  channel?: AnalyticsChannel;
  campaign?: string;
  region?: AnalyticsRegion;
  device?: AnalyticsDevice;
  audience?: AnalyticsAudience;
  /** A real user-chosen date range for `range: "custom"` — falls back to a fixed historical slice when unset. */
  customRange?: { start: string; end: string };
}

export type MetricTrend = "up" | "down" | "steady";

export interface AnalyticsSummaryMetric {
  id: string;
  label: string;
  value: string;
  trend: MetricTrend;
  change: string;
  comparison: string;
  sparkline: number[];
  tone: "positive" | "negative" | "neutral";
}

export interface AnalyticsRevenuePoint {
  label: string;
  revenue: number;
  spend: number;
}

export interface AnalyticsTrafficMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  tone: "positive" | "negative" | "neutral";
}

export type ChannelHealthStatus = "Healthy" | "Monitoring" | "Optimizing";

export interface AnalyticsChannelRow {
  channel: AnalyticsChannel;
  spend: string;
  revenue: string;
  roas: string;
  cpa: string;
  leads: string;
  status: ChannelHealthStatus;
}

export interface AnalyticsCampaignRow {
  name: string;
  clicks: number;
  ctr: string;
  cpc: string;
  spend: string;
  conversions: number;
  revenue: string;
  roi: string;
}

export interface AnalyticsFunnelStage {
  stage: string;
  value: number;
  percent: number;
}

export interface AnalyticsAudienceSegment {
  label: string;
  value: string;
}

export interface AnalyticsGeoRow {
  country: string;
  city: string;
  revenue: string;
  conversions: number;
}

export type InsightPriority = "High" | "Medium" | "Low";
export type InsightStatus = "new" | "applied" | "dismissed";

export interface AnalyticsInsight {
  id: string;
  title: string;
  description: string;
  priority: InsightPriority;
  confidence: number;
  uplift: string;
  status: InsightStatus;
}

export interface AnalyticsSnapshot {
  summaryMetrics: AnalyticsSummaryMetric[];
  revenueSeries: AnalyticsRevenuePoint[];
  trafficMetrics: AnalyticsTrafficMetric[];
  channelPerformance: AnalyticsChannelRow[];
  campaignPerformance: AnalyticsCampaignRow[];
  conversionFunnel: AnalyticsFunnelStage[];
  audienceInsights: AnalyticsAudienceSegment[];
  geoPerformance: AnalyticsGeoRow[];
  regionCount: number;
}

/** One weighted input into `AnalyticsHealthScore` — every `score` is 0-100 and every source is a real, already-computed Analytics signal. */
export interface AnalyticsHealthSignal {
  key: string;
  label: string;
  weight: number;
  score: number;
  status: "strength" | "risk" | "neutral";
  detail: string;
}

export interface AnalyticsHealthScore {
  score: number;
  label: string;
  breakdown: AnalyticsHealthSignal[];
  strengths: string[];
  risks: string[];
  generatedAt: string;
}

/** A genuinely new AI capability (not existing before this pass) — a deterministic diff of two periods' real raw summary numbers. */
export interface AnalyticsPeriodComparisonSide {
  label: string;
  revenue: number;
  spend: number;
  leads: number;
  conversions: number;
  conversionRate: number;
}

export interface AnalyticsPeriodComparison {
  periodA: AnalyticsPeriodComparisonSide;
  periodB: AnalyticsPeriodComparisonSide;
  deltas: { revenue: number; spend: number; leads: number; conversions: number; conversionRate: number };
  summary: string;
}

export type AnalyticsActionCenterCategory = "risk" | "anomaly" | "opportunity" | "data-quality" | "attribution";

/** The unified Insight & Action Center row — consolidates what would otherwise be five near-duplicate "centers" (risk/anomaly/opportunity/data-quality/attribution) into one typed, categorized list. */
export interface AnalyticsActionCenterItem {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  category: AnalyticsActionCenterCategory;
  kind: "action" | "incident";
  actionLabel: string;
  /** A widget id to scroll to (see `scrollToWidget`), unless `isExternalRoute` is set, in which case it's a real app route. */
  target: string;
  isExternalRoute?: boolean;
}
