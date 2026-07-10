/**
 * Calixo Platform - Reputation Platform API
 *
 * The ONE sanctioned facade for Brand Monitoring data — mirrors `SocialPlatformAPI`.
 * `useBrandMonitoring()` and every brand component should go through this, never
 * `reputationEngine` directly.
 */
import { analyticsPlatformAPI } from "@/core/analytics";
import type { AnalyticsChannel, AnalyticsRange } from "@/core/analytics";
import { entitlementPlatformAPI } from "@/core/platform/commercial/EntitlementPlatformAPI";
import { linearForecast, type ForecastPoint } from "@/core/platform/forecast/linearForecast";
import { workflowPlatformAPI } from "@/core/workflow";
import { computeCountryDistribution, computeKeywordCloud, computeOverview, computePlatformDistribution, computeSentimentTimeline, reputationEngine } from "../engine/ReputationEngine";
import { COMPETITOR_SEED, SHARE_OF_VOICE_TIMELINE_SEED } from "../mock/generateReputationMockData";
import { crisisDetectionRegistry } from "../registry/CrisisDetectionRegistry";
import { REPUTATION_ORGANIZATION_ID } from "../tenant/ReputationTenantDefaults";
import type {
  BrandMention,
  CompetitorData,
  CountryDistribution,
  CrisisAlert,
  KeywordCloudItem,
  PlatformDistribution,
  ReputationActionCenterItem,
  ReputationHealthScore,
  ReputationHealthSignal,
  ReputationInsight,
  ReputationKpi,
  ReputationOverviewSummary,
  ReputationPlatform,
  SentimentTimelinePoint,
} from "../types";

/** Only the sources with a genuine Analytics channel equivalent — Meta owns both Facebook and Instagram; X/Reddit/YouTube/News have no channel row to cross-reference. */
const REPUTATION_PLATFORM_TO_ANALYTICS_CHANNEL: Partial<Record<ReputationPlatform, AnalyticsChannel>> = {
  Facebook: "Meta",
  Instagram: "Meta",
  LinkedIn: "LinkedIn",
};

function scoreStatus(score: number): "strength" | "risk" | "neutral" {
  return score >= 75 ? "strength" : score < 50 ? "risk" : "neutral";
}

function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function splitByRecency(mentions: BrandMention[]): { older: BrandMention[]; recent: BrandMention[] } {
  const sorted = [...mentions].sort((a, b) => new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime());
  const midpoint = Math.floor(sorted.length / 2);
  return { older: sorted.slice(0, midpoint), recent: sorted.slice(midpoint) };
}

function computeChangeLabel(current: number, previous: number): { change: string; positive: boolean } {
  if (previous === 0) return { change: current > 0 ? "New this period" : "No change", positive: current >= 0 };
  const delta = ((current - previous) / previous) * 100;
  const rounded = Math.round(delta * 10) / 10;
  return { change: `${rounded >= 0 ? "+" : ""}${rounded}%`, positive: rounded >= 0 };
}

export interface SentimentDriver {
  tag: string;
  mentionCount: number;
  positivePct: number;
}

export class ReputationPlatformAPI {
  listMentions(): BrandMention[] {
    return reputationEngine.listMentions();
  }

  getMention(id: string): BrandMention | undefined {
    return reputationEngine.getMention(id);
  }

  updateMention(id: string, partial: Partial<BrandMention>): BrandMention | undefined {
    return reputationEngine.updateMention(id, partial);
  }

  resolveMention(id: string): BrandMention | undefined {
    return reputationEngine.resolveMention(id);
  }

  unresolveMention(id: string): BrandMention | undefined {
    return reputationEngine.unresolveMention(id);
  }

  flagMention(id: string): BrandMention | undefined {
    return reputationEngine.flagMention(id);
  }

  unflagMention(id: string): BrandMention | undefined {
    return reputationEngine.unflagMention(id);
  }

  getPlatformDistribution(mentions?: BrandMention[]): PlatformDistribution[] {
    return computePlatformDistribution(mentions ?? reputationEngine.listMentions());
  }

  getCountryDistribution(mentions?: BrandMention[]): CountryDistribution[] {
    return computeCountryDistribution(mentions ?? reputationEngine.listMentions());
  }

  getSentimentTimeline(mentions?: BrandMention[]): SentimentTimelinePoint[] {
    return computeSentimentTimeline(mentions ?? reputationEngine.listMentions());
  }

