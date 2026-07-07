/**
 * Calixo Platform - Shared Analytics Platform Contracts
 *
 * Standardized summary shapes every Calixo module should consume instead
 * of reaching into `AnalyticsEngine` internals directly (rule: "No module
 * may directly consume Analytics internals"). `AnalyticsPlatformAPI`
 * (./AnalyticsPlatformAPI.ts) is the only class that implements these.
 *
 * Not every contract below has a real implementation yet — Analytics only
 * computes what its own fact table (marketing/channel/traffic/audience/
 * geo dimensions) can back today. Contracts for domains with no backing
 * data source yet (SEO, Ads, Social, Brand, Content, Workflow,
 * Notifications) are declared so future modules — and the eventual
 * Connector Platform — have a fixed shape to implement against, without
 * Analytics fabricating data it doesn't have. See `AnalyticsPlatformAPI`
 * for which of these are implemented today vs. reserved for later.
 */

import type {
  AnalyticsAudienceSegment,
  AnalyticsCampaignRow,
  AnalyticsChannelRow,
  AnalyticsFunnelStage,
  AnalyticsGeoRow,
  AnalyticsInsight,
  AnalyticsRevenuePoint,
  AnalyticsSummaryMetric,
  AnalyticsTrafficMetric,
} from "../types";

/** Umbrella contract: everything a dashboard-style consumer needs in one call. */
export interface AnalyticsSummary {
  kpis: AnalyticsSummaryMetric[];
  insights: AnalyticsInsight[];
  generatedAt: string;
}

export interface ExecutiveAnalyticsSummary {
  kpis: AnalyticsSummaryMetric[];
  revenueTrend: AnalyticsRevenuePoint[];
  topInsights: AnalyticsInsight[];
}

export interface RevenueSummary {
  totalRevenue: number;
  totalSpend: number;
  roas: number;
  series: AnalyticsRevenuePoint[];
}

export interface TrafficSummary {
  metrics: AnalyticsTrafficMetric[];
}

export interface AudienceSummary {
  segments: AnalyticsAudienceSegment[];
  geo: AnalyticsGeoRow[];
  regionCount: number;
}

export interface ConversionSummary {
  funnel: AnalyticsFunnelStage[];
}

export interface CampaignSummary {
  campaigns: AnalyticsCampaignRow[];
  channels: AnalyticsChannelRow[];
}

/** What the Dashboard module's landing page needs — the concrete contract `DashboardEngine` consumes instead of calling `analyticsEngine` directly. */
export interface DashboardAnalyticsSummary {
  kpis: AnalyticsSummaryMetric[];
  revenueSeries: AnalyticsRevenuePoint[];
  channels: AnalyticsChannelRow[];
  insights: AnalyticsInsight[];
}

/**
 * Reserved contracts — shape is fixed so future modules and the Connector
 * Platform can implement/populate them, but `AnalyticsPlatformAPI` does
 * NOT implement these yet (no real fact-table dimension backs them).
 */
export interface SEOAnalyticsSummary {
  organicSessions: number;
  averagePosition: number;
  topQueries: { query: string; clicks: number; impressions: number }[];
}

export interface AdsAnalyticsSummary {
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
}

export interface SocialAnalyticsSummary {
  followers: number;
  engagementRate: number;
  topPosts: { id: string; engagement: number }[];
}

export interface BrandAnalyticsSummary {
  sentimentScore: number;
  mentionVolume: number;
  shareOfVoice: number;
}

export interface ContentSummary {
  publishedCount: number;
  topPerforming: { id: string; title: string; views: number }[];
}

export interface WorkflowAnalyticsSummary {
  pendingApprovals: number;
  avgApprovalDays: number;
}

export interface NotificationAnalyticsSummary {
  unreadCount: number;
  deliveryRate: number;
}
