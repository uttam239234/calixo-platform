/**
 * Calixo Platform - Ads Core Types
 *
 * `Campaign` is the single raw record every computed view derives from —
 * platform aggregates, budget pacing, and the performance summary are all
 * COMPUTED from the campaign array at query time (same discipline as
 * `AnalyticsFact` in `core/analytics`), never hand-authored per view.
 */

export type CampaignStatus = "Draft" | "Review" | "Scheduled" | "Running" | "Paused" | "Completed" | "Archived";
export type PlatformConnectionStatus = "Connected" | "Syncing" | "Attention required";

export interface Campaign {
  id: string;
  platformId: string;
  name: string;
  objective: string;
  budget: number;
  spend: number;
  status: CampaignStatus;
  conversions: number;
  ctr: number;
  roas: number;
  revenue: number;
  clicks: number;
  impressions: number;
  cpa: number;
  qualityScore: number;
  owner: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  audience: string;
  keywords: string[];
  creatives: number;
  /** Tenant scoping, added for the enterprise certification pass — see `AdsTenantDefaults.ts`. */
  organizationId: string;
}

/** Static per-provider identity only (name/color/branding) — every numeric field is computed live by `AdsEngine.getPlatforms()`, never hand-authored. */
export interface AdsPlatformMeta {
  id: string;
  name: string;
  shortName: string;
  color: string;
}

/** The view model `PlatformOverview`/`PlatformStatus` render — identity fields from `AdsPlatformMeta`, every number aggregated live from real campaigns. */
export interface AdsPlatform extends AdsPlatformMeta {
  status: PlatformConnectionStatus;
  lastSync: string;
  campaignCount: number;
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
  roas: number;
  ctr: number;
  /** Set once a real Connector Platform connection exists for this provider (Workstream B7) — distinguishes real connector health from the demo placeholder status. */
  isLiveConnector: boolean;
}

export interface AdsBudget {
  total: number;
  spent: number;
  remaining: number;
  projected: number;
  period: string;
}

export interface AdsPerformanceSummary {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  roas: number;
  spendChange: number;
  conversionChange: number;
  roasChange: number;
}

export type RecommendationImpact = "High" | "Medium" | "Low";
export type RecommendationCategory = "Budget" | "Performance" | "Creative" | "Audience";
export type RecommendationStatus = "new" | "applied" | "dismissed";

export interface AdsRecommendation {
  id: string;
  title: string;
  description: string;
  impact: RecommendationImpact;
  category: RecommendationCategory;
  status: RecommendationStatus;
}

export type CampaignSortKey = "spend" | "conversions" | "ctr" | "roas" | "cpa" | "createdAt" | "name";
export type SortDirection = "asc" | "desc";
export type CampaignAction = "Pause" | "Resume" | "Archive" | "Duplicate" | "Delete";

/** One weighted input into `AdsHealthScore` — every `score` is 0-100 and every source is a real, already-computed Ads signal. Mirrors `AnalyticsHealthSignal`. */
export interface AdsHealthSignal {
  key: string;
  label: string;
  weight: number;
  score: number;
  status: "strength" | "risk" | "neutral";
  detail: string;
}

export interface AdsHealthScore {
  score: number;
  label: string;
  breakdown: AdsHealthSignal[];
  strengths: string[];
  risks: string[];
  generatedAt: string;
}

export type AdsActionCenterCategory = "budget-risk" | "creative-fatigue" | "opportunity" | "attribution" | "data-quality";

/** The unified Ads Action & Insight Center row — consolidates budget risk, creative fatigue, optimization opportunities, attribution, and data quality into one typed list instead of separate near-duplicate widgets. Mirrors `AnalyticsActionCenterItem`. */
export interface AdsActionCenterItem {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  category: AdsActionCenterCategory;
  actionLabel: string;
  target: string;
  isExternalRoute?: boolean;
}

export interface CampaignFilterState {
  status: string;
  platform: string;
  objective: string;
  budget: string;
  created: string;
  owner: string;
  sort: CampaignSortKey;
  direction: SortDirection;
}

export const defaultCampaignFilters: CampaignFilterState = { status: "", platform: "", objective: "", budget: "", created: "", owner: "", sort: "spend", direction: "desc" };
