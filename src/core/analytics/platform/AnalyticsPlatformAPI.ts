/**
 * Calixo Platform - Analytics Platform API
 *
 * The ONLY sanctioned way another module reads Analytics data. Wraps
 * `AnalyticsEngine` and returns the standardized contracts from
 * `./contracts` — no module should import `analyticsEngine` directly
 * going forward (Dashboard's `DashboardEngine` has been redirected here
 * as the reference consumer). Implements every contract that today's
 * fact table can genuinely back; reserved contracts (SEO/Ads/Social/
 * Brand/Content/Workflow/Notifications — see contracts.ts) are not
 * implemented here yet since no real data source feeds them.
 */

import { linearForecast, type ForecastPoint } from "@/core/platform/forecast/linearForecast";
import { entitlementPlatformAPI } from "@/core/platform/commercial/EntitlementPlatformAPI";
import { analyticsEngine, formatCurrency } from "../engine/AnalyticsEngine";
import { getLastConnectorSyncResult } from "../connectors/AnalyticsConnectorFactsAdapter";
import { ANALYTICS_ORGANIZATION_ID } from "../tenant/AnalyticsTenantDefaults";
import type { AnalyticsActionCenterItem, AnalyticsFilterState, AnalyticsHealthScore, AnalyticsHealthSignal, AnalyticsInsight, AnalyticsPeriodComparison, AnalyticsRange } from "../types";
import type { AnalyticsSummary, AudienceSummary, CampaignSummary, ConversionSummary, DashboardAnalyticsSummary, ExecutiveAnalyticsSummary, RevenueSummary, TrafficSummary } from "./contracts";

const DEFAULT_RANGE: AnalyticsRange = "30d";

function scoreStatus(score: number): "strength" | "risk" | "neutral" {
  return score >= 75 ? "strength" : score < 50 ? "risk" : "neutral";
}

