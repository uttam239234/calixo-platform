/**
 * Calixo Platform - Ads Platform API
 *
 * The ONE sanctioned facade for Ads Manager data — mirrors `AnalyticsPlatformAPI`.
 * `useCampaigns()` and every ads component should go through this, never `adsEngine` directly.
 */

import { analyticsPlatformAPI } from "@/core/analytics";
import type { AnalyticsChannel, AnalyticsRange } from "@/core/analytics";
import { entitlementPlatformAPI } from "@/core/platform/commercial/EntitlementPlatformAPI";
import { linearForecast, type ForecastPoint } from "@/core/platform/forecast/linearForecast";
import { getLastAdsConnectorSyncResult } from "../connectors/AdsConnectorAdapter";
import { adsEngine, computeAdsBudget, computeAdsPerformanceSummary, computeAdsPlatforms } from "../engine/AdsEngine";
import { adsRecommendationRegistry } from "../registry/AdsRecommendationRegistry";
import { ADS_ORGANIZATION_ID } from "../tenant/AdsTenantDefaults";
import type {
  AdsActionCenterItem,
  AdsActionCenterCategory,
  AdsBudget,
  AdsHealthScore,
  AdsHealthSignal,
  AdsPerformanceSummary,
  AdsPlatform,
  AdsRecommendation,
  Campaign,
  CampaignAction,
  CampaignFilterState,
  CampaignSortKey,
  RecommendationStatus,
  SortDirection,
} from "../types";

/** Only the ad platforms with a genuine Analytics channel equivalent — Microsoft/TikTok/Pinterest have no channel row to cross-reference. */
const AD_PLATFORM_TO_ANALYTICS_CHANNEL: Record<string, AnalyticsChannel> = {
  google: "Google Ads",
  meta: "Meta",
  linkedin: "LinkedIn",
};

function scoreStatus(score: number): "strength" | "risk" | "neutral" {
  return score >= 75 ? "strength" : score < 50 ? "risk" : "neutral";
}

export class AdsPlatformAPI {
  listCampaigns(): Campaign[] {
    return adsEngine.list();
  }

  getCampaign(id: string): Campaign | undefined {
    return adsEngine.get(id);
  }

  createCampaign(campaign: Campaign): Campaign {
    return adsEngine.create(campaign);
  }

  updateCampaign(id: string, partial: Partial<Campaign>): Campaign | undefined {
    return adsEngine.update(id, partial);
  }

  applyCampaignAction(ids: string[], action: CampaignAction): Campaign[] {
    return adsEngine.applyAction(ids, action);
  }

  filterCampaigns(query: string, filters: CampaignFilterState, platformNames: Record<string, string>): Campaign[] {
    return adsEngine.filter(query, filters, platformNames);
  }

  sortCampaigns(campaigns: Campaign[], key: CampaignSortKey, direction: SortDirection): Campaign[] {
    return adsEngine.sort(campaigns, key, direction);
  }

  /** Computed from `campaigns` when a caller supplies its own snapshot (e.g. a React memo dependency); falls back to the live `adsEngine` singleton otherwise. */
  getPlatforms(campaigns?: Campaign[]): AdsPlatform[] {
    return computeAdsPlatforms(campaigns ?? adsEngine.list());
  }

  getBudget(campaigns?: Campaign[]): AdsBudget {
    return computeAdsBudget(campaigns ?? adsEngine.list());
  }

  getPerformanceSummary(campaigns?: Campaign[]): AdsPerformanceSummary {
    return computeAdsPerformanceSummary(campaigns ?? adsEngine.list());
  }

  /** Threshold-generated, recomputed from the given (or live) campaign array every call — see `AdsRecommendationRegistry`. */
  getRecommendations(campaigns?: Campaign[]): AdsRecommendation[] {
    return adsRecommendationRegistry.generate(campaigns ?? adsEngine.list());
  }

  applyRecommendation(id: string): void {
    adsRecommendationRegistry.setStatus(id, "applied");
  }

  dismissRecommendation(id: string): void {
    adsRecommendationRegistry.setStatus(id, "dismissed");
  }

  setRecommendationStatus(id: string, status: RecommendationStatus): void {
    adsRecommendationRegistry.setStatus(id, status);
  }

  /**
   * Ads Manager computes no attribution math itself — this cross-references a platform's spend
   * against Analytics' own channel performance (`AnalyticsPlatformAPI.getCampaignSummary()`) by
   * matching platform name to Analytics channel. `null` when the platform has no Analytics
   * channel equivalent (Microsoft/TikTok/Pinterest) or Analytics has no data for it yet — an
   * honest gap, not a fabricated number.
   */
  getAttributionNote(platformId: string, range: AnalyticsRange = "30d"): string | null {
    const channel = AD_PLATFORM_TO_ANALYTICS_CHANNEL[platformId];
    if (!channel) return null;
    const { channels } = analyticsPlatformAPI.getCampaignSummary(range);
    const row = channels.find(c => c.channel === channel);
    if (!row) return null;
    return `Analytics attributes ${row.revenue} in revenue to ${channel} this period at ${row.roas} ROAS — channel health is ${row.status.toLowerCase()}.`;
  }

