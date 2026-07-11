/**
 * Calixo Platform - Social Reports Integration
 *
 * Registers Social Media's report definitions into the REAL Reports platform (ReportRegistry)
 * via the existing ReportBuilder pipeline — mirrors `registerAdsReports.ts`. No new report
 * engine, registry, or export mechanism is created here — everything downstream (execution,
 * export, scheduling) is the existing ReportEngine / ExportEngine / ReportScheduler.
 */

import { generateId } from "@/shared/utils/string";
import { ReportBuilder, registerReports, reportRegistry, reportScheduler } from "@/core/reports";
import type { ReportRegistry } from "@/core/reports";

const SOCIAL_OWNER = "Social Media Module";

function buildEngagementReport() {
  return ReportBuilder.create()
    .selectData({
      module: "social",
      category: "social",
      dimensions: [{ id: generateId(10), name: "Platform", field: "platform", type: "category" }],
    })
    .selectMetrics([
      { id: generateId(10), name: "Reach", field: "reach", aggregation: "sum", format: "number" },
      { id: generateId(10), name: "Likes", field: "likes", aggregation: "sum", format: "number" },
      { id: generateId(10), name: "Comments", field: "comments", aggregation: "sum", format: "number" },
      { id: generateId(10), name: "Shares", field: "shares", aggregation: "sum", format: "number" },
    ])
    .setFilters([])
    .setVisualization([
      { id: generateId(10), type: "bar-chart", title: "Engagement by Platform", metricIds: ["likes", "comments", "shares"], dimensionIds: ["platform"], config: {} },
      { id: generateId(10), type: "table", title: "Post Engagement", metricIds: ["reach", "likes", "comments", "shares"], dimensionIds: ["platform"], config: {} },
    ])
    .setLayout({ type: "grid", widgetPlacements: [] })
    .setExportOptions({ supportedExports: ["pdf", "excel", "csv"], supportedSchedules: ["manual", "weekly", "monthly"] })
    .save({
      name: "Engagement Report",
      description: "Reach, likes, comments, and shares across published posts.",
      owner: SOCIAL_OWNER,
      tags: ["social", "engagement"],
      permissions: ["social:read"],
      aiSummaryEnabled: true,
    });
}

function buildPlatformReport() {
  return ReportBuilder.create()
    .selectData({
      module: "social",
      category: "social",
      dimensions: [{ id: generateId(10), name: "Account", field: "handle", type: "category" }],
    })
    .selectMetrics([
      { id: generateId(10), name: "Followers", field: "followers", aggregation: "sum", format: "number" },
      { id: generateId(10), name: "Reach", field: "reach", aggregation: "sum", format: "number" },
      { id: generateId(10), name: "Engagement Rate", field: "engagementRate", aggregation: "avg", format: "percent" },
    ])
    .setFilters([])
    .setVisualization([{ id: generateId(10), type: "table", title: "Account Performance", metricIds: ["followers", "reach", "engagementRate"], dimensionIds: ["handle"], config: {} }])
    .setLayout({ type: "grid", widgetPlacements: [] })
    .setExportOptions({ supportedExports: ["pdf", "excel", "csv"], supportedSchedules: ["manual", "weekly"] })
    .save({
      name: "Platform Report",
      description: "Follower count, reach, and engagement rate broken down by connected account.",
      owner: SOCIAL_OWNER,
      tags: ["social", "accounts"],
      permissions: ["social:read"],
      aiSummaryEnabled: true,
    });
}

let registeredIds: { engagementReportId: string; platformReportId: string } | null = null;

/**
 * Safe to call more than once — always returns the same report ids, registering only on the
 * first call. Also seeds one real recurring schedule per report via the existing
 * ReportScheduler, so "Scheduled Reports" has genuine Social content rather than an empty state.
 */
export function registerSocialReports(registry: ReportRegistry = reportRegistry): { engagementReportId: string; platformReportId: string } {
  if (registeredIds) return registeredIds;
  const engagementReport = buildEngagementReport();
  const platformReport = buildPlatformReport();
  registerReports([engagementReport, platformReport], registry);

  reportScheduler.create({ reportId: engagementReport.id, frequency: "weekly", recipients: [{ type: "user", id: SOCIAL_OWNER, label: SOCIAL_OWNER }], exportFormat: "pdf" });
  reportScheduler.create({ reportId: platformReport.id, frequency: "weekly", recipients: [{ type: "user", id: SOCIAL_OWNER, label: SOCIAL_OWNER }], exportFormat: "excel" });

  registeredIds = { engagementReportId: engagementReport.id, platformReportId: platformReport.id };
  return registeredIds;
}