/** Reverses `formatCurrency()`'s `$1.2M`/`$450K`/`$900` shapes back into a comparable number — a plain numeric-strip would compare "1.2" (from $1.2M) below "450" (from $450K), which is wrong. */
function parseFormattedCurrency(value: string): number {
  const match = value.match(/^\$?([\d.]+)([KM]?)$/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  if (match[2] === "M") return num * 1_000_000;
  if (match[2] === "K") return num * 1_000;
  return num;
}

export class AnalyticsPlatformAPI {
  getAnalyticsSummary(range: AnalyticsRange = DEFAULT_RANGE, filters: AnalyticsFilterState = {}): AnalyticsSummary {
    return {
      kpis: analyticsEngine.getSummaryMetrics(range, filters),
      insights: analyticsEngine.getInsights(),
      generatedAt: new Date().toISOString(),
    };
  }

  getExecutiveSummary(range: AnalyticsRange = DEFAULT_RANGE, filters: AnalyticsFilterState = {}): ExecutiveAnalyticsSummary {
    return {
      kpis: analyticsEngine.getSummaryMetrics(range, filters),
      revenueTrend: analyticsEngine.getRevenueSeries(range, filters),
      topInsights: analyticsEngine.getInsights().filter(i => i.status === "new").slice(0, 3),
    };
  }

  getRevenueSummary(range: AnalyticsRange = DEFAULT_RANGE, filters: AnalyticsFilterState = {}): RevenueSummary {
    const raw = analyticsEngine.getRawSummary(range, filters);
    return {
      totalRevenue: raw.revenue,
      totalSpend: raw.spend,
      roas: raw.spend > 0 ? raw.revenue / raw.spend : 0,
      series: analyticsEngine.getRevenueSeries(range, filters),
    };
  }

  getTrafficSummary(range: AnalyticsRange = DEFAULT_RANGE, filters: AnalyticsFilterState = {}): TrafficSummary {
    return { metrics: analyticsEngine.getTrafficMetrics(range, filters) };
  }

  getAudienceSummary(range: AnalyticsRange = DEFAULT_RANGE, filters: AnalyticsFilterState = {}): AudienceSummary {
    return {
      segments: analyticsEngine.getAudienceInsights(range, filters),
      geo: analyticsEngine.getGeoPerformance(range, filters),
      regionCount: analyticsEngine.getRegionCount(range, filters),
    };
  }

  getConversionSummary(range: AnalyticsRange = DEFAULT_RANGE, filters: AnalyticsFilterState = {}): ConversionSummary {
    return { funnel: analyticsEngine.getConversionFunnel(range, filters) };
  }

  getCampaignSummary(range: AnalyticsRange = DEFAULT_RANGE, filters: AnalyticsFilterState = {}): CampaignSummary {
    return {
      campaigns: analyticsEngine.getCampaignPerformance(range, filters),
      channels: analyticsEngine.getChannelPerformance(range, filters),
    };
  }

  /** The exact shape Dashboard's landing page needs — replaces direct `analyticsEngine` calls in `DashboardEngine`. */
  getDashboardAnalyticsSummary(range: AnalyticsRange = DEFAULT_RANGE, filters: AnalyticsFilterState = {}): DashboardAnalyticsSummary {
    return {
      kpis: analyticsEngine.getSummaryMetrics(range, filters),
      revenueSeries: analyticsEngine.getRevenueSeries(range, filters),
      channels: analyticsEngine.getChannelPerformance(range, filters),
      insights: analyticsEngine.getInsights(),
    };
  }

  /**
   * Raw numeric totals (not display-formatted) for callers that compute
   * their own derived metrics — e.g. Dashboard's `GoalEngine` benchmarking
   * goal progress against real revenue/lead numbers. Still routed through
   * the platform API rather than importing `analyticsEngine` directly.
   */
  getRawSummary(range: AnalyticsRange = DEFAULT_RANGE, filters: AnalyticsFilterState = {}) {
    return analyticsEngine.getRawSummary(range, filters);
  }

  applyInsight(id: string) {
    return analyticsEngine.applyInsight(id);
  }

  dismissInsight(id: string) {
    return analyticsEngine.dismissInsight(id);
  }

  // ---------------------------------------------------------------------
  // AI Analytics surface — every method below is deterministic/rule-based
  // (threshold checks, linear trend extrapolation, or plain-text templates
  // over real computed numbers). None of this is ML or LLM-generated; it's
  // the same "real, computable, not-yet-wired-to-an-LLM" pattern every
  // module's AI skills use in this codebase.
  // ---------------------------------------------------------------------

  /** Rule-based natural-language explanation of the revenue trend. */
  explainRevenue(range: AnalyticsRange = DEFAULT_RANGE, filters: AnalyticsFilterState = {}): string {
    const raw = analyticsEngine.getRawSummary(range, filters);
    const change = raw.prevRevenue > 0 ? ((raw.revenue - raw.prevRevenue) / raw.prevRevenue) * 100 : 0;
    const direction = change > 0.5 ? "increased" : change < -0.5 ? "decreased" : "stayed flat";
    const roas = raw.spend > 0 ? raw.revenue / raw.spend : 0;
    return `Revenue ${direction} ${Math.abs(change).toFixed(1)}% vs. the prior period, reaching ${formatCurrency(raw.revenue)} on ${formatCurrency(raw.spend)} of spend (${roas.toFixed(1)}x ROAS).`;
  }

  /** Rule-based natural-language explanation of the traffic trend. */
  explainTraffic(range: AnalyticsRange = DEFAULT_RANGE, filters: AnalyticsFilterState = {}): string {
    const metrics = analyticsEngine.getTrafficMetrics(range, filters);
    const sessions = metrics.find(m => m.id === "sessions");
    const bounce = metrics.find(m => m.id === "bounce-rate");
    if (!sessions) return "No traffic data available for the selected range.";
    return `Sessions are at ${sessions.value} (${sessions.change} vs. prior period)${bounce ? `, with bounce rate ${bounce.tone === "negative" ? "worsening" : "improving"} to ${bounce.value}` : ""}.`;
  }

  /** Threshold-based risks — negative-tone KPIs and above-average funnel drop-off. */
  identifyRisks(range: AnalyticsRange = DEFAULT_RANGE, filters: AnalyticsFilterState = {}): string[] {
    const risks: string[] = [];
    for (const m of analyticsEngine.getSummaryMetrics(range, filters)) {
      if (m.tone === "negative") risks.push(`${m.label} moved ${m.change} vs. the prior period.`);
    }
    const funnel = analyticsEngine.getConversionFunnel(range, filters);
    for (let i = 1; i < funnel.length; i++) {
      const dropPct = funnel[i - 1].value > 0 ? ((funnel[i - 1].value - funnel[i].value) / funnel[i - 1].value) * 100 : 0;
      if (dropPct > 60) risks.push(`Large drop-off (${dropPct.toFixed(0)}%) between "${funnel[i - 1].stage}" and "${funnel[i].stage}".`);
    }
    return risks;
  }

  /** High-confidence, high-priority insights re-framed as opportunities. */
  identifyOpportunities(): AnalyticsInsight[] {
    return analyticsEngine.getInsights().filter(i => i.status === "new" && i.confidence >= 85);
  }

  /** Every open insight, framed as a recommended optimization — insights ARE the recommendation engine's output. */
  recommendOptimizations(): AnalyticsInsight[] {
    return analyticsEngine.getInsights().filter(i => i.status === "new");
  }

  /**
   * Diffs two independently-specified periods (e.g. two custom date
   * ranges from the header's date picker) — distinct from
   * `getSummaryMetrics()`'s built-in current-vs-immediately-prior
   * comparison, which only ever compares a range to its own auto-shifted
   * predecessor. Genuinely new: nothing in the engine let a caller
   * compare two arbitrary periods against each other before this.
   */
  comparePeriods(
    periodA: { range: AnalyticsRange; filters?: AnalyticsFilterState; label: string },
    periodB: { range: AnalyticsRange; filters?: AnalyticsFilterState; label: string }
  ): AnalyticsPeriodComparison {
    const a = analyticsEngine.getRawSummary(periodA.range, periodA.filters ?? {});
    const b = analyticsEngine.getRawSummary(periodB.range, periodB.filters ?? {});
    const pctDelta = (curr: number, prev: number) => (prev > 0 ? ((curr - prev) / prev) * 100 : curr > 0 ? 100 : 0);

    const deltas = {
      revenue: pctDelta(b.revenue, a.revenue),
      spend: pctDelta(b.spend, a.spend),
      leads: pctDelta(b.leads, a.leads),
      conversions: pctDelta(b.conversions, a.conversions),
      conversionRate: b.conversionRate - a.conversionRate,
    };
    const direction = deltas.revenue > 0.5 ? "grew" : deltas.revenue < -0.5 ? "declined" : "stayed flat";
    const summary = `Revenue ${direction} ${Math.abs(deltas.revenue).toFixed(1)}% from ${periodA.label} (${formatCurrency(a.revenue)}) to ${periodB.label} (${formatCurrency(b.revenue)}).`;

    return {
      periodA: { label: periodA.label, revenue: a.revenue, spend: a.spend, leads: a.leads, conversions: a.conversions, conversionRate: a.conversionRate },
      periodB: { label: periodB.label, revenue: b.revenue, spend: b.spend, leads: b.leads, conversions: b.conversions, conversionRate: b.conversionRate },
      deltas,
      summary,
    };
  }

  /** Linear trend extrapolation over the real revenue series — explicitly not a trained forecasting model. */
  forecastRevenue(days = 7, range: AnalyticsRange = DEFAULT_RANGE, filters: AnalyticsFilterState = {}): ForecastPoint[] {
    const series = analyticsEngine.getRevenueSeries(range, filters).map(p => p.revenue);
    return linearForecast(series, days);
  }

  /** Threshold-based anomaly flags — day-over-day swings beyond 2x the series' average step. */
  detectAnomalies(range: AnalyticsRange = DEFAULT_RANGE, filters: AnalyticsFilterState = {}): string[] {
    const series = analyticsEngine.getRevenueSeries(range, filters);
    if (series.length < 3) return [];
    const steps = series.slice(1).map((p, i) => Math.abs(p.revenue - series[i].revenue));
    const avgStep = steps.reduce((a, b) => a + b, 0) / steps.length;
    const anomalies: string[] = [];
    for (let i = 1; i < series.length; i++) {
      const delta = Math.abs(series[i].revenue - series[i - 1].revenue);
      if (avgStep > 0 && delta > avgStep * 2.5) {
        anomalies.push(`Unusual revenue swing on ${series[i].label}: ${formatCurrency(series[i].revenue)} vs. ${formatCurrency(series[i - 1].revenue)} the prior day.`);
      }
    }
    return anomalies;
  }

  /**
   * A weighted composite of five already-real signals — never a new
   * computation invented for this method, just this method's own
   * combining formula. Mirrors `DashboardEngine.getHealthScore()`'s
   * pattern.
   */
  getHealthScore(range: AnalyticsRange = DEFAULT_RANGE, filters: AnalyticsFilterState = {}): AnalyticsHealthScore {
    const raw = analyticsEngine.getRawSummary(range, filters);
    const revenueGrowth = raw.prevRevenue > 0 ? ((raw.revenue - raw.prevRevenue) / raw.prevRevenue) * 100 : 0;
    const revenueScore = revenueGrowth > 5 ? 90 : revenueGrowth > 0 ? 75 : revenueGrowth > -5 ? 55 : 30;

    const channels = analyticsEngine.getChannelPerformance(range, filters);
    const healthyChannels = channels.filter(c => c.status === "Healthy").length;
    const channelScore = channels.length > 0 ? (healthyChannels / channels.length) * 100 : 70;

    // Stage-to-stage retention across the funnel (excluding the terminal "Revenue" stage, whose `percent` is always 100 and isn't a real conversion ratio) — a healthy funnel retains a large share of each stage into the next.
    const funnel = analyticsEngine.getConversionFunnel(range, filters);
    const retentions: number[] = [];
    for (let i = 1; i < funnel.length - 1; i++) {
      if (funnel[i - 1].value > 0) retentions.push((funnel[i].value / funnel[i - 1].value) * 100);
    }
    const avgRetention = retentions.length > 0 ? retentions.reduce((a, b) => a + b, 0) / retentions.length : 70;
    const funnelScore = Math.min(100, avgRetention * 1.5);

    // Forecast confidence — inverse of the revenue series' coefficient of variation; a volatile series is a less trustworthy linear extrapolation.
    const series = analyticsEngine.getRevenueSeries(range, filters).map(p => p.revenue);
    const mean = series.length > 0 ? series.reduce((a, b) => a + b, 0) / series.length : 0;
    const variance = series.length > 0 ? series.reduce((a, b) => a + (b - mean) ** 2, 0) / series.length : 0;
    const coefficientOfVariation = mean > 0 ? Math.sqrt(variance) / mean : 1;
    const forecastScore = Math.max(20, 100 - coefficientOfVariation * 100);

    const syncResult = getLastConnectorSyncResult();
    const connectorScore = syncResult && syncResult.connectedProviders.length > 0 ? 95 : 60;

    const breakdown: AnalyticsHealthSignal[] = [
      {
        key: "revenue",
        label: "Revenue Growth",
        weight: 0.25,
        score: revenueScore,
        status: scoreStatus(revenueScore),
        detail: `Revenue ${revenueGrowth >= 0 ? "up" : "down"} ${Math.abs(revenueGrowth).toFixed(1)}% vs. the prior period.`,
      },
      {
        key: "channels",
        label: "Campaign Performance",
        weight: 0.2,
        score: channelScore,
        status: scoreStatus(channelScore),
        detail: `${healthyChannels} of ${channels.length} channel${channels.length === 1 ? "" : "s"} healthy.`,
      },
      {
        key: "funnel",
        label: "Conversion Funnel Health",
        weight: 0.2,
        score: funnelScore,
        status: scoreStatus(funnelScore),
        detail: `${avgRetention.toFixed(0)}% average stage-to-stage retention.`,
      },
      {
        key: "forecast",
        label: "Forecast Confidence",
        weight: 0.15,
        score: forecastScore,
        status: scoreStatus(forecastScore),
        detail: coefficientOfVariation < 0.3 ? "Revenue trend is stable." : "Revenue trend is volatile — forecasts are less certain.",
      },
      {
        key: "connectors",
        label: "Connector Data Freshness",
        weight: 0.2,
        score: connectorScore,
        status: scoreStatus(connectorScore),
        detail: syncResult && syncResult.connectedProviders.length > 0 ? `${syncResult.connectedProviders.length} connector${syncResult.connectedProviders.length === 1 ? "" : "s"} feeding live data.` : "No connectors feeding live data yet — showing demo data.",
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
   * The unified Insight & Action Center — consolidates risk/anomaly/
   * opportunity/data-quality/attribution into one typed list instead of
   * five near-duplicate widgets, sourced from methods that are already
   * real (`identifyRisks`/`detectAnomalies`/`identifyOpportunities`/
   * `getChannelPerformance`) plus one genuinely new lightweight
   * data-quality check over the real connector sync result.
   */
  getActionCenterItems(range: AnalyticsRange = DEFAULT_RANGE, filters: AnalyticsFilterState = {}, organizationId: string = ANALYTICS_ORGANIZATION_ID): AnalyticsActionCenterItem[] {
    const items: AnalyticsActionCenterItem[] = [];

    this.identifyRisks(range, filters)
      .slice(0, 3)
      .forEach((risk, i) => {
        items.push({ id: `risk-${i}`, title: "Performance risk", description: risk, severity: "high", category: "risk", kind: "incident", actionLabel: "View", target: "revenue-chart" });
      });

    this.detectAnomalies(range, filters)
      .slice(0, 2)
      .forEach((anomaly, i) => {
        items.push({ id: `anomaly-${i}`, title: "Revenue anomaly", description: anomaly, severity: "medium", category: "anomaly", kind: "incident", actionLabel: "View", target: "revenue-chart" });
      });

    this.identifyOpportunities()
      .slice(0, 3)
      .forEach(opportunity => {
        items.push({
          id: `opportunity-${opportunity.id}`,
          title: opportunity.title,
          description: opportunity.description,
          severity: opportunity.priority === "High" ? "high" : opportunity.priority === "Medium" ? "medium" : "low",
          category: "opportunity",
          kind: "action",
          actionLabel: "Review",
          target: "ai-insights",
        });
      });

    const channels = analyticsEngine.getChannelPerformance(range, filters);
    const topChannel = [...channels].sort((a, b) => parseFormattedCurrency(b.revenue) - parseFormattedCurrency(a.revenue)).at(0);
    if (topChannel) {
      items.push({
        id: "attribution-top-channel",
        title: `${topChannel.channel} is the top revenue driver`,
        description: `${topChannel.channel} generated ${topChannel.revenue} in revenue at ${topChannel.roas} ROAS this period — the largest single-channel contribution.`,
        severity: "low",
        category: "attribution",
        kind: "action",
        actionLabel: "View channels",
        target: "channel-performance",
      });
    }

    const syncResult = getLastConnectorSyncResult();
    if (!syncResult || syncResult.connectedProviders.length === 0) {
      items.push({
        id: "data-quality-no-connectors",
        title: "No connectors feeding live data",
        description: "Analytics is showing demo data. Connect Google Ads, Meta Ads, or LinkedIn to replace it with real performance data.",
        severity: "medium",
        category: "data-quality",
        kind: "action",
        actionLabel: "Connect a platform",
        target: "/dashboard/settings",
        isExternalRoute: true,
      });
    } else if (syncResult.unmappedOrDisconnectedProviders.length > 0) {
      items.push({
        id: "data-quality-partial-connectors",
        title: "Some connectors aren't feeding Analytics yet",
        description: `${syncResult.unmappedOrDisconnectedProviders.length} connected platform${syncResult.unmappedOrDisconnectedProviders.length === 1 ? " isn't" : "s aren't"} mapped to an Analytics channel yet or aren't connected.`,
        severity: "low",
        category: "data-quality",
        kind: "action",
        actionLabel: "Connect a platform",
        target: "/dashboard/settings",
        isExternalRoute: true,
      });
    }

    // `entitlementPlatformAPI` reused here (not just Commercial's own gate check) — a real entitlement warning belongs in the same unified list as risks/anomalies, not a separate surface.
    const aiCreditsRemaining = entitlementPlatformAPI.remaining(organizationId, "aiCreditsUsed");
    const aiCreditsLimit = entitlementPlatformAPI.limit(organizationId, "aiCreditsUsed");
    if (aiCreditsLimit && aiCreditsLimit > 0 && aiCreditsRemaining / aiCreditsLimit <= 0.15) {
      items.push({
        id: "entitlement-ai-credits-low",
        title: "AI credits running low",
        description: `${aiCreditsRemaining} of ${aiCreditsLimit} AI credits remaining this period.`,
        severity: "medium",
        category: "data-quality",
        kind: "action",
        actionLabel: "Review plan",
        target: "/dashboard/settings",
        isExternalRoute: true,
      });
    }

    return items;
  }
}

export const analyticsPlatformAPI = new AnalyticsPlatformAPI();
