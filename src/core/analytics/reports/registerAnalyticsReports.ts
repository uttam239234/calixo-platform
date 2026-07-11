/**
 * Calixo Platform - Analytics Reports Integration
 *
 * Registers Analytics' report definitions into the REAL Reports platform
 * (ReportRegistry) via the existing ReportBuilder pipeline — this is the
 * exact cross-module extension point the Reports platform was designed
 * for. Resolves the Analytics module manifest's long-declared but never
 * wired `channel-report` / `traffic-report` entries.
 *
 * No new report engine, registry, or export mechanism is created here —
 * everything downstream (execution, export, scheduling) is the existing
 * ReportEngine / ExportEngine / ReportScheduler.
 */

import { generateId } from "@/shared/utils/string";
import { ReportBuilder, registerReports, reportRegistry, reportScheduler } from "@/core/reports";
import type { ReportRegistry } from "@/core/reports";

const ANALYTICS_OWNER = "Analytics Module";

function buildChannelPerformanceReport() {
  return ReportBuilder.create()
    .selectData({
      module: "analytics",
      category: "analytics",
      dimensions: [{ id: generateId(10), name: "Channel", field: "channel", type: "category" }],
    })
    .selectMetrics([
      { id: generateId(10), name: "Spend", field: "spend", aggregation: "sum", format: "currency" },
      { id: generateId(10), name: "Revenue", field: "revenue", aggregation: "sum", format: "currency" },
      { id: generateId(10), name: "ROAS", field: "roas", aggregation: "avg", format: "number" },
    ])
    .setFilters([])
    .setVisualization([
      { id: generateId(10), type: "bar-chart", title: "Revenue by Channel", metricIds: ["revenue"], dimensionIds: ["channel"], config: {} },
      { id: generateId(10), type: "table", title: "Channel Performance", metricIds: ["spend", "revenue", "roas"], dimensionIds: ["channel"], config: {} },
    ])
    .setLayout({ type: "grid", widgetPlacements: [] })
    .setExportOptions({ supportedExports: ["pdf", "excel", "csv"], supportedSchedules: ["manual", "weekly", "monthly"] })
    .save({
      name: "Channel Performance",
      description: "Spend, revenue, and ROAS broken down by marketing channel.",
      owner: ANALYTICS_OWNER,
      tags: ["analytics", "channels"],
      permissions: ["analytics.view"],
      aiSummaryEnabled: true,
    });
}

function buildTrafficAnalyticsReport() {
  return ReportBuilder.create()
    .selectData({
      module: "analytics",
      category: "analytics",
      dimensions: [{ id: generateId(10), name: "Date", field: "date", type: "time" }],
    })
    .selectMetrics([
      { id: generateId(10), name: "Sessions", field: "sessions", aggregation: "sum", format: "number" },
      { id: generateId(10), name: "Users", field: "users", aggregation: "sum", format: "number" },
      { id: generateId(10), name: "Bounce Rate", field: "bounceRate", aggregation: "avg", format: "percent" },
    ])
    .setFilters([])
    .setVisualization([
      { id: generateId(10), type: "line-chart", title: "Sessions Over Time", metricIds: ["sessions"], dimensionIds: ["date"], config: {} },
      { id: generateId(10), type: "kpi-card", title: "Users", metricIds: ["users"], dimensionIds: [], config: {} },
    ])
    .setLayout({ type: "grid", widgetPlacements: [] })
    .setExportOptions({ supportedExports: ["pdf", "excel", "csv"], supportedSchedules: ["manual", "daily", "weekly"] })
    .save({
      name: "Traffic Analytics",
      description: "Sessions, users, and engagement trends over time.",
      owner: ANALYTICS_OWNER,
      tags: ["analytics", "traffic"],
      permissions: ["analytics.view"],
      aiSummaryEnabled: true,
    });
}

function buildExecutiveAnalyticsReport() {
  return ReportBuilder.create()
    .selectData({ module: "core", category: "executive", dimensions: [{ id: generateId(10), name: "Date", field: "date", type: "time" }] })
    .selectMetrics([
      { id: generateId(10), name: "Revenue", field: "revenue", aggregation: "sum", format: "currency" },
      { id: generateId(10), name: "ROAS", field: "roas", aggregation: "avg", format: "number" },
      { id: generateId(10), name: "Conversion Rate", field: "conversionRate", aggregation: "avg", format: "percent" },
    ])
    .setFilters([])
    .setVisualization([
      { id: generateId(10), type: "scorecard", title: "Executive Scorecard", metricIds: ["revenue", "roas", "conversionRate"], dimensionIds: [], config: {} },
      { id: generateId(10), type: "line-chart", title: "Revenue Trend", metricIds: ["revenue"], dimensionIds: ["date"], config: {} },
    ])
    .setLayout({ type: "grid", widgetPlacements: [] })
    .setExportOptions({ supportedExports: ["pdf", "excel"], supportedSchedules: ["manual", "weekly", "monthly"] })
    .save({ name: "Executive Analytics Report", description: "Board-ready revenue, ROAS, and conversion summary.", owner: ANALYTICS_OWNER, tags: ["analytics", "executive", "board"], permissions: ["analytics.view"], aiSummaryEnabled: true });
}

