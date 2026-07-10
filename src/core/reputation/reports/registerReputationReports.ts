/**
 * Calixo Platform - Reputation Reports Integration
 *
 * Registers Brand Monitoring's report definitions into the REAL Reports platform
 * (ReportRegistry) via the existing ReportBuilder pipeline — mirrors `registerSocialReports.ts`.
 * `module: "brand"` / `category: "brand"` are already valid enum members, unlike Ads (which
 * needed workarounds) — no platform edits needed. No new report engine, registry, or export
 * mechanism is created here.
 */
import { generateId } from "@/shared/utils/string";
import { ReportBuilder, registerReports, reportRegistry, reportScheduler } from "@/core/reports";
import type { ReportRegistry } from "@/core/reports";

const REPUTATION_OWNER = "Brand Monitoring Module";

function buildExecutiveReport() {
  return ReportBuilder.create()
    .selectData({
      module: "brand",
      category: "executive",
      dimensions: [{ id: generateId(10), name: "Platform", field: "platform", type: "category" }],
    })
    .selectMetrics([
      { id: generateId(10), name: "Total Mentions", field: "totalMentions", aggregation: "sum", format: "number" },
      { id: generateId(10), name: "Total Reach", field: "totalReach", aggregation: "sum", format: "number" },
      { id: generateId(10), name: "Avg Sentiment", field: "avgSentimentScore", aggregation: "avg", format: "percent" },
    ])
    .setFilters([])
    .setVisualization([{ id: generateId(10), type: "table", title: "Executive Summary", metricIds: ["totalMentions", "totalReach", "avgSentimentScore"], dimensionIds: ["platform"], config: {} }])
    .setLayout({ type: "grid", widgetPlacements: [] })
    .setExportOptions({ supportedExports: ["pdf", "excel"], supportedSchedules: ["manual", "weekly"] })
    .save({
      name: "Executive Brand Report",
      description: "Key reputation KPIs, risks, and strategic recommendations for leadership.",
      owner: REPUTATION_OWNER,
      tags: ["brand", "executive"],
      permissions: ["brand:read"],
      aiSummaryEnabled: true,
    });
}

function buildSentimentReport() {
  return ReportBuilder.create()
    .selectData({
      module: "brand",
      category: "brand",
      dimensions: [{ id: generateId(10), name: "Platform", field: "platform", type: "category" }],
    })
    .selectMetrics([
      { id: generateId(10), name: "Positive %", field: "positivePct", aggregation: "avg", format: "percent" },
      { id: generateId(10), name: "Neutral %", field: "neutralPct", aggregation: "avg", format: "percent" },
      { id: generateId(10), name: "Negative %", field: "negativePct", aggregation: "avg", format: "percent" },
    ])
    .setFilters([])
    .setVisualization([{ id: generateId(10), type: "bar-chart", title: "Sentiment Distribution", metricIds: ["positivePct", "neutralPct", "negativePct"], dimensionIds: ["platform"], config: {} }])
    .setLayout({ type: "grid", widgetPlacements: [] })
    .setExportOptions({ supportedExports: ["pdf", "excel", "csv"], supportedSchedules: ["manual", "weekly"] })
    .save({
      name: "Sentiment Analysis Report",
      description: "Sentiment distribution and trend by platform, country, and topic.",
      owner: REPUTATION_OWNER,
      tags: ["brand", "sentiment"],
      permissions: ["brand:read"],
      aiSummaryEnabled: true,
    });
}

function buildCompetitorReport() {
  return ReportBuilder.create()
    .selectData({
      module: "brand",
      category: "brand",
      dimensions: [{ id: generateId(10), name: "Competitor", field: "name", type: "category" }],
    })
    .selectMetrics([
      { id: generateId(10), name: "Share of Voice", field: "shareOfVoice", aggregation: "avg", format: "percent" },
      { id: generateId(10), name: "Total Mentions", field: "totalMentions", aggregation: "sum", format: "number" },
      { id: generateId(10), name: "Growth", field: "growth", aggregation: "avg", format: "percent" },
    ])
    .setFilters([])
    .setVisualization([{ id: generateId(10), type: "table", title: "Competitive Landscape", metricIds: ["shareOfVoice", "totalMentions", "growth"], dimensionIds: ["name"], config: {} }])
    .setLayout({ type: "grid", widgetPlacements: [] })
    .setExportOptions({ supportedExports: ["pdf", "excel", "csv"], supportedSchedules: ["manual", "monthly"] })
    .save({
      name: "Competitor Analysis Report",
      description: "Share of voice, sentiment, and growth compared against tracked competitors.",
      owner: REPUTATION_OWNER,
      tags: ["brand", "competitors"],
      permissions: ["brand:read"],
      aiSummaryEnabled: true,
    });
}

function buildCrisisReport() {
  return ReportBuilder.create()
    .selectData({
      module: "brand",
      category: "brand",
      dimensions: [{ id: generateId(10), name: "Source", field: "source", type: "category" }],
    })
    .selectMetrics([
      { id: generateId(10), name: "Risk Score", field: "riskScore", aggregation: "avg", format: "number" },
      { id: generateId(10), name: "Mention Count", field: "mentionCount", aggregation: "sum", format: "number" },
      { id: generateId(10), name: "Reach", field: "reach", aggregation: "sum", format: "number" },
    ])
    .setFilters([])
    .setVisualization([{ id: generateId(10), type: "table", title: "Crisis Detection Log", metricIds: ["riskScore", "mentionCount", "reach"], dimensionIds: ["source"], config: {} }])
    .setLayout({ type: "grid", widgetPlacements: [] })
    .setExportOptions({ supportedExports: ["pdf", "csv"], supportedSchedules: ["manual"] })
    .save({
      name: "Crisis Detection Report",
      description: "Active and resolved reputation risk incidents with recommended actions.",
      owner: REPUTATION_OWNER,
      tags: ["brand", "crisis"],
      permissions: ["brand:read"],
      aiSummaryEnabled: true,
    });
}

let registeredIds: { executiveReportId: string; sentimentReportId: string; competitorReportId: string; crisisReportId: string } | null = null;

/** Safe to call more than once — always returns the same report ids, registering only on the first call. Seeds one real recurring schedule per report via the existing ReportScheduler. */
export function registerReputationReports(registry: ReportRegistry = reportRegistry) {
  if (registeredIds) return registeredIds;
  const executiveReport = buildExecutiveReport();
  const sentimentReport = buildSentimentReport();
  const competitorReport = buildCompetitorReport();
  const crisisReport = buildCrisisReport();
  registerReports([executiveReport, sentimentReport, competitorReport, crisisReport], registry);

  reportScheduler.create({ reportId: executiveReport.id, frequency: "weekly", recipients: [REPUTATION_OWNER], exportFormat: "pdf" });
  reportScheduler.create({ reportId: sentimentReport.id, frequency: "weekly", recipients: [REPUTATION_OWNER], exportFormat: "excel" });
  reportScheduler.create({ reportId: competitorReport.id, frequency: "monthly", recipients: [REPUTATION_OWNER], exportFormat: "pdf" });

  registeredIds = { executiveReportId: executiveReport.id, sentimentReportId: sentimentReport.id, competitorReportId: competitorReport.id, crisisReportId: crisisReport.id };
  return registeredIds;
}
