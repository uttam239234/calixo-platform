/**
 * Calixo Platform - Ads Reports Integration
 *
 * Registers Ads Manager's report definitions into the REAL Reports platform (ReportRegistry)
 * via the existing ReportBuilder pipeline — mirrors `registerAnalyticsReports.ts`. No new report
 * engine, registry, or export mechanism is created here — everything downstream (execution,
 * export, scheduling) is the existing ReportEngine / ExportEngine / ReportScheduler.
 */

import { generateId } from "@/shared/utils/string";
import { ReportBuilder, registerReports, reportRegistry, reportScheduler } from "@/core/reports";
import type { ReportRegistry } from "@/core/reports";

const ADS_OWNER = "Ads Manager Module";

function buildCampaignPerformanceReport() {
  return ReportBuilder.create()
    .selectData({
      module: "marketing",
      category: "advertising",
      dimensions: [{ id: generateId(10), name: "Campaign", field: "name", type: "category" }],
    })
    .selectMetrics([
      { id: generateId(10), name: "Spend", field: "spend", aggregation: "sum", format: "currency" },
      { id: generateId(10), name: "Conversions", field: "conversions", aggregation: "sum", format: "number" },
      { id: generateId(10), name: "ROAS", field: "roas", aggregation: "avg", format: "number" },
      { id: generateId(10), name: "CPA", field: "cpa", aggregation: "avg", format: "currency" },
    ])
    .setFilters([])
    .setVisualization([
      { id: generateId(10), type: "bar-chart", title: "Spend by Campaign", metricIds: ["spend"], dimensionIds: ["name"], config: {} },
      { id: generateId(10), type: "table", title: "Campaign Performance", metricIds: ["spend", "conversions", "roas", "cpa"], dimensionIds: ["name"], config: {} },
    ])
    .setLayout({ type: "grid", widgetPlacements: [] })
    .setExportOptions({ supportedExports: ["pdf", "excel", "csv"], supportedSchedules: ["manual", "weekly", "monthly"] })
    .save({
      name: "Campaign Performance",
      description: "Spend, conversions, ROAS, and CPA across every active campaign.",
      owner: ADS_OWNER,
      tags: ["ads", "campaigns"],
      permissions: ["campaign:read"],
      aiSummaryEnabled: true,
    });
}

function buildBudgetPacingReport() {
  return ReportBuilder.create()
    .selectData({
      module: "marketing",
      category: "advertising",
      dimensions: [{ id: generateId(10), name: "Platform", field: "platformId", type: "category" }],
    })
    .selectMetrics([
      { id: generateId(10), name: "Spend", field: "spend", aggregation: "sum", format: "currency" },
      { id: generateId(10), name: "Budget", field: "budget", aggregation: "sum", format: "currency" },
    ])
    .setFilters([])
    .setVisualization([{ id: generateId(10), type: "bar-chart", title: "Budget vs. Spend by Platform", metricIds: ["budget", "spend"], dimensionIds: ["platformId"], config: {} }])
    .setLayout({ type: "grid", widgetPlacements: [] })
    .setExportOptions({ supportedExports: ["pdf", "excel", "csv"], supportedSchedules: ["manual", "weekly"] })
    .save({
      name: "Budget Pacing",
      description: "Budget allocation and spend pacing broken down by ad platform.",
      owner: ADS_OWNER,
      tags: ["ads", "budget"],
      permissions: ["campaign:read"],
      aiSummaryEnabled: true,
    });
}

let registeredIds: { campaignReportId: string; budgetReportId: string } | null = null;

/**
 * Safe to call more than once — always returns the same report ids, registering only on the
 * first call. Also seeds one real recurring schedule per report via the existing
 * ReportScheduler, so "Scheduled Reports" has genuine Ads content rather than an empty state.
 */
export function registerAdsReports(registry: ReportRegistry = reportRegistry): { campaignReportId: string; budgetReportId: string } {
  if (registeredIds) return registeredIds;
  const campaignReport = buildCampaignPerformanceReport();
  const budgetReport = buildBudgetPacingReport();
  registerReports([campaignReport, budgetReport], registry);

  reportScheduler.create({ reportId: campaignReport.id, frequency: "weekly", recipients: [ADS_OWNER], exportFormat: "pdf" });
  reportScheduler.create({ reportId: budgetReport.id, frequency: "weekly", recipients: [ADS_OWNER], exportFormat: "excel" });

  registeredIds = { campaignReportId: campaignReport.id, budgetReportId: budgetReport.id };
  return registeredIds;
}
