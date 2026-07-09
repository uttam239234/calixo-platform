/**
 * Calixo Platform - Analytics Engine
 *
 * Every value this engine returns is COMPUTED from the injected fact
 * table at query time (filter → group → aggregate → derive), never
 * hand-authored per view. No persistence, no UI, no rendering — pure
 * data composition, matching the same shape as every other platform's
 * engine in this codebase.
 */

import { addDays, startOfDay } from "@/shared/utils/date";
import { generateAnalyticsFacts } from "../mock/generateAnalyticsFacts";
import type { AnalyticsMetricDefinition } from "../registry/AnalyticsMetricRegistry";
import type {
  AnalyticsAudienceSegment,
  AnalyticsCampaignRow,
  AnalyticsChannelRow,
  AnalyticsFact,
  AnalyticsFilterState,
  AnalyticsFunnelStage,
  AnalyticsGeoRow,
  AnalyticsInsight,
  AnalyticsRange,
  AnalyticsRevenuePoint,
  AnalyticsSnapshot,
  AnalyticsSummaryMetric,
  AnalyticsTrafficMetric,
  ChannelHealthStatus,
} from "../types";

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${Math.round(value)}`;
}

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${Math.round(value)}`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

function trendFor(change: number): "up" | "down" | "steady" {
  if (Math.abs(change) < 0.5) return "steady";
  return change > 0 ? "up" : "down";
}

const DEFAULT_INSIGHTS: AnalyticsInsight[] = [
  { id: "insight-budget", title: "Budget Optimization", description: "Shift 8% of spend from display to high-performing Meta retargeting.", priority: "High", confidence: 92, uplift: "+14%", status: "new" },
  { id: "insight-audience", title: "Best Audience", description: "Double down on buyers aged 25-34 who engage with productivity content.", priority: "Medium", confidence: 87, uplift: "+11%", status: "new" },
  { id: "insight-risk", title: "Campaign Risk", description: "Pause low-intent display placements showing rising CAC.", priority: "High", confidence: 89, uplift: "+8%", status: "new" },
  { id: "insight-opportunity", title: "Opportunities", description: "Expand lifecycle nurture into high-intent referral audiences.", priority: "Low", confidence: 84, uplift: "+6%", status: "new" },
];

/**
 * Connector Readiness contract: the future Connector Platform (OAuth →
 * Connector Registry → Sync Engine → Normalization Layer → Unified
 * Marketing Data Model) needs exactly one thing from Analytics — an
 * `AnalyticsFact[]` array shaped like today's mock rows. It should call
 * `analyticsEngine.replaceFacts(liveFacts)` once live data is normalized;
 * every query method below re-reads `this.facts` on each call, so no
 * other engine method, type, or caller needs to change when that happens.
 * Analytics implements no OAuth, API client, token storage, sync,
 * retries, scheduling, rate limiting, or webhook logic — all of that is
 * explicitly the Connector Platform's responsibility, never Analytics'.
 */
export type AnalyticsDataSource = AnalyticsFact[];

export class AnalyticsEngine {
  private facts: AnalyticsFact[];
  private insights: AnalyticsInsight[];

  constructor(facts: AnalyticsDataSource = generateAnalyticsFacts(), insights: AnalyticsInsight[] = DEFAULT_INSIGHTS.map(i => ({ ...i }))) {
    this.facts = facts;
    this.insights = insights;
  }

  /** Swaps the underlying fact table at runtime — the single integration point a future Connector Platform uses to replace mock data with live data. */
  replaceFacts(facts: AnalyticsDataSource): void {
    this.facts = facts;
  }