  getKeywordCloud(mentions?: BrandMention[]): KeywordCloudItem[] {
    return computeKeywordCloud(mentions ?? reputationEngine.listMentions());
  }

  getOverview(mentions?: BrandMention[]): ReputationOverviewSummary {
    return computeOverview(mentions ?? reputationEngine.listMentions());
  }

  /** Per-tag sentiment breakdown — replaces `BrandSentiment.tsx`'s hardcoded "Topic Analysis" panel with a real computation over each mention's own `tags`/`sentiment`. */
  getTopicSentimentBreakdown(mentions?: BrandMention[]): { tag: string; mentionCount: number; positivePct: number; label: "positive" | "mixed" | "negative" }[] {
    const list = mentions ?? reputationEngine.listMentions();
    const stats = new Map<string, { count: number; positive: number }>();
    for (const mention of list) {
      for (const tag of mention.tags) {
        const stat = stats.get(tag) ?? { count: 0, positive: 0 };
        stat.count += 1;
        if (mention.sentiment === "positive") stat.positive += 1;
        stats.set(tag, stat);
      }
    }
    return [...stats.entries()]
      .map(([tag, stat]) => {
        const positivePct = Math.round((stat.positive / stat.count) * 100);
        const label: "positive" | "mixed" | "negative" = positivePct >= 70 ? "positive" : positivePct >= 40 ? "mixed" : "negative";
        return { tag, mentionCount: stat.count, positivePct, label };
      })
      .sort((a, b) => b.mentionCount - a.mentionCount)
      .slice(0, 6);
  }

  /**
   * Replaces `BrandSentiment.tsx`'s fabricated "Emotion Detection" panel (no field in the data
   * model ever backed "Trust: High" etc.) with the tags genuinely pulling sentiment most
   * positive/negative, computed from real mentions.
   */
  getTopSentimentDrivers(mentions?: BrandMention[]): { positive: SentimentDriver[]; negative: SentimentDriver[] } {
    const breakdown = this.getTopicSentimentBreakdown(mentions).filter(b => b.mentionCount >= 2);
    const sorted = [...breakdown].sort((a, b) => b.positivePct - a.positivePct);
    const toDriver = (b: (typeof breakdown)[number]): SentimentDriver => ({ tag: b.tag, mentionCount: b.mentionCount, positivePct: b.positivePct });
    return {
      positive: sorted.slice(0, 3).map(toDriver),
      negative: sorted
        .slice(-3)
        .reverse()
        .map(toDriver),
    };
  }

  getCrisisAlerts(mentions?: BrandMention[]): CrisisAlert[] {
    return crisisDetectionRegistry.generate(mentions ?? reputationEngine.listMentions());
  }

  resolveCrisisAlert(id: string): void {
    crisisDetectionRegistry.resolve(id);
  }

  reopenCrisisAlert(id: string): void {
    crisisDetectionRegistry.reopen(id);
  }

  /**
   * Calixo's own row is overlaid with real `ReputationEngine` totals (mentions, reach, sentiment,
   * engagement, growth) — the mention-count/reach/sentiment reconciliation the audit called for.
   * `shareOfVoice`/`campaignActivity` intentionally stay the tracked, configured value: Share of
   * Voice is a distinct measurement methodology (a media-monitoring index across the FULL
   * conversation volume) from "count of mentions in this session's tracked sample" — recomputing
   * it as a raw ratio against competitors' much-larger historical totals would produce a number
   * with no relationship to the real, consistently-tracked 28-34% series in
   * `SHARE_OF_VOICE_TIMELINE_SEED`. Competitor rows besides Calixo stay configured fixture data —
   * no real competitor-scraping pipeline exists.
   */
  getCompetitorLandscape(mentions?: BrandMention[], competitors: CompetitorData[] = COMPETITOR_SEED): CompetitorData[] {
    const list = mentions ?? reputationEngine.listMentions();
    const overview = computeOverview(list);
    const { older, recent } = splitByRecency(list);
    const growth = older.length > 0 ? Math.round(((recent.length - older.length) / older.length) * 1000) / 10 : COMPETITOR_SEED[0].growth;
    const totalEngagement = list.reduce((sum, m) => sum + m.engagement, 0);

    return competitors.map(c => {
      if (c.name !== "Calixo") return c;
      return {
        ...c,
        totalMentions: overview.totalMentions,
        reach: overview.totalReach,
        avgSentiment: overview.avgSentimentScore,
        engagement: totalEngagement,
        growth,
      };
    });
  }