  /**
   * A weighted composite of five already-real signals — never a new computation invented for
   * this method, just this method's own combining formula. Mirrors `AnalyticsPlatformAPI.getHealthScore()`.
   */
  getHealthScore(campaigns?: Campaign[]): AdsHealthScore {
    const list = campaigns ?? adsEngine.list();
    const running = list.filter(c => c.status === "Running");
    const budget = computeAdsBudget(list);
    const platforms = computeAdsPlatforms(list);
    const openRecommendations = adsRecommendationRegistry.generate(list).filter(r => r.status === "new");

    const pacingRatio = budget.total > 0 ? budget.spent / budget.total : 0;
    const pacingScore = pacingRatio > 0.95 ? 40 : pacingRatio >= 0.6 ? 90 : 60;

    const healthyRoasCount = running.filter(c => c.roas >= 3).length;
    const performanceScore = running.length > 0 ? (healthyRoasCount / running.length) * 100 : 70;

    const connectedCount = platforms.filter(p => p.status === "Connected").length;
    const connectorScore = platforms.length > 0 ? (connectedCount / platforms.length) * 100 : 70;

    const avgQuality = running.length > 0 ? running.reduce((sum, c) => sum + c.qualityScore, 0) / running.length : 7;
    const creativeScore = Math.min(100, (avgQuality / 10) * 100);

    const backlogScore = Math.max(20, 100 - openRecommendations.length * 20);

    const breakdown: AdsHealthSignal[] = [
      {
        key: "budgetPacing",
        label: "Budget Pacing",
        weight: 0.2,
        score: pacingScore,
        status: scoreStatus(pacingScore),
        detail: `${Math.round(pacingRatio * 100)}% of ${budget.period}'s budget spent.`,
      },
      {
        key: "campaignPerformance",
        label: "Campaign Performance",
        weight: 0.3,
        score: performanceScore,
        status: scoreStatus(performanceScore),
        detail: `${healthyRoasCount} of ${running.length} running campaign${running.length === 1 ? "" : "s"} at 3x+ ROAS.`,
      },
      {
        key: "connectorHealth",
        label: "Platform Connector Health",
        weight: 0.2,
        score: connectorScore,
        status: scoreStatus(connectorScore),
        detail: `${connectedCount} of ${platforms.length} ad platforms connected.`,
      },
      {
        key: "creativeFreshness",
        label: "Creative Freshness",
        weight: 0.15,
        score: creativeScore,
        status: scoreStatus(creativeScore),
        detail: `Average creative quality score ${avgQuality.toFixed(1)}/10.`,
      },
      {
        key: "optimizationBacklog",
        label: "Optimization Backlog",
        weight: 0.15,
        score: backlogScore,
        status: scoreStatus(backlogScore),
        detail: `${openRecommendations.length} open optimization recommendation${openRecommendations.length === 1 ? "" : "s"}.`,
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
   * The unified Ads Action & Insight Center — consolidates budget risk/creative fatigue/
   * optimization opportunities (from the real recommendation registry), attribution (B8), data
   * quality (connector sync state), and entitlement warnings into one typed list instead of
   * several near-duplicate widgets.
   */
  getActionCenterItems(campaigns?: Campaign[], range: AnalyticsRange = "30d", organizationId: string = ADS_ORGANIZATION_ID): AdsActionCenterItem[] {
    const list = campaigns ?? adsEngine.list();
    const items: AdsActionCenterItem[] = [];

    for (const rec of this.getRecommendations(list).filter(r => r.status === "new")) {
      const category: AdsActionCenterCategory = rec.category === "Budget" ? "budget-risk" : rec.category === "Creative" ? "creative-fatigue" : "opportunity";
      items.push({
        id: rec.id,
        title: rec.title,
        description: rec.description,
        severity: rec.impact === "High" ? "high" : rec.impact === "Medium" ? "medium" : "low",
        category,
        actionLabel: "Review",
        target: "recommendation-panel",
      });
    }

    const platforms = computeAdsPlatforms(list);
    const topAttributedPlatform = [...platforms].filter(p => AD_PLATFORM_TO_ANALYTICS_CHANNEL[p.id]).sort((a, b) => b.spend - a.spend)[0];
    const attributionNote = topAttributedPlatform ? this.getAttributionNote(topAttributedPlatform.id, range) : null;
    if (topAttributedPlatform && attributionNote) {
      items.push({
        id: `attribution-${topAttributedPlatform.id}`,
        title: `${topAttributedPlatform.name} attribution`,
        description: attributionNote,
        severity: "low",
        category: "attribution",
        actionLabel: "View channels",
        target: "/dashboard/analytics",
        isExternalRoute: true,
      });
    }

    const syncResult = getLastAdsConnectorSyncResult();
    if (!syncResult || syncResult.connectedPlatformIds.length === 0) {
      items.push({
        id: "data-quality-no-connectors",
        title: "No ad platforms connected",
        description: "Ads Manager is showing demo data. Connect Google Ads, Meta Ads, or LinkedIn to replace it with real performance data.",
        severity: "medium",
        category: "data-quality",
        actionLabel: "Connect a platform",
        target: "/dashboard/settings",
        isExternalRoute: true,
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
  // AI Ads surface — every method below is deterministic/rule-based
  // (threshold checks or plain-text templates over real computed numbers,
  // or linear trend extrapolation via the shared `linearForecast`). None
  // of this is ML or LLM-generated — the same "real, computable,
  // not-yet-wired-to-an-LLM" pattern used by `AnalyticsPlatformAPI`.
  // ---------------------------------------------------------------------

  /** Rule-based natural-language explanation of spend. */
  explainSpend(campaigns?: Campaign[]): string {
    const list = campaigns ?? adsEngine.list();
    const performance = computeAdsPerformanceSummary(list);
    const direction = performance.spendChange > 0.5 ? "increased" : performance.spendChange < -0.5 ? "decreased" : "stayed flat";
    return `Spend has ${direction} ${Math.abs(performance.spendChange).toFixed(1)}% vs. the prior period, reaching $${performance.spend.toLocaleString()} across ${list.length} campaigns at ${performance.roas.toFixed(1)}x blended ROAS.`;
  }

  /** Rule-based natural-language explanation of ROAS spread across running campaigns. */
  explainRoas(campaigns?: Campaign[]): string {
    const list = campaigns ?? adsEngine.list();
    const running = list.filter(c => c.status === "Running");
    if (running.length === 0) return "No running campaigns to evaluate ROAS for.";
    const avgRoas = running.reduce((sum, c) => sum + c.roas, 0) / running.length;
    const best = [...running].sort((a, b) => b.roas - a.roas)[0];
    const worst = [...running].sort((a, b) => a.roas - b.roas)[0];
    return `Running campaigns average ${avgRoas.toFixed(1)}x ROAS. "${best.name}" leads at ${best.roas.toFixed(1)}x, while "${worst.name}" trails at ${worst.roas.toFixed(1)}x.`;
  }

  /** Rule-based natural-language explanation of CPA spread across running campaigns. */
  explainCpa(campaigns?: Campaign[]): string {
    const list = campaigns ?? adsEngine.list();
    const running = list.filter(c => c.status === "Running");
    if (running.length === 0) return "No running campaigns to evaluate CPA for.";
    const avgCpa = running.reduce((sum, c) => sum + c.cpa, 0) / running.length;
    const worst = [...running].sort((a, b) => b.cpa - a.cpa)[0];
    const premium = avgCpa > 0 ? ((worst.cpa - avgCpa) / avgCpa) * 100 : 0;
    return `Average cost per conversion across running campaigns is $${avgCpa.toFixed(2)}. "${worst.name}" is the most expensive at $${worst.cpa.toFixed(2)} (${premium.toFixed(0)}% above average).`;
  }

  /**
   * Linear trend extrapolation over a real series — cumulative spend by campaign creation date.
   * Campaigns carry lifetime totals rather than a daily fact table (unlike Analytics), so this
   * buckets real campaign spend by real `createdAt` dates rather than fabricating a daily series.
   */
  forecastSpend(daysAhead = 7, campaigns?: Campaign[]): ForecastPoint[] {
    return linearForecast(this.cumulativeSeriesByCreatedAt(campaigns ?? adsEngine.list(), "spend"), daysAhead);
  }

  /** Same real-series approach as `forecastSpend()`, applied to revenue. */
  forecastRevenue(daysAhead = 7, campaigns?: Campaign[]): ForecastPoint[] {
    return linearForecast(this.cumulativeSeriesByCreatedAt(campaigns ?? adsEngine.list(), "revenue"), daysAhead);
  }

  private cumulativeSeriesByCreatedAt(campaigns: Campaign[], key: "spend" | "revenue"): number[] {
    const byDate = new Map<string, number>();
    for (const c of campaigns) byDate.set(c.createdAt, (byDate.get(c.createdAt) ?? 0) + c[key]);
    let cumulative = 0;
    return [...byDate.keys()].sort().map(date => (cumulative += byDate.get(date)!));
  }

  /** Threshold-based creative fatigue — running campaigns with a below-average quality score. */
  detectCreativeFatigue(campaigns?: Campaign[]): string[] {
    const list = campaigns ?? adsEngine.list();
    const running = list.filter(c => c.status === "Running");
    return running.filter(c => c.qualityScore <= 6).map(c => `"${c.name}" has a quality score of ${c.qualityScore}/10 — consider refreshing its creative assets.`);
  }

  /** Threshold-based budget risk — running campaigns close to or past their budget cap. */
  identifyBudgetRisks(campaigns?: Campaign[]): string[] {
    const list = campaigns ?? adsEngine.list();
    const running = list.filter(c => c.status === "Running");
    return running.filter(c => c.budget > 0 && c.spend / c.budget >= 0.9).map(c => `"${c.name}" has spent ${Math.round((c.spend / c.budget) * 100)}% of its budget and may pause delivery soon.`);
  }
}

export const adsPlatformAPI = new AdsPlatformAPI();