  private windowFor(range: AnalyticsRange, filters?: AnalyticsFilterState): { start: Date; end: Date; days: number } {
    const today = startOfDay(new Date());
    switch (range) {
      case "7d":
        return { start: addDays(today, -6), end: today, days: 7 };
      case "90d":
        return { start: addDays(today, -89), end: today, days: 90 };
      case "custom": {
        if (filters?.customRange) {
          const start = startOfDay(new Date(filters.customRange.start));
          const end = startOfDay(new Date(filters.customRange.end));
          const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1);
          return { start, end, days };
        }
        // No date range chosen yet — a fixed historical slice distinct from the rolling windows.
        return { start: addDays(today, -74), end: addDays(today, -40), days: 35 };
      }
      case "30d":
      default:
        return { start: addDays(today, -29), end: today, days: 30 };
    }
  }

  private filterFacts(range: AnalyticsRange, filters: AnalyticsFilterState, offsetDays = 0): AnalyticsFact[] {
    const { start, end } = this.windowFor(range, filters);
    const shiftedStart = addDays(start, -offsetDays).getTime();
    const shiftedEnd = addDays(end, -offsetDays).getTime();

    return this.facts.filter(f => {
      const t = new Date(f.date).getTime();
      if (t < shiftedStart || t > shiftedEnd) return false;
      if (filters.channel && f.channel !== filters.channel) return false;
      if (filters.campaign && f.campaign !== filters.campaign) return false;
      if (filters.region && f.region !== filters.region) return false;
      if (filters.device && f.device !== filters.device) return false;
      if (filters.audience && f.audience !== filters.audience) return false;
      return true;
    });
  }

  private sum(rows: AnalyticsFact[], field: keyof AnalyticsFact): number {
    return rows.reduce((total, row) => total + (typeof row[field] === "number" ? (row[field] as number) : 0), 0);
  }

  getSummaryMetrics(range: AnalyticsRange, filters: AnalyticsFilterState = {}): AnalyticsSummaryMetric[] {
    const { days } = this.windowFor(range, filters);
    const current = this.filterFacts(range, filters);
    const previous = this.filterFacts(range, filters, days);

    const revenue = this.sum(current, "revenue");
    const prevRevenue = this.sum(previous, "revenue");
    const spend = this.sum(current, "spend");
    const prevSpend = this.sum(previous, "spend");
    const conversions = this.sum(current, "conversions");
    const prevConversions = this.sum(previous, "conversions");
    const leads = this.sum(current, "leads");
    const prevLeads = this.sum(previous, "leads");
    const landingPageViews = this.sum(current, "landingPageViews");

    const roas = spend > 0 ? revenue / spend : 0;
    const prevRoas = prevSpend > 0 ? prevRevenue / prevSpend : 0;
    const cpa = conversions > 0 ? spend / conversions : 0;
    const prevCpa = prevConversions > 0 ? prevSpend / prevConversions : 0;
    const conversionRate = landingPageViews > 0 ? (conversions / landingPageViews) * 100 : 0;
    const prevLandingPageViews = this.sum(previous, "landingPageViews");
    const prevConversionRate = prevLandingPageViews > 0 ? (prevConversions / prevLandingPageViews) * 100 : 0;
    const growth = pctChange(revenue, prevRevenue);

    const sparklineFor = (field: keyof AnalyticsFact) => {
      const byDay = new Map<string, number>();
      for (const row of current) byDay.set(row.date, (byDay.get(row.date) ?? 0) + (row[field] as number));
      return Array.from(byDay.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, v]) => v);
    };

    const buildMetric = (id: string, label: string, value: string, change: number, comparison: string, sparkline: number[], invert = false): AnalyticsSummaryMetric => {
      // `trend` already encodes "good direction = up" once `invert` is applied here, so
      // tone can map directly from trend without re-applying invert a second time.
      const trend = trendFor(invert ? -change : change);
      const tone = trend === "steady" ? "neutral" : trend === "up" ? "positive" : "negative";
      return {
        id,
        label,
        value,
        trend,
        change: `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`,
        comparison,
        sparkline,
        tone,
      };
    };

    return [
      buildMetric("revenue", "Revenue", formatCurrency(revenue), pctChange(revenue, prevRevenue), "vs prior period", sparklineFor("revenue")),
      buildMetric("spend", "Marketing Spend", formatCurrency(spend), pctChange(spend, prevSpend), "vs prior period", sparklineFor("spend"), true),
      buildMetric("roas", "ROAS", `${roas.toFixed(1)}x`, pctChange(roas, prevRoas), "return on ad spend", sparklineFor("revenue")),
      buildMetric("cpa", "CPA", formatCurrency(cpa), pctChange(cpa, prevCpa), "cost per acquisition", sparklineFor("spend"), true),
      buildMetric("conversion-rate", "Conversion Rate", `${conversionRate.toFixed(1)}%`, conversionRate - prevConversionRate, "from landing pages", sparklineFor("conversions")),
      buildMetric("leads", "Leads", formatCount(leads), pctChange(leads, prevLeads), "new pool", sparklineFor("leads")),
      buildMetric("sales", "Sales", formatCount(conversions), pctChange(conversions, prevConversions), "from pipeline", sparklineFor("conversions")),
      buildMetric("growth", "Growth", `${growth >= 0 ? "+" : ""}${growth.toFixed(0)}%`, growth, "revenue momentum", sparklineFor("revenue")),
    ];
  }

  /**
   * Raw numeric totals behind `getSummaryMetrics()`'s formatted strings —
   * for callers (e.g. the Dashboard's Goals & Scorecards engine) that need
   * to compute their own derived values instead of parsing display text.
   */
  getRawSummary(range: AnalyticsRange, filters: AnalyticsFilterState = {}): { revenue: number; prevRevenue: number; spend: number; prevSpend: number; leads: number; prevLeads: number; conversions: number; prevConversions: number; conversionRate: number; prevConversionRate: number } {
    const { days } = this.windowFor(range, filters);
    const current = this.filterFacts(range, filters);
    const previous = this.filterFacts(range, filters, days);

    const revenue = this.sum(current, "revenue");
    const prevRevenue = this.sum(previous, "revenue");
    const spend = this.sum(current, "spend");
    const prevSpend = this.sum(previous, "spend");
    const leads = this.sum(current, "leads");
    const prevLeads = this.sum(previous, "leads");
    const conversions = this.sum(current, "conversions");
    const prevConversions = this.sum(previous, "conversions");
    const landingPageViews = this.sum(current, "landingPageViews");
    const prevLandingPageViews = this.sum(previous, "landingPageViews");
    const conversionRate = landingPageViews > 0 ? (conversions / landingPageViews) * 100 : 0;
    const prevConversionRate = prevLandingPageViews > 0 ? (prevConversions / prevLandingPageViews) * 100 : 0;

    return { revenue, prevRevenue, spend, prevSpend, leads, prevLeads, conversions, prevConversions, conversionRate, prevConversionRate };
  }

  getRevenueSeries(range: AnalyticsRange, filters: AnalyticsFilterState = {}): AnalyticsRevenuePoint[] {
    const rows = this.filterFacts(range, filters);
    const byDay = new Map<string, { revenue: number; spend: number }>();
    for (const row of rows) {
      const bucket = byDay.get(row.date) ?? { revenue: 0, spend: 0 };
      bucket.revenue += row.revenue;
      bucket.spend += row.spend;
      byDay.set(row.date, bucket);
    }
    const sortedDates = Array.from(byDay.keys()).sort();
    return sortedDates.map(date => ({
      label: new Date(date).toLocaleDateString(undefined, range === "7d" ? { weekday: "short" } : { month: "short", day: "numeric" }),
      revenue: Math.round(byDay.get(date)!.revenue),
      spend: Math.round(byDay.get(date)!.spend),
    }));
  }

  getTrafficMetrics(range: AnalyticsRange, filters: AnalyticsFilterState = {}): AnalyticsTrafficMetric[] {
    const { days } = this.windowFor(range, filters);
    const current = this.filterFacts(range, filters);
    const previous = this.filterFacts(range, filters, days);

    const sessions = this.sum(current, "sessions");
    const prevSessions = this.sum(previous, "sessions");
    const users = this.sum(current, "users");
    const prevUsers = this.sum(previous, "users");
    const returningUsers = this.sum(current, "returningUsers");
    const prevReturningUsers = this.sum(previous, "returningUsers");
    const bounces = this.sum(current, "bounces");
    const prevBounces = this.sum(previous, "bounces");
    const seconds = this.sum(current, "sessionSeconds");
    const prevSeconds = this.sum(previous, "sessionSeconds");

    const returningPct = users > 0 ? (returningUsers / users) * 100 : 0;
    const prevReturningPct = prevUsers > 0 ? (prevReturningUsers / prevUsers) * 100 : 0;
    const bouncePct = sessions > 0 ? (bounces / sessions) * 100 : 0;
    const prevBouncePct = prevSessions > 0 ? (prevBounces / prevSessions) * 100 : 0;
    const avgSeconds = current.length > 0 ? seconds / current.length : 0;
    const prevAvgSeconds = previous.length > 0 ? prevSeconds / previous.length : 0;

    const pct = (c: number, p: number) => `${pctChange(c, p) >= 0 ? "+" : ""}${pctChange(c, p).toFixed(1)}%`;
    const toneFor = (change: number, invert = false): "positive" | "negative" | "neutral" => {
      const t = trendFor(invert ? -change : change);
      return t === "steady" ? "neutral" : t === "up" ? "positive" : "negative";
    };

    const returningDelta = returningPct - prevReturningPct;
    const bounceDelta = bouncePct - prevBouncePct;

    return [
      { id: "sessions", label: "Sessions", value: formatCount(sessions), change: pct(sessions, prevSessions), tone: toneFor(pctChange(sessions, prevSessions)) },
      { id: "users", label: "Users", value: formatCount(users), change: pct(users, prevUsers), tone: toneFor(pctChange(users, prevUsers)) },
      { id: "returning-users", label: "Returning Users", value: `${returningPct.toFixed(1)}%`, change: `${returningDelta >= 0 ? "+" : ""}${returningDelta.toFixed(1)} pts`, tone: toneFor(returningDelta) },
      { id: "bounce-rate", label: "Bounce Rate", value: `${bouncePct.toFixed(1)}%`, change: `${bounceDelta >= 0 ? "+" : ""}${bounceDelta.toFixed(1)} pts`, tone: toneFor(bounceDelta, true) },
      { id: "avg-time", label: "Average Time", value: formatDuration(avgSeconds), change: pct(avgSeconds, prevAvgSeconds), tone: toneFor(pctChange(avgSeconds, prevAvgSeconds)) },
    ];
  }

  getChannelPerformance(range: AnalyticsRange, filters: AnalyticsFilterState = {}): AnalyticsChannelRow[] {
    const rows = this.filterFacts(range, filters);
    const byChannel = new Map<string, AnalyticsFact[]>();
    for (const row of rows) {
      (byChannel.get(row.channel) ?? byChannel.set(row.channel, []).get(row.channel)!).push(row);
    }

    return Array.from(byChannel.entries())
      .map(([channel, channelRows]) => {
        const spend = this.sum(channelRows, "spend");
        const revenue = this.sum(channelRows, "revenue");
        const conversions = this.sum(channelRows, "conversions");
        const leads = this.sum(channelRows, "leads");
        const roas = spend > 0 ? revenue / spend : 0;
        const cpa = conversions > 0 ? spend / conversions : 0;
        const status: ChannelHealthStatus = roas >= 5 ? "Healthy" : roas >= 4 ? "Monitoring" : "Optimizing";
        return {
          channel: channel as AnalyticsChannelRow["channel"],
          spend: formatCurrency(spend),
          revenue: formatCurrency(revenue),
          roas: `${roas.toFixed(1)}x`,
          cpa: formatCurrency(cpa),
          leads: formatCount(leads),
          status,
        };
      })
      .sort((a, b) => b.revenue.localeCompare(a.revenue));
  }

  getCampaignPerformance(range: AnalyticsRange, filters: AnalyticsFilterState = {}): AnalyticsCampaignRow[] {
    const rows = this.filterFacts(range, filters);
    const byCampaign = new Map<string, AnalyticsFact[]>();
    for (const row of rows) {
      (byCampaign.get(row.campaign) ?? byCampaign.set(row.campaign, []).get(row.campaign)!).push(row);
    }

    return Array.from(byCampaign.entries()).map(([name, campaignRows]) => {
      const clicks = this.sum(campaignRows, "clicks");
      const sessions = this.sum(campaignRows, "sessions");
      const spend = this.sum(campaignRows, "spend");
      const conversions = this.sum(campaignRows, "conversions");
      const revenue = this.sum(campaignRows, "revenue");
      const ctr = sessions > 0 ? (clicks / sessions) * 100 : 0;
      const cpc = clicks > 0 ? spend / clicks : 0;
      const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;
      return {
        name,
        clicks: Math.round(clicks),
        ctr: `${ctr.toFixed(1)}%`,
        cpc: `$${cpc.toFixed(2)}`,
        spend: formatCurrency(spend),
        conversions: Math.round(conversions),
        revenue: formatCurrency(revenue),
        roi: `${roi.toFixed(0)}%`,
      };
    });
  }

  getConversionFunnel(range: AnalyticsRange, filters: AnalyticsFilterState = {}): AnalyticsFunnelStage[] {
    const rows = this.filterFacts(range, filters);
    const sessions = this.sum(rows, "sessions");
    const landingPageViews = this.sum(rows, "landingPageViews");
    const leads = this.sum(rows, "leads");
    const qualifiedLeads = this.sum(rows, "qualifiedLeads");
    const conversions = this.sum(rows, "conversions");
    const revenue = this.sum(rows, "revenue");
    const top = sessions || 1;

    return [
      { stage: "Visitors", value: Math.round(sessions), percent: 100 },
      { stage: "Landing Page Views", value: Math.round(landingPageViews), percent: Math.round((landingPageViews / top) * 100) },
      { stage: "Leads", value: Math.round(leads), percent: Math.round((leads / top) * 100) },
      { stage: "Qualified Leads", value: Math.round(qualifiedLeads), percent: Math.round((qualifiedLeads / top) * 100) },
      { stage: "Customers", value: Math.round(conversions), percent: Math.round((conversions / top) * 100) },
      { stage: "Revenue", value: Math.round(revenue), percent: 100 },
    ];
  }

  getAudienceInsights(range: AnalyticsRange, filters: AnalyticsFilterState = {}): AnalyticsAudienceSegment[] {
    const rows = this.filterFacts(range, filters);
    const users = this.sum(rows, "users") || 1;
    const returningUsers = this.sum(rows, "returningUsers");

    const byDevice = new Map<string, number>();
    const byAudience = new Map<string, number>();
    const byRegion = new Map<string, number>();
    for (const row of rows) {
      byDevice.set(row.device, (byDevice.get(row.device) ?? 0) + row.sessions);
      byAudience.set(row.audience, (byAudience.get(row.audience) ?? 0) + row.sessions);
      byRegion.set(row.region, (byRegion.get(row.region) ?? 0) + row.sessions);
    }
    const topEntry = (m: Map<string, number>) => Array.from(m.entries()).sort((a, b) => b[1] - a[1])[0];
    const totalSessions = Array.from(byDevice.values()).reduce((a, b) => a + b, 0) || 1;

    const topDevice = topEntry(byDevice);
    const topAudience = topEntry(byAudience);
    const topRegion = topEntry(byRegion);

    return [
      { label: "Sessions", value: formatCount(totalSessions) },
      { label: "Top Device", value: topDevice ? `${topDevice[0]} ${Math.round((topDevice[1] / totalSessions) * 100)}%` : "—" },
      { label: "Top Audience", value: topAudience ? `${topAudience[0]} ${Math.round((topAudience[1] / totalSessions) * 100)}%` : "—" },
      { label: "Top Region", value: topRegion ? topRegion[0] : "—" },
      { label: "Returning Visitors", value: `${((returningUsers / users) * 100).toFixed(1)}%` },
      { label: "Devices Tracked", value: `${byDevice.size}` },
    ];
  }

  getGeoPerformance(range: AnalyticsRange, filters: AnalyticsFilterState = {}): AnalyticsGeoRow[] {
    const rows = this.filterFacts(range, filters);
    const byGeo = new Map<string, AnalyticsFact[]>();
    for (const row of rows) {
      const key = `${row.region}|${row.city}`;
      (byGeo.get(key) ?? byGeo.set(key, []).get(key)!).push(row);
    }
    return Array.from(byGeo.entries())
      .map(([key, geoRows]) => {
        const [country, city] = key.split("|");
        return {
          country,
          city,
          revenue: formatCurrency(this.sum(geoRows, "revenue")),
          conversions: Math.round(this.sum(geoRows, "conversions")),
        };
      })
      .sort((a, b) => b.conversions - a.conversions);
  }

  getRegionCount(range: AnalyticsRange, filters: AnalyticsFilterState = {}): number {
    return new Set(this.filterFacts(range, filters).map(r => r.region)).size;
  }

  getInsights(): AnalyticsInsight[] {
    return this.insights.map(i => ({ ...i }));
  }

  applyInsight(id: string): AnalyticsInsight | undefined {
    const insight = this.insights.find(i => i.id === id);
    if (!insight) return undefined;
    insight.status = "applied";
    return { ...insight };
  }

  dismissInsight(id: string): AnalyticsInsight | undefined {
    const insight = this.insights.find(i => i.id === id);
    if (!insight) return undefined;
    insight.status = "dismissed";
    return { ...insight };
  }

  /**
   * Generically computes ANY registered `AnalyticsMetricDefinition` — the
   * real backing behind the Custom KPI Builder. Without this, metrics
   * registered in `AnalyticsMetricRegistry` were pure unused metadata;
   * every built-in metric above is expressible through this same
   * field+aggregation contract, so custom metrics compute identically to
   * default ones rather than through separate logic.
   */
  computeMetric(definition: AnalyticsMetricDefinition, range: AnalyticsRange, filters: AnalyticsFilterState = {}): { value: number; formatted: string } {
    const rows = this.filterFacts(range, filters);
    let value: number;

    switch (definition.field) {
      case "roas": {
        const revenue = this.sum(rows, "revenue");
        const spend = this.sum(rows, "spend");
        value = spend > 0 ? revenue / spend : 0;
        break;
      }
      case "cpa": {
        const spend = this.sum(rows, "spend");
        const conversions = this.sum(rows, "conversions");
        value = conversions > 0 ? spend / conversions : 0;
        break;
      }
      case "conversionRate": {
        const conversions = this.sum(rows, "conversions");
        const views = this.sum(rows, "landingPageViews");
        value = views > 0 ? (conversions / views) * 100 : 0;
        break;
      }
      case "ctr": {
        const clicks = this.sum(rows, "clicks");
        const views = this.sum(rows, "landingPageViews");
        value = views > 0 ? (clicks / views) * 100 : 0;
        break;
      }
      case "bounceRate": {
        const bounces = this.sum(rows, "bounces");
        const sessions = this.sum(rows, "sessions");
        value = sessions > 0 ? (bounces / sessions) * 100 : 0;
        break;
      }
      case "avgSessionDuration": {
        const seconds = this.sum(rows, "sessionSeconds");
        value = rows.length > 0 ? seconds / rows.length : 0;
        break;
      }
      default: {
        const field = definition.field as keyof AnalyticsFact;
        if (definition.aggregation === "sum") value = this.sum(rows, field);
        else if (definition.aggregation === "count") value = rows.length;
        else value = rows.length > 0 ? this.sum(rows, field) / rows.length : 0;
      }
    }

    const formatted =
      definition.format === "currency" ? formatCurrency(value) :
      definition.format === "percent" ? `${value.toFixed(1)}%` :
      definition.format === "ratio" ? `${value.toFixed(1)}x` :
      definition.format === "duration" ? formatDuration(value) :
      formatCount(value);

    return { value, formatted };
  }

  getSnapshot(range: AnalyticsRange, filters: AnalyticsFilterState = {}): AnalyticsSnapshot {
    return {
      summaryMetrics: this.getSummaryMetrics(range, filters),
      revenueSeries: this.getRevenueSeries(range, filters),
      trafficMetrics: this.getTrafficMetrics(range, filters),
      channelPerformance: this.getChannelPerformance(range, filters),
      campaignPerformance: this.getCampaignPerformance(range, filters),
      conversionFunnel: this.getConversionFunnel(range, filters),
      audienceInsights: this.getAudienceInsights(range, filters),
      geoPerformance: this.getGeoPerformance(range, filters),
      regionCount: this.getRegionCount(range, filters),
    };
  }
}

export const analyticsEngine = new AnalyticsEngine();