function buildRevenueAnalyticsReport() {
  return ReportBuilder.create()
    .selectData({ module: "analytics", category: "analytics", dimensions: [{ id: generateId(10), name: "Channel", field: "channel", type: "category" }] })
    .selectMetrics([
      { id: generateId(10), name: "Revenue", field: "revenue", aggregation: "sum", format: "currency" },
      { id: generateId(10), name: "Spend", field: "spend", aggregation: "sum", format: "currency" },
    ])
    .setFilters([])
    .setVisualization([{ id: generateId(10), type: "waterfall", title: "Revenue Bridge", metricIds: ["revenue"], dimensionIds: ["channel"], config: {} }])
    .setLayout({ type: "grid", widgetPlacements: [] })
    .setExportOptions({ supportedExports: ["pdf", "excel", "csv"], supportedSchedules: ["manual", "monthly"] })
    .save({ name: "Revenue Analytics Report", description: "Revenue and spend broken down by channel.", owner: ANALYTICS_OWNER, tags: ["analytics", "revenue"], permissions: ["analytics.view"], aiSummaryEnabled: true });
}

function buildAudienceAnalyticsReport() {
  return ReportBuilder.create()
    .selectData({ module: "analytics", category: "analytics", dimensions: [{ id: generateId(10), name: "Audience", field: "audience", type: "category" }] })
    .selectMetrics([{ id: generateId(10), name: "Sessions", field: "sessions", aggregation: "sum", format: "number" }])
    .setFilters([])
    .setVisualization([{ id: generateId(10), type: "pie-chart", title: "Audience Composition", metricIds: ["sessions"], dimensionIds: ["audience"], config: {} }])
    .setLayout({ type: "grid", widgetPlacements: [] })
    .setExportOptions({ supportedExports: ["pdf", "excel", "csv"], supportedSchedules: ["manual", "monthly"] })
    .save({ name: "Audience Analytics Report", description: "Audience segment composition and geographic distribution.", owner: ANALYTICS_OWNER, tags: ["analytics", "audience"], permissions: ["analytics.view"], aiSummaryEnabled: true });
}

let registeredIds: { channelReportId: string; trafficReportId: string; executiveReportId: string; revenueReportId: string; audienceReportId: string } | null = null;

/**
 * Safe to call more than once — always returns the same report ids,
 * registering only on the first call. Also seeds one real recurring
 * schedule per report via the existing ReportScheduler, so "Scheduled
 * Reports" has genuine content rather than an empty state on first load.
 */
export function registerAnalyticsReports(registry: ReportRegistry = reportRegistry): { channelReportId: string; trafficReportId: string; executiveReportId: string; revenueReportId: string; audienceReportId: string } {
  if (registeredIds) return registeredIds;
  const channelReport = buildChannelPerformanceReport();
  const trafficReport = buildTrafficAnalyticsReport();
  const executiveReport = buildExecutiveAnalyticsReport();
  const revenueReport = buildRevenueAnalyticsReport();
  const audienceReport = buildAudienceAnalyticsReport();
  registerReports([channelReport, trafficReport, executiveReport, revenueReport, audienceReport], registry);

  reportScheduler.create({ reportId: channelReport.id, frequency: "weekly", recipients: [{ type: "user", id: ANALYTICS_OWNER, label: ANALYTICS_OWNER }], exportFormat: "pdf" });
  reportScheduler.create({ reportId: trafficReport.id, frequency: "daily", recipients: [{ type: "user", id: ANALYTICS_OWNER, label: ANALYTICS_OWNER }], exportFormat: "excel" });
  reportScheduler.create({ reportId: executiveReport.id, frequency: "monthly", recipients: [{ type: "user", id: ANALYTICS_OWNER, label: ANALYTICS_OWNER }], exportFormat: "pdf" });

  registeredIds = { channelReportId: channelReport.id, trafficReportId: trafficReport.id, executiveReportId: executiveReport.id, revenueReportId: revenueReport.id, audienceReportId: audienceReport.id };
  return registeredIds;
}
