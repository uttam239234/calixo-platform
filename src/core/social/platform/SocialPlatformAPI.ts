/**
 * Calixo Platform - Social Platform API
 *
 * The ONE sanctioned facade for Social Media data — mirrors `AdsPlatformAPI`.
 * `useSocial()`/`useSocialAnalytics()`/etc. and every social component should go through this,
 * never `socialEngine` directly.
 */

import { analyticsPlatformAPI } from "@/core/analytics";
import type { AnalyticsChannel, AnalyticsRange } from "@/core/analytics";
import { entitlementPlatformAPI } from "@/core/platform/commercial/EntitlementPlatformAPI";
import { linearForecast, type ForecastPoint } from "@/core/platform/forecast/linearForecast";
import { workflowPlatformAPI } from "@/core/workflow";
import { computeSocialOverview, computeSocialPlatformSummaries, socialEngine } from "../engine/SocialEngine";
import { socialRecommendationRegistry } from "../registry/SocialRecommendationRegistry";
import { SOCIAL_ORGANIZATION_ID } from "../tenant/SocialTenantDefaults";
import type {
  RecommendationStatus,
  SocialAccount,
  SocialActionCenterCategory,
  SocialActionCenterItem,
  SocialHealthScore,
  SocialHealthSignal,
  SocialOverviewSummary,
  SocialPlatform,
  SocialPlatformSummary,
  SocialPost,
  SocialPostStatus,
  SocialRecommendation,
} from "../types";

/** Only the platforms with a genuine Analytics channel equivalent — Meta owns both Facebook and Instagram; X/TikTok/YouTube/Threads/Pinterest have no channel row to cross-reference. */
const SOCIAL_PLATFORM_TO_ANALYTICS_CHANNEL: Partial<Record<SocialPlatform, AnalyticsChannel>> = {
  Facebook: "Meta",
  Instagram: "Meta",
  LinkedIn: "LinkedIn",
};

function scoreStatus(score: number): "strength" | "risk" | "neutral" {
  return score >= 75 ? "strength" : score < 50 ? "risk" : "neutral";
}

export class SocialPlatformAPI {
  listAccounts(): SocialAccount[] {
    return socialEngine.listAccounts();
  }

  getAccount(id: string): SocialAccount | undefined {
    return socialEngine.getAccount(id);
  }

  updateAccount(id: string, partial: Partial<SocialAccount>): SocialAccount | undefined {
    return socialEngine.updateAccount(id, partial);
  }

  listPosts(): SocialPost[] {
    return socialEngine.listPosts();
  }

  getPost(id: string): SocialPost | undefined {
    return socialEngine.getPost(id);
  }

  createPost(post: SocialPost): SocialPost {
    return socialEngine.createPost(post);
  }

  createPosts(posts: SocialPost[]): SocialPost[] {
    return socialEngine.createPosts(posts);
  }

  updatePost(id: string, partial: Partial<SocialPost>): SocialPost | undefined {
    return socialEngine.updatePost(id, partial);
  }

  duplicatePost(id: string): SocialPost | undefined {
    return socialEngine.duplicatePost(id);
  }

  deletePost(id: string): void {
    socialEngine.deletePost(id);
  }

  deletePosts(ids: string[]): void {
    socialEngine.deletePosts(ids);
  }

  updatePostStatus(id: string, status: SocialPostStatus): SocialPost | undefined {
    return socialEngine.updatePostStatus(id, status);
  }

  bulkUpdateStatus(ids: string[], status: SocialPostStatus): SocialPost[] {
    return socialEngine.bulkUpdateStatus(ids, status);
  }

  /** Computed from `accounts` when a caller supplies its own snapshot (e.g. a React memo dependency); falls back to the live `socialEngine` singleton otherwise. */
  getPlatformSummaries(accounts?: SocialAccount[]): SocialPlatformSummary[] {
    return computeSocialPlatformSummaries(accounts ?? socialEngine.listAccounts());
  }

  /** The single source of truth for "our brand" totals — see `computeSocialOverview()`'s header comment. */
  getOverview(accounts?: SocialAccount[]): SocialOverviewSummary {
    return computeSocialOverview(accounts ?? socialEngine.listAccounts());
  }

  /** Threshold-generated, recomputed from the given (or live) account/post arrays every call — see `SocialRecommendationRegistry`. */
  getRecommendations(accounts?: SocialAccount[], posts?: SocialPost[]): SocialRecommendation[] {
    return socialRecommendationRegistry.generate(accounts ?? socialEngine.listAccounts(), posts ?? socialEngine.listPosts());
  }