  /**
   * Social Media computes no attribution math itself — this cross-references a platform's
   * activity against Analytics' own channel performance, matching platform name to Analytics
   * channel (Meta owns both Facebook and Instagram). `null` when the platform has no Analytics
   * channel equivalent or Analytics has no data for it yet — an honest gap, not a fabricated
   * number.
   */
  getAttributionNote(platform: ReputationPlatform, range: AnalyticsRange = "30d"): string | null {
    const channel = REPUTATION_PLATFORM_TO_ANALYTICS_CHANNEL[platform];
    if (!channel) return null;
    const { channels } = analyticsPlatformAPI.getCampaignSummary(range);
    const row = channels.find(c => c.channel === channel);
    if (!row) return null;
    return `Analytics attributes ${row.revenue} in revenue to ${channel} this period at ${row.roas} ROAS — channel health is ${row.status.toLowerCase()}.`;
  }

  /**
   * Real KPI values assembled from `ReputationEngine`'s aggregates plus the reconciled competitor
   * landscape — fixes the audit's central finding (48,392 claimed vs. 15 real mentions). Every
   * `change` is a real comparison: older vs. more recent half of tracked mentions, or (for Share
   * of Voice) the last two real points in the tracked SOV series.
   */
  getKpis(mentions?: BrandMention[], competitors?: CompetitorData[]): ReputationKpi[] {
    const list = mentions ?? reputationEngine.listMentions();
    const overview = computeOverview(list);
    const { older, recent } = splitByRecency(list);

    const olderAvgScore = older.length > 0 ? older.reduce((sum, m) => sum + m.sentimentScore, 0) / older.length : overview.avgSentimentScore / 100;
    const recentAvgScore = recent.length > 0 ? recent.reduce((sum, m) => sum + m.sentimentScore, 0) / recent.length : overview.avgSentimentScore / 100;
    const healthChange = computeChangeLabel(recentAvgScore, olderAvgScore);

    const mentionsChange = computeChangeLabel(recent.length, older.length);
    const olderReach = older.reduce((sum, m) => sum + m.reach, 0);
    const recentReach = recent.reduce((sum, m) => sum + m.reach, 0);
    const reachChange = computeChangeLabel(recentReach, olderReach);

    const landscape = this.getCompetitorLandscape(list, competitors);
    const ranked = [...landscape].sort((a, b) => b.shareOfVoice - a.shareOfVoice);
    const ownRow = landscape.find(c => c.name === "Calixo") ?? landscape[0];
    const rank = ranked.findIndex(c => c.name === ownRow.name) + 1;

    const previousSov = SHARE_OF_VOICE_TIMELINE_SEED.length >= 2 ? Number(SHARE_OF_VOICE_TIMELINE_SEED[SHARE_OF_VOICE_TIMELINE_SEED.length - 2].Calixo) : ownRow.shareOfVoice;
    const sovChange = computeChangeLabel(ownRow.shareOfVoice, previousSov);

    return [
      { id: "1", title: "Brand Health Score", value: overview.avgSentimentScore.toFixed(1), change: healthChange.change, positive: healthChange.positive, icon: "Heart", description: "Overall brand sentiment and perception index" },
      { id: "2", title: "Share of Voice", value: `${ownRow.shareOfVoice}%`, change: sovChange.change, positive: sovChange.positive, icon: "BarChart3", description: "Market conversation share vs competitors" },
      { id: "3", title: "Total Mentions", value: overview.totalMentions.toLocaleString(), change: mentionsChange.change, positive: mentionsChange.positive, icon: "MessageSquare", description: "Total brand mentions across all channels" },
      { id: "4", title: "Total Reach", value: formatCompact(overview.totalReach), change: reachChange.change, positive: reachChange.positive, icon: "Eye", description: "Estimated audience reach of all mentions" },
      { id: "5", title: "Avg Sentiment", value: `${overview.avgSentimentScore}%`, change: healthChange.change, positive: healthChange.positive, icon: "TrendingUp", description: "Average positive sentiment percentage" },
      { id: "6", title: "Competitor Rank", value: `#${rank}`, change: `of ${ranked.length} tracked`, positive: rank === 1, icon: "Trophy", description: "Rank among tracked competitors" },
    ];
  }

