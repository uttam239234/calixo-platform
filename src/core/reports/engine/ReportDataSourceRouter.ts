/**
 * Calixo Platform - Report Data Source Router
 *
 * The fix for "never duplicate calculations, consume the real platform
 * facades" — `ReportEngine.prepareDataset()` fabricates every dataset
 * from a formula regardless of a report's real module/category. This
 * router checks a report's `metadata.sourceId` (set by the AI Report
 * Assistant and the 6 Beginner Mode templates — the primary, "most
 * users" path) and, when present, calls the real facade and shapes its
 * genuine response into a `ReportDataset`. Reports with no binding
 * (fully custom/advanced hand-built reports with arbitrary typed fields)
 * fall back to `ReportEngine.prepareDataset()` unchanged — there is no
 * generic way to validate an arbitrary user-typed field against a real
 * facade, and this fallback is itself already real/deterministic/
 * disclosed, not fabricated on top of what's disclosed.
 */

import { analyticsPlatformAPI } from "@/core/analytics";
import { adsPlatformAPI } from "@/core/ads";
import { socialPlatformAPI } from "@/core/social";
import { reputationPlatformAPI } from "@/core/reputation";
import { contentPlatformAPI, CONTENT_ORGANIZATION_ID } from "@/core/content";
import type { ReportDataset, ReportDefinition, ReportSourceId } from "../types";

function now(): string {
  return new Date().toISOString();
}

async function analyticsExecutive(report: ReportDefinition): Promise<ReportDataset> {
  const summary = analyticsPlatformAPI.getExecutiveSummary();
  return {
    reportId: report.id,
    columns: [
      { id: "period", label: "Period", kind: "dimension" },
      { id: "revenue", label: "Revenue", kind: "metric", format: "currency" },
      { id: "spend", label: "Spend", kind: "metric", format: "currency" },
    ],
    rows: summary.revenueTrend.map(point => ({ period: point.label, revenue: point.revenue, spend: point.spend })),
    rowCount: summary.revenueTrend.length,
    generatedAt: now(),
    summary: summary.kpis.map(k => ({ id: k.id, label: k.label, value: k.value, change: k.change, tone: k.tone })),
    sourceLabel: "Analytics",
  };
}

async function analyticsConversion(report: ReportDefinition): Promise<ReportDataset> {
  const audience = analyticsPlatformAPI.getAudienceSummary();
  const conversion = analyticsPlatformAPI.getConversionSummary();
  return {
    reportId: report.id,
    columns: [
      { id: "region", label: "Region", kind: "dimension" },
      { id: "conversions", label: "Conversions", kind: "metric", format: "number" },
    ],
    rows: audience.geo.map(g => ({ region: `${g.city}, ${g.country}`, conversions: g.conversions })),
    rowCount: audience.geo.length,
    generatedAt: now(),
    summary: conversion.funnel.map(stage => ({ id: stage.stage, label: stage.stage, value: stage.value.toLocaleString(), change: `${stage.percent}%`, tone: "neutral" as const })),
    sourceLabel: "Analytics",
  };
}

async function adsPerformance(report: ReportDefinition): Promise<ReportDataset> {
  const campaigns = adsPlatformAPI.listCampaigns();
  const summary = adsPlatformAPI.getPerformanceSummary(campaigns);
  return {
    reportId: report.id,
    columns: [
      { id: "campaign", label: "Campaign", kind: "dimension" },
      { id: "spend", label: "Spend", kind: "metric", format: "currency" },
      { id: "conversions", label: "Conversions", kind: "metric", format: "number" },
      { id: "roas", label: "ROAS", kind: "metric", format: "number" },
    ],
    rows: campaigns.slice(0, 20).map(c => ({ campaign: c.name, spend: c.spend, conversions: c.conversions, roas: c.roas })),
    rowCount: Math.min(campaigns.length, 20),
    generatedAt: now(),
    summary: [
      { id: "spend", label: "Total Spend", value: `$${summary.spend.toLocaleString()}`, change: `${summary.spendChange >= 0 ? "+" : ""}${summary.spendChange.toFixed(1)}%`, tone: summary.spendChange >= 0 ? "positive" : "negative" },
      { id: "roas", label: "Blended ROAS", value: `${summary.roas.toFixed(1)}x`, change: `${summary.roasChange >= 0 ? "+" : ""}${summary.roasChange.toFixed(1)}%`, tone: summary.roasChange >= 0 ? "positive" : "negative" },
      { id: "conversions", label: "Conversions", value: summary.conversions.toLocaleString(), change: `${summary.conversionChange >= 0 ? "+" : ""}${summary.conversionChange.toFixed(1)}%`, tone: summary.conversionChange >= 0 ? "positive" : "negative" },
    ],
    sourceLabel: "Ads Manager",
  };
}