  applyRecommendation(id: string): void {
    socialRecommendationRegistry.setStatus(id, "applied");
  }

  dismissRecommendation(id: string): void {
    socialRecommendationRegistry.setStatus(id, "dismissed");
  }

  setRecommendationStatus(id: string, status: RecommendationStatus): void {
    socialRecommendationRegistry.setStatus(id, status);
  }

  /**
   * Social Media computes no attribution math itself — this cross-references a platform's
   * activity against Analytics' own channel performance (`AnalyticsPlatformAPI.getCampaignSummary()`)
   * by matching platform name to Analytics channel (Meta owns both Facebook and Instagram).
   * `null` when the platform has no Analytics channel equivalent (X/TikTok/YouTube/Threads/
   * Pinterest) or Analytics has no data for it yet — an honest gap, not a fabricated number.
   */
  getAttributionNote(platform: SocialPlatform, range: AnalyticsRange = "30d"): string | null {
    const channel = SOCIAL_PLATFORM_TO_ANALYTICS_CHANNEL[platform];
    if (!channel) return null;
    const { channels } = analyticsPlatformAPI.getCampaignSummary(range);
    const row = channels.find(c => c.channel === channel);
    if (!row) return null;
    return `Analytics attributes ${row.revenue} in revenue to ${channel} this period at ${row.roas} ROAS — channel health is ${row.status.toLowerCase()}.`;
  }