  /**
   * A weighted composite of five already-real signals — mirrors `SocialPlatformAPI.getHealthScore()`.
   */
  getHealthScore(mentions?: BrandMention[], competitors?: CompetitorData[]): ReputationHealthScore {
    const list = mentions ?? reputationEngine.listMentions();
    const overview = computeOverview(list);

    const sentimentScore = overview.avgSentimentScore;

    const landscape = this.getCompetitorLandscape(list, competitors);
    const ownRow = landscape.find(c => c.name === "Calixo") ?? landscape[0];
    const sovScore = Math.min(100, ownRow.shareOfVoice * 2.5);

    const activeAlerts = this.getCrisisAlerts(list).filter(a => !a.isResolved);
    const maxRisk = activeAlerts.length > 0 ? Math.max(...activeAlerts.map(a => a.riskScore)) : 0;
    const riskHealthScore = Math.max(0, 100 - maxRisk);

    const responseScore = overview.totalMentions > 0 ? Math.round(((overview.totalMentions - overview.unresolvedCount) / overview.totalMentions) * 100) : 100;

    const ranked = [...landscape].sort((a, b) => b.shareOfVoice - a.shareOfVoice);
    const rank = ranked.findIndex(c => c.name === ownRow.name) + 1;
    const positionScore = Math.max(0, 100 - (rank - 1) * 20);

    const breakdown: ReputationHealthSignal[] = [
      { key: "sentiment", label: "Sentiment Health", weight: 0.25, score: sentimentScore, status: scoreStatus(sentimentScore), detail: `${overview.positivePct}% positive across ${overview.totalMentions} tracked mentions.` },
      { key: "shareOfVoice", label: "Share of Voice", weight: 0.2, score: sovScore, status: scoreStatus(sovScore), detail: `${ownRow.shareOfVoice}% share of tracked conversation.` },
      { key: "crisisRisk", label: "Crisis Risk", weight: 0.25, score: riskHealthScore, status: scoreStatus(riskHealthScore), detail: activeAlerts.length > 0 ? `${activeAlerts.length} active alert${activeAlerts.length === 1 ? "" : "s"}, highest risk score ${maxRisk}.` : "No active crisis alerts." },
      { key: "responseSpeed", label: "Response Health", weight: 0.15, score: responseScore, status: scoreStatus(responseScore), detail: `${overview.unresolvedCount} of ${overview.totalMentions} mention${overview.totalMentions === 1 ? "" : "s"} still unresolved.` },
      { key: "competitorPosition", label: "Competitor Position", weight: 0.15, score: positionScore, status: scoreStatus(positionScore), detail: `Ranked #${rank} of ${ranked.length} tracked brands.` },
    ];

    const score = Math.round(breakdown.reduce((sum, s) => sum + s.score * s.weight, 0));
    const label = score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : "Needs Attention";

    return {
      score,
      label,
      breakdown,
      strengths: breakdown.filter(s => s.status === "strength").map(s => s.label),
      risks: breakdown.filter(s => s.status === "risk").map(s => s.label),
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * The unified Reputation Action & Insight Center — consolidates crisis alerts, sentiment-driven
   * opportunities, attribution, data-quality, and the real cross-module Workflow Platform approval
   * backlog into one typed list instead of the brief's 7 separately-named "centers".
   */
  getActionCenterItems(mentions?: BrandMention[], competitors?: CompetitorData[], organizationId: string = REPUTATION_ORGANIZATION_ID): ReputationActionCenterItem[] {
    const list = mentions ?? reputationEngine.listMentions();
    const items: ReputationActionCenterItem[] = [];

    for (const alert of this.getCrisisAlerts(list)
      .filter(a => !a.isResolved)
      .slice(0, 3)) {
      items.push({
        id: `crisis-${alert.id}`,
        title: alert.title,
        description: alert.description,
        severity: alert.severity === "critical" ? "high" : alert.severity === "warning" ? "medium" : "low",
        category: "risk",
        actionLabel: "Investigate",
        target: "/dashboard/brand/crisis",
        isExternalRoute: true,
      });
    }

    for (const [index, opportunity] of this.detectOpportunities(list).entries()) {
      items.push({
        id: `opportunity-${index}`,
        title: "Positive sentiment driver",
        description: opportunity,
        severity: "low",
        category: "opportunity",
        actionLabel: "Review",
        target: "/dashboard/brand/insights",
        isExternalRoute: true,
      });
    }

    const topAttributedMention = [...list].filter(m => REPUTATION_PLATFORM_TO_ANALYTICS_CHANNEL[m.platform]).sort((a, b) => b.reach - a.reach)[0];
    const attributionNote = topAttributedMention ? this.getAttributionNote(topAttributedMention.platform) : null;
    if (topAttributedMention && attributionNote) {
      items.push({
        id: `attribution-${topAttributedMention.platform}`,
        title: `${topAttributedMention.platform} attribution`,
        description: attributionNote,
        severity: "low",
        category: "attribution",
        actionLabel: "View channels",
        target: "/dashboard/analytics",
        isExternalRoute: true,
      });
    }

    const unresolvedFlagged = list.filter(m => m.isFlagged && !m.isResolved);
    if (unresolvedFlagged.length > 0) {
      items.push({
        id: "data-quality-unresolved-flagged",
        title: `${unresolvedFlagged.length} flagged mention${unresolvedFlagged.length === 1 ? "" : "s"} unresolved`,
        description: "These mentions were flagged for review and still need action.",
        severity: "medium",
        category: "data-quality",
        actionLabel: "Review",
        target: "/dashboard/brand/mentions",
        isExternalRoute: true,
      });
    }

    const pendingApprovals = workflowPlatformAPI.getPendingApprovals(3);
    for (const entry of pendingApprovals) {
      items.push({
        id: `approval-${entry.id}`,
        title: `"${entry.title}" needs review`,
        description: `Submitted by ${entry.submittedBy}${entry.dueDate ? `, due ${new Date(entry.dueDate).toLocaleDateString()}` : ""}.`,
        severity: entry.priority === "critical" || entry.priority === "high" ? "high" : "medium",
        category: "approval",
        actionLabel: "Review",
        target: "/dashboard/workflows",
        isExternalRoute: true,
      });
    }

    const exportsRemaining = entitlementPlatformAPI.remaining(organizationId, "exportsUsed");
    const exportsLimit = entitlementPlatformAPI.limit(organizationId, "exportsUsed");
    if (exportsLimit && exportsLimit > 0 && exportsRemaining / exportsLimit <= 0.15) {
      items.push({
        id: "entitlement-exports-low",
        title: "Export quota running low",
        description: `${exportsRemaining} of ${exportsLimit} exports remaining this period.`,
        severity: "medium",
        category: "data-quality",
        actionLabel: "Review plan",
        target: "/dashboard/settings",
        isExternalRoute: true,
      });
    }

    return items;
  }

  // ---------------------------------------------------------------------
  // AI Reputation surface — every method below is deterministic/rule-based
  // (threshold checks, plain-text templates over real computed numbers, or
  // linear trend extrapolation via the shared `linearForecast`). None of
  // this is ML or LLM-generated — same "real, computable, not-yet-wired-
  // to-an-LLM" pattern used by `AnalyticsPlatformAPI`/`SocialPlatformAPI`.
  // ---------------------------------------------------------------------

  /** Rule-based natural-language explanation of sentiment distribution. */
  explainSentiment(mentions?: BrandMention[]): string {
    const overview = this.getOverview(mentions);
    if (overview.totalMentions === 0) return "No mentions tracked yet.";
    return `${overview.positivePct}% of ${overview.totalMentions} tracked mentions are positive, ${overview.neutralPct}% neutral, and ${overview.negativePct}% negative — average sentiment score is ${overview.avgSentimentScore}/100.`;
  }

  /** Rule-based comparison of mention volume between the older and more recent half of the tracked window. */
  explainMentionSpike(mentions?: BrandMention[]): string {
    const list = mentions ?? reputationEngine.listMentions();
    const { older, recent } = splitByRecency(list);
    if (older.length === 0) return "Not enough mention history yet to detect a volume change.";
    const change = computeChangeLabel(recent.length, older.length);
    return `Mention volume ${change.positive ? "increased" : "decreased"} ${change.change.replace("+", "").replace("-", "")} in the most recent tracked period compared to the prior one (${recent.length} vs ${older.length} mentions).`;
  }

  /** Rule-based comparison of average sentiment score between the older and more recent half of the tracked window. */
  explainReputationChange(mentions?: BrandMention[]): string {
    const list = mentions ?? reputationEngine.listMentions();
    const { older, recent } = splitByRecency(list);
    const olderAvg = older.length > 0 ? Math.round((older.reduce((sum, m) => sum + m.sentimentScore, 0) / older.length) * 100) : 0;
    const recentAvg = recent.length > 0 ? Math.round((recent.reduce((sum, m) => sum + m.sentimentScore, 0) / recent.length) * 100) : 0;
    const direction = recentAvg >= olderAvg ? "improved" : "declined";
    return `Average sentiment has ${direction} from ${olderAvg} to ${recentAvg} (out of 100) between the earlier and more recent halves of tracked mentions.`;
  }

  /** Threshold-based — every unresolved crisis alert, described with its real risk score. */
  detectRisks(mentions?: BrandMention[]): string[] {
    return this.getCrisisAlerts(mentions)
      .filter(a => !a.isResolved)
      .map(a => `${a.title} (risk score ${a.riskScore}/100).`);
  }

  /** Threshold-based — tags driving strongly positive sentiment, computed from real mention tags. */
  detectOpportunities(mentions?: BrandMention[]): string[] {
    const drivers = this.getTopSentimentDrivers(mentions);
    return drivers.positive.filter(d => d.positivePct >= 70).map(d => `"${d.tag}" is driving strongly positive sentiment (${d.positivePct}% positive across ${d.mentionCount} mentions) — consider amplifying content around this topic.`);
  }

  /** Composes the highest-priority risk, opportunity, and data-quality gap into concrete next steps. */
  recommendActions(mentions?: BrandMention[]): string[] {
    const list = mentions ?? reputationEngine.listMentions();
    const actions: string[] = [];
    const risks = this.detectRisks(list);
    if (risks.length > 0) actions.push(`Address the highest-risk alert: ${risks[0]}`);
    const opportunities = this.detectOpportunities(list);
    if (opportunities.length > 0) actions.push(`Capitalize on: ${opportunities[0]}`);
    const unresolvedFlagged = list.filter(m => m.isFlagged && !m.isResolved);
    if (unresolvedFlagged.length > 0) actions.push(`Resolve ${unresolvedFlagged.length} flagged mention${unresolvedFlagged.length === 1 ? "" : "s"} awaiting review.`);
    return actions;
  }

  /**
   * Linear trend extrapolation over a real series — the caller supplies it (e.g. a per-week
   * sentiment or mention-volume series from `getSentimentTimeline()`), keeping the platform API's
   * own dependency direction clean. Mirrors `SocialPlatformAPI.forecastEngagement()`.
   */
  forecastReputationTrend(series: number[], daysAhead = 7): ForecastPoint[] {
    return linearForecast(series, daysAhead);
  }

  /**
   * Real generated insights, replacing the legacy `aiInsights` fixture — every `confidence` value
   * is derived from real sample size (more tracked mentions → higher confidence), never a
   * hardcoded literal like the audit found (0.94, 0.88, 0.91...).
   */
  getInsights(mentions?: BrandMention[]): ReputationInsight[] {
    const list = mentions ?? reputationEngine.listMentions();
    const sampleConfidence = Math.round(Math.min(0.95, 0.5 + Math.min(0.4, list.length / 100)) * 100) / 100;
    const now = new Date().toISOString();
    const insights: ReputationInsight[] = [
      {
        id: "insight-summary",
        type: "summary",
        title: "Reputation Summary",
        content: `${this.explainSentiment(list)} ${this.explainReputationChange(list)}`,
        confidence: sampleConfidence,
        relatedData: ["mentions", "sentimentTimeline"],
        generatedAt: now,
      },
    ];

    const risks = this.detectRisks(list);
    if (risks.length > 0) {
      insights.push({
        id: "insight-risk",
        type: "risk",
        title: risks.length === 1 ? "Active Reputation Risk" : `${risks.length} Active Reputation Risks`,
        content: risks.join(" "),
        confidence: Math.round(Math.min(0.95, sampleConfidence + 0.05) * 100) / 100,
        relatedData: ["crisisAlerts"],
        generatedAt: now,
      });
    }

    const opportunities = this.detectOpportunities(list);
    if (opportunities.length > 0) {
      insights.push({
        id: "insight-opportunity",
        type: "opportunity",
        title: "Growth Opportunity",
        content: opportunities.join(" "),
        confidence: sampleConfidence,
        relatedData: ["keywordCloud"],
        generatedAt: now,
      });
    }

    const actions = this.recommendActions(list);
    if (actions.length > 0) {
      insights.push({
        id: "insight-recommendation",
        type: "recommendation",
        title: "Recommended Next Steps",
        content: actions.join(" "),
        confidence: sampleConfidence,
        relatedData: ["mentions"],
        generatedAt: now,
      });
    }

    return insights;
  }
}

export const reputationPlatformAPI = new ReputationPlatformAPI();
