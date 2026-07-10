/**
 * Calixo Platform - Reputation Intelligence Core Types
 *
 * `BrandMention` is the raw record every computed view derives from — KPI totals, platform/
 * country distribution, the sentiment timeline, and the keyword cloud are all COMPUTED from this
 * array at query time (same discipline as `SocialAccount`/`SocialPost` in `core/social`), never
 * hand-authored per view. This fixes the audit's central finding: the legacy `brandKpis` claimed
 * 48,392 mentions while the real mention list backing "Live Mentions" had only 15 records.
 */

export type ReputationPlatform = "Twitter/X" | "Instagram" | "LinkedIn" | "Facebook" | "Reddit" | "YouTube" | "News/Blog";
export type MentionSentiment = "positive" | "neutral" | "negative";

export interface BrandMention {
  id: string;
  platform: ReputationPlatform;
  platformIcon: string;
  author: string;
  authorAvatar: string;
  authorFollowers: number;
  content: string;
  sentiment: MentionSentiment;
  sentimentScore: number;
  reach: number;
  engagement: number;
  country: string;
  language: string;
  url: string;
  isFlagged: boolean;
  isResolved: boolean;
  detectedAt: string;
  tags: string[];
  /** Tenant scoping, mirrors `SocialAccount.organizationId`. */
  organizationId: string;
  /** Set once a real Workflow Platform entry exists for this mention (assign/escalate) — additive, mirrors `SocialPost.workflowEntryId`. */
  workflowEntryId?: string;
}

export interface ReputationKpi {
  id: string;
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
  description: string;
}

export interface SentimentTimelinePoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface PlatformDistribution {
  platform: string;
  mentions: number;
  percentage: number;
  color: string;
}

export interface CountryDistribution {
  country: string;
  flag: string;
  mentions: number;
  percentage: number;
}

export interface KeywordCloudItem {
  text: string;
  value: number;
  sentiment: MentionSentiment;
  trend: "up" | "down" | "stable";
}

export interface CompetitorData {
  id: string;
  name: string;
  logo: string;
  shareOfVoice: number;
  totalMentions: number;
  reach: number;
  avgSentiment: number;
  engagement: number;
  growth: number;
  topKeywords: string[];
  campaignActivity: number;
}

/** Historical share-of-voice series — kept as a configured fixture (no real daily competitor feed exists), same "disclosed configured estimate" pattern Ads used for spend trends. Calixo's own current-period figures elsewhere always come from `ReputationEngine`. */
export interface ShareOfVoiceTimelinePoint {
  date: string;
  [competitorName: string]: number | string;
}

/** Industry-wide topic/conversation volume — a legitimately distinct concept from "mentions of our own brand" (which must reconcile to the real `BrandMention` list). Kept as configured fixture data; `growth` feeds the real forecast in `forecastReputationTrend()`. */
export interface TrendingTopic {
  id: string;
  topic: string;
  volume: number;
  growth: number;
  sentiment: number;
  relatedTopics: string[];
  firstDetected: string;
  peak: string;
}

export type CrisisSeverity = "critical" | "warning" | "info";

export interface CrisisAlert {
  id: string;
  title: string;
  description: string;
  severity: CrisisSeverity;
  source: string;
  mentionCount: number;
  reach: number;
  riskScore: number;
  detectedAt: string;
  isResolved: boolean;
  recommendedAction: string;
}

export type ReputationInsightType = "opportunity" | "risk" | "recommendation" | "summary";

export interface ReputationInsight {
  id: string;
  type: ReputationInsightType;
  title: string;
  content: string;
  confidence: number;
  relatedData: string[];
  generatedAt: string;
}

export type ReputationReportType = "weekly" | "monthly" | "quarterly" | "executive";
export type ReputationReportFormat = "PDF" | "CSV" | "Excel";
export type ReputationReportStatus = "ready" | "generating" | "scheduled";

export interface BrandReport {
  id: string;
  name: string;
  type: ReputationReportType;
  description: string;
  lastGenerated: string;
  nextScheduled: string;
  format: ReputationReportFormat;
  size: string;
  status: ReputationReportStatus;
}

export type AlertRuleType = "mention_spike" | "sentiment_drop" | "competitor_activity" | "crisis_detection" | "keyword_match";

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  type: AlertRuleType;
  enabled: boolean;
  threshold: string;
  channels: string[];
  createdAt: string;
}

export interface ReputationSettings {
  trackedKeywords: string[];
  trackedCompetitors: string[];
  trackedLanguages: string[];
  trackedCountries: string[];
  trackedSources: string[];
  alertThresholds: { mentionSpike: number; sentimentDrop: number; crisisScore: number };
}

export interface ReputationOverviewSummary {
  totalMentions: number;
  totalReach: number;
  avgSentimentScore: number;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  flaggedCount: number;
  unresolvedCount: number;
}

/** One weighted input into `ReputationHealthScore` — every `score` is 0-100 and every source is a real, already-computed Reputation signal. Mirrors `SocialHealthSignal`. */
export interface ReputationHealthSignal {
  key: string;
  label: string;
  weight: number;
  score: number;
  status: "strength" | "risk" | "neutral";
  detail: string;
}

export interface ReputationHealthScore {
  score: number;
  label: string;
  breakdown: ReputationHealthSignal[];
  strengths: string[];
  risks: string[];
  generatedAt: string;
}

export type ReputationActionCenterCategory = "risk" | "opportunity" | "attribution" | "data-quality" | "approval";

/** The unified Reputation Action & Insight Center row — consolidates risk/opportunity/attribution/data-quality/approval-backlog into one typed list instead of the brief's 7 separately-named "centers". Mirrors `SocialActionCenterItem`. */
export interface ReputationActionCenterItem {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  category: ReputationActionCenterCategory;
  actionLabel: string;
  target: string;
  isExternalRoute?: boolean;
}