  /**
   * A weighted composite of five already-real signals — never a new computation invented for
   * this method, just this method's own combining formula. Mirrors `AdsPlatformAPI.getHealthScore()`.
   * Computed only from data `SocialPlatformAPI` genuinely has access to (accounts, posts, and the
   * real cross-module Workflow Platform summary) — Calendar events live in page-local React
   * state, not a shared engine, so they can't feed a score computed here.
   */
  getHealthScore(accounts?: SocialAccount[], posts?: SocialPost[]): SocialHealthScore {
    const accountList = accounts ?? socialEngine.listAccounts();
    const postList = posts ?? socialEngine.listPosts();
    const connected = accountList.filter(a => a.status === "Connected");

    const publishingScore = accountList.length > 0 ? (connected.length / accountList.length) * 100 : 70;

    const draftPosts = postList.filter(p => p.status === "Draft");
    const queueScore = postList.length > 0 ? Math.max(20, 100 - (draftPosts.length / postList.length) * 100) : 70;

    const workflowSummary = workflowPlatformAPI.getWorkflowSummary();
    const backlogScore = Math.max(20, 100 - workflowSummary.pending * 10);

    const avgEngagementRate = connected.length > 0 ? connected.reduce((sum, a) => sum + a.engagementRate, 0) / connected.length : 0;
    const growthScore = Math.min(100, (avgEngagementRate / 6) * 100);

    const publishedPosts = postList.filter(p => p.status === "Published" && p.reach > 0);
    const avgEngagementRatio = publishedPosts.length > 0 ? publishedPosts.reduce((sum, p) => sum + (p.likes + p.comments + p.shares) / p.reach, 0) / publishedPosts.length : 0;
    const engagementScore = Math.min(100, avgEngagementRatio * 1000);

    const breakdown: SocialHealthSignal[] = [
      {
        key: "publishing",
        label: "Publishing Health",
        weight: 0.2,
        score: publishingScore,
        status: scoreStatus(publishingScore),
        detail: `${connected.length} of ${accountList.length} accounts connected.`,
      },
      {
        key: "queue",
        label: "Queue Health",
        weight: 0.2,
        score: queueScore,
        status: scoreStatus(queueScore),
        detail: `${draftPosts.length} of ${postList.length} post${postList.length === 1 ? "" : "s"} still in Draft.`,
      },
      {
        key: "approvalBacklog",
        label: "Approval Backlog",
        weight: 0.2,
        score: backlogScore,
        status: scoreStatus(backlogScore),
        detail: `${workflowSummary.pending} item${workflowSummary.pending === 1 ? "" : "s"} pending review workspace-wide.`,
      },
      {
        key: "growth",
        label: "Growth Health",
        weight: 0.2,
        score: growthScore,
        status: scoreStatus(growthScore),
        detail: `Average engagement rate ${avgEngagementRate.toFixed(1)}% across connected accounts.`,
      },
      {
        key: "engagement",
        label: "Engagement Health",
        weight: 0.2,
        score: engagementScore,
        status: scoreStatus(engagementScore),
        detail: publishedPosts.length > 0 ? `${(avgEngagementRatio * 100).toFixed(1)}% average engagement-to-reach ratio on published posts.` : "No published posts with reach data yet.",
      },
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
   * The unified Social Action & Insight Center — consolidates optimization recommendations (from
   * the real recommendation registry), attribution (C10), approval backlog (real cross-module
   * Workflow Platform read), and data-quality/entitlement warnings into one typed list instead of
   * several near-duplicate "centers".
   */
  getActionCenterItems(accounts?: SocialAccount[], posts?: SocialPost[], range: AnalyticsRange = "30d", organizationId: string = SOCIAL_ORGANIZATION_ID): SocialActionCenterItem[] {
    const accountList = accounts ?? socialEngine.listAccounts();
    const postList = posts ?? socialEngine.listPosts();
    const items: SocialActionCenterItem[] = [];

    for (const rec of this.getRecommendations(accountList, postList).filter(r => r.status === "new")) {
      const category: SocialActionCenterCategory = rec.category === "Growth" ? "risk" : "opportunity";
      items.push({
        id: rec.id,
        title: rec.title,
        description: rec.description,
        severity: rec.impact === "High" ? "high" : rec.impact === "Medium" ? "medium" : "low",
        category,
        actionLabel: "Review",
        target: "ai-recommendations",
      });
    }

    const topAttributedAccount = [...accountList].filter(a => SOCIAL_PLATFORM_TO_ANALYTICS_CHANNEL[a.platform]).sort((a, b) => b.reach - a.reach)[0];
    const attributionNote = topAttributedAccount ? this.getAttributionNote(topAttributedAccount.platform, range) : null;
    if (topAttributedAccount && attributionNote) {
      items.push({
        id: `attribution-${topAttributedAccount.id}`,
        title: `${topAttributedAccount.platform} attribution`,
        description: attributionNote,
        severity: "low",
        category: "attribution",
        actionLabel: "View channels",
        target: "/dashboard/analytics",
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

    const disconnected = accountList.filter(a => a.status !== "Connected");
    if (disconnected.length > 0) {
      items.push({
        id: "data-quality-disconnected-accounts",
        title: `${disconnected.length} account${disconnected.length === 1 ? "" : "s"} not connected`,
        description: `${disconnected.map(a => a.platform).join(", ")} ${disconnected.length === 1 ? "is" : "are"} disconnected or needs attention — publishing and performance tracking are paused.`,
        severity: "medium",
        category: "data-quality",
        actionLabel: "Reconnect",
        target: "connected-accounts",
      });
    }

    const aiCreditsRemaining = entitlementPlatformAPI.remaining(organizationId, "aiCreditsUsed");
    const aiCreditsLimit = entitlementPlatformAPI.limit(organizationId, "aiCreditsUsed");
    if (aiCreditsLimit && aiCreditsLimit > 0 && aiCreditsRemaining / aiCreditsLimit <= 0.15) {
      items.push({
        id: "entitlement-ai-credits-low",
        title: "AI credits running low",
        description: `${aiCreditsRemaining} of ${aiCreditsLimit} AI credits remaining this period.`,
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
  // AI Social surface — every method below is deterministic/rule-based
  // (threshold checks, plain-text templates over real computed numbers, or
  // linear trend extrapolation via the shared `linearForecast`). None of
  // this is ML or LLM-generated — the same "real, computable,
  // not-yet-wired-to-an-LLM" pattern used by `AnalyticsPlatformAPI`/`AdsPlatformAPI`.
  // ---------------------------------------------------------------------

  /** Rule-based natural-language explanation of total reach. */
  explainReach(accounts?: SocialAccount[]): string {
    const overview = this.getOverview(accounts);
    return `Total reach across ${overview.totalAccounts} account${overview.totalAccounts === 1 ? "" : "s"} is ${overview.totalReach.toLocaleString()}, with ${overview.connectedAccounts} account${overview.connectedAccounts === 1 ? "" : "s"} currently connected.`;
  }

  /** Rule-based natural-language explanation of engagement spread across connected accounts. */
  explainEngagement(accounts?: SocialAccount[]): string {
    const connected = (accounts ?? socialEngine.listAccounts()).filter(a => a.status === "Connected");
    if (connected.length === 0) return "No connected accounts to evaluate engagement for.";
    const avg = connected.reduce((sum, a) => sum + a.engagementRate, 0) / connected.length;
    const best = [...connected].sort((a, b) => b.engagementRate - a.engagementRate)[0];
    const worst = [...connected].sort((a, b) => a.engagementRate - b.engagementRate)[0];
    return `Connected accounts average ${avg.toFixed(1)}% engagement. ${best.platform} leads at ${best.engagementRate.toFixed(1)}%, while ${worst.platform} trails at ${worst.engagementRate.toFixed(1)}%.`;
  }

  /** Rule-based natural-language explanation of follower growth. */
  explainGrowth(accounts?: SocialAccount[]): string {
    const overview = this.getOverview(accounts);
    return `Total followers across all accounts: ${overview.totalFollowers.toLocaleString()}, averaging ${overview.avgEngagementRate.toFixed(1)}% engagement rate.`;
  }

  /** Threshold-based — recommends the connected account with the highest engagement rate as the priority posting slot. */
  suggestPostingTime(accounts?: SocialAccount[]): string {
    const top = [...(accounts ?? socialEngine.listAccounts())].filter(a => a.status === "Connected").sort((a, b) => b.engagementRate - a.engagementRate)[0];
    if (!top) return "Connect an account to get a posting-time recommendation.";
    return `${top.platform} has your highest engagement rate (${top.engagementRate.toFixed(1)}%) — prioritize posting there during peak hours this week.`;
  }

  /** Deterministic keyword extraction from post content — not a trained hashtag model. */
  suggestHashtags(content: string): string[] {
    const words = content
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(word => word.length > 4);
    return [...new Set(words)].slice(0, 5).map(word => `#${word.charAt(0).toUpperCase()}${word.slice(1)}`);
  }

  /** Threshold-based — published posts whose engagement-to-reach ratio trails the account average by 40%+. */
  detectContentFatigue(posts?: SocialPost[]): string[] {
    const published = (posts ?? socialEngine.listPosts()).filter(p => p.status === "Published" && p.reach > 0);
    if (published.length === 0) return [];
    const avgRatio = published.reduce((sum, p) => sum + (p.likes + p.comments + p.shares) / p.reach, 0) / published.length;
    return published.filter(p => (p.likes + p.comments + p.shares) / p.reach < avgRatio * 0.6).map(p => `"${p.content.slice(0, 60)}${p.content.length > 60 ? "…" : ""}" on ${p.platform} is engaging well below your account average — consider refreshing this content format.`);
  }

  /** Threshold-based — connected accounts whose engagement rate trails the account average by 40%+. */
  detectAudienceFatigue(accounts?: SocialAccount[]): string[] {
    const connected = (accounts ?? socialEngine.listAccounts()).filter(a => a.status === "Connected");
    if (connected.length === 0) return [];
    const avg = connected.reduce((sum, a) => sum + a.engagementRate, 0) / connected.length;
    return connected.filter(a => a.engagementRate < avg * 0.6).map(a => `${a.platform}'s engagement rate (${a.engagementRate.toFixed(1)}%) is well below your account average — a sign of audience fatigue.`);
  }

  /** Every open recommendation, re-framed as a recommended action — recommendations ARE the recommendation engine's output, same pattern as `AnalyticsPlatformAPI.recommendOptimizations()`. */
  recommendActions(accounts?: SocialAccount[], posts?: SocialPost[]): SocialRecommendation[] {
    return this.getRecommendations(accounts, posts).filter(r => r.status === "new");
  }

  /**
   * Linear trend extrapolation over a real series — the caller supplies it (e.g.
   * `SocialAnalyticsProvider`'s real 90-day daily series) since that data lives in the Analytics
   * feature layer, not `core/social`; this keeps the platform API's own dependency direction
   * clean (core doesn't reach into a feature's mock data).
   */
  forecastEngagement(series: number[], daysAhead = 7): ForecastPoint[] {
    return linearForecast(series, daysAhead);
  }

  /** Same real-series approach as `forecastEngagement()`, applied to a follower/growth series. */
  forecastGrowth(series: number[], daysAhead = 7): ForecastPoint[] {
    return linearForecast(series, daysAhead);
  }
}

export const socialPlatformAPI = new SocialPlatformAPI();
