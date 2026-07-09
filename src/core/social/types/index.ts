/**
 * Calixo Platform - Social Core Types
 *
 * `SocialAccount`/`SocialPost` are the raw records every computed view derives from — platform
 * summaries, the overview KPI totals, and recommendations are all COMPUTED from these arrays at
 * query time (same discipline as `Campaign` in `core/ads`), never hand-authored per view.
 */

export type SocialPlatform = "Facebook" | "Instagram" | "LinkedIn" | "X" | "TikTok" | "YouTube" | "Threads" | "Pinterest" | "YouTube Community";
export type SocialAccountStatus = "Connected" | "Disconnected" | "Needs attention";
export type SocialPostStatus = "Published" | "Scheduled" | "Draft";

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  handle: string;
  color: string;
  shortName: string;
  status: SocialAccountStatus;
  followers: number;
  engagementRate: number;
  posts: number;
  reach: number;
  lastSync: string;
  /** Tenant scoping, added for the enterprise certification pass — see `SocialTenantDefaults.ts`. */
  organizationId: string;
  /** Set once a real Connector Platform connection exists for this provider (Workstream C4) — distinguishes real connector health from the demo placeholder status. */
  isLiveConnector: boolean;
}

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  accountId: string;
  content: string;
  status: SocialPostStatus;
  publishedAt: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  organizationId: string;
  /** Set once a real Workflow Platform approval entry exists for this post (Workstream C7) — an additive approval axis, separate from `status`'s publishing axis. */
  workflowEntryId?: string;
}

export type RecommendationImpact = "High" | "Medium" | "Low";
export type RecommendationCategory = "Content" | "Timing" | "Engagement" | "Growth";
export type RecommendationStatus = "new" | "applied" | "dismissed";

export interface SocialRecommendation {
  id: string;
  title: string;
  description: string;
  impact: RecommendationImpact;
  category: RecommendationCategory;
  status: RecommendationStatus;
}

/** The view model `PlatformOverview`/`ConnectedAccounts` render — real aggregates computed live from the account's own fields (an account already carries its own totals, unlike Ads where platform totals had to be summed across many campaigns). */
export interface SocialPlatformSummary {
  platform: SocialPlatform;
  accountId: string;
  color: string;
  shortName: string;
  status: SocialAccountStatus;
  followers: number;
  reach: number;
  engagementRate: number;
  posts: number;
  lastSync: string;
  isLiveConnector: boolean;
}

export interface SocialOverviewSummary {
  totalFollowers: number;
  totalReach: number;
  avgEngagementRate: number;
  totalPosts: number;
  connectedAccounts: number;
  totalAccounts: number;
}

export type SortDirection = "asc" | "desc";

/** One weighted input into `SocialHealthScore` — every `score` is 0-100 and every source is a real, already-computed Social signal. Mirrors `AdsHealthSignal`. */
export interface SocialHealthSignal {
  key: string;
  label: string;
  weight: number;
  score: number;
  status: "strength" | "risk" | "neutral";
  detail: string;
}

export interface SocialHealthScore {
  score: number;
  label: string;
  breakdown: SocialHealthSignal[];
  strengths: string[];
  risks: string[];
  generatedAt: string;
}

export type SocialActionCenterCategory = "risk" | "opportunity" | "attribution" | "data-quality" | "approval";

/** The unified Social Action & Insight Center row — consolidates risk/opportunity/attribution/data-quality/approval-backlog into one typed list instead of separate near-duplicate "centers". Mirrors `AdsActionCenterItem`. */
export interface SocialActionCenterItem {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  category: SocialActionCenterCategory;
  actionLabel: string;
  target: string;
  isExternalRoute?: boolean;
}