async function socialOverview(report: ReportDefinition): Promise<ReportDataset> {
  const platforms = socialPlatformAPI.getPlatformSummaries();
  const overview = socialPlatformAPI.getOverview();
  return {
    reportId: report.id,
    columns: [
      { id: "platform", label: "Platform", kind: "dimension" },
      { id: "reach", label: "Reach", kind: "metric", format: "number" },
      { id: "followers", label: "Followers", kind: "metric", format: "number" },
      { id: "engagementRate", label: "Engagement Rate", kind: "metric", format: "percent" },
    ],
    rows: platforms.map(p => ({ platform: p.platform, reach: p.reach, followers: p.followers, engagementRate: p.engagementRate })),
    rowCount: platforms.length,
    generatedAt: now(),
    summary: [
      { id: "reach", label: "Total Reach", value: overview.totalReach.toLocaleString(), tone: "neutral" },
      { id: "followers", label: "Total Followers", value: overview.totalFollowers.toLocaleString(), tone: "neutral" },
      { id: "engagement", label: "Avg Engagement", value: `${overview.avgEngagementRate.toFixed(1)}%`, tone: "neutral" },
    ],
    sourceLabel: "Social Media",
  };
}

async function reputationHealth(report: ReportDefinition): Promise<ReportDataset> {
  const distribution = reputationPlatformAPI.getPlatformDistribution();
  const kpis = reputationPlatformAPI.getKpis();
  return {
    reportId: report.id,
    columns: [
      { id: "platform", label: "Platform", kind: "dimension" },
      { id: "mentions", label: "Mentions", kind: "metric", format: "number" },
      { id: "percentage", label: "Share", kind: "metric", format: "percent" },
    ],
    rows: distribution.map(d => ({ platform: d.platform, mentions: d.mentions, percentage: d.percentage })),
    rowCount: distribution.length,
    generatedAt: now(),
    summary: kpis.map(k => ({ id: k.id, label: k.title, value: k.value, change: k.change, tone: k.positive ? "positive" : "negative" })),
    sourceLabel: "Brand Monitoring",
  };
}

async function contentHistory(report: ReportDefinition): Promise<ReportDataset> {
  const history = contentPlatformAPI.listHistory(CONTENT_ORGANIZATION_ID);
  const byOutput = new Map<string, number>();
  for (const entry of history) byOutput.set(entry.outputLabel, (byOutput.get(entry.outputLabel) ?? 0) + 1);
  const rows = [...byOutput.entries()].map(([outputLabel, count]) => ({ output: outputLabel, count }));
  const creativeCount = history.filter(h => h.kind === "creative").length;
  const contentCount = history.filter(h => h.kind === "content").length;
  return {
    reportId: report.id,
    columns: [
      { id: "output", label: "Output Type", kind: "dimension" },
      { id: "count", label: "Generated", kind: "metric", format: "number" },
    ],
    rows,
    rowCount: rows.length,
    generatedAt: now(),
    summary: [
      { id: "total", label: "Total Generations", value: history.length.toLocaleString(), tone: "neutral" },
      { id: "creative", label: "Creative Outputs", value: creativeCount.toLocaleString(), tone: "neutral" },
      { id: "content", label: "Content Outputs", value: contentCount.toLocaleString(), tone: "neutral" },
    ],
    sourceLabel: "Content Studio",
  };
}

const SOURCE_HANDLERS: Record<ReportSourceId, (report: ReportDefinition) => Promise<ReportDataset>> = {
  "analytics-executive": analyticsExecutive,
  "analytics-conversion": analyticsConversion,
  "ads-performance": adsPerformance,
  "social-overview": socialOverview,
  "reputation-health": reputationHealth,
  "content-history": contentHistory,
};

export class ReportDataSourceRouter {
  /** Real facade data for a bound report; `undefined` when the report has no binding, signaling the caller should fall back to the formula generator. */
  async getDataset(report: ReportDefinition): Promise<ReportDataset | undefined> {
    const sourceId = report.metadata?.sourceId as ReportSourceId | undefined;
    if (!sourceId) return undefined;
    const handler = SOURCE_HANDLERS[sourceId];
    if (!handler) return undefined;
    return handler(report);
  }
}

export const reportDataSourceRouter = new ReportDataSourceRouter();
