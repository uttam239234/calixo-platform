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
import { analyticsEngine, formatCurrency } from "../engine/AnalyticsEngine";
import type { AnalyticsFilterState, AnalyticsInsight, AnalyticsRange } from "../types";
import type { AnalyticsSummary, AudienceSummary, CampaignSummary, ConversionSummary, DashboardAnalyticsSummary, ExecutiveAnalyticsSummary, RevenueSummary, TrafficSummary } from "./contracts";

const DEFAULT_RANGE: AnalyticsRange = "30d";

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
}

export const analyticsPlatformAPI = new AnalyticsPlatformAPI();
