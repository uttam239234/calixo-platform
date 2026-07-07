/**
 * Calixo Platform - Dashboard Reports Integration
 *
 * Registers Dashboard-oriented report definitions into the real Reports
 * platform via the existing ReportBuilder pipeline — the same
 * cross-module extension point Analytics uses. No new report engine,
 * export mechanism, or scheduler is created here.
 */

import { generateId } from "@/shared/utils/string";
import { ReportBuilder, registerReports, reportRegistry, reportScheduler } from "@/core/reports";
import type { ReportRegistry } from "@/core/reports";

const DASHBOARD_OWNER = "Dashboard Module";

function buildExecutiveSummaryReport() {
  return ReportBuilder.create()
    .selectData({
      module: "core",
      category: "executive",
      dimensions: [{ id: generateId(10), name: "Channel", field: "channel", type: "category" }],
    })
    .selectMetrics([
      { id: generateId(10), name: "Revenue", field: "revenue", aggregation: "sum", format: "currency" },
      { id: generateId(10), name: "Leads", field: "leads", aggregation: "sum", format: "number" },
      { id: generateId(10), name: "Pending Approvals", field: "pendingApprovals", aggregation: "count", format: "number" },
    ])
    .setFilters([])
    .setVisualization([
      { id: generateId(10), type: "kpi-card", title: "Revenue", metricIds: ["revenue"], dimensionIds: [], config: {} },
      { id: generateId(10), type: "scorecard", title: "Goals & KPIs", metricIds: ["revenue", "leads"], dimensionIds: [], config: {} },
      { id: generateId(10), type: "table", title: "Pending Approvals", metricIds: ["pendingApprovals"], dimensionIds: ["channel"], config: {} },
    ])
    .setLayout({ type: "grid", widgetPlacements: [] })
    .setExportOptions({ supportedExports: ["pdf", "excel", "csv"], supportedSchedules: ["manual", "weekly", "monthly"] })
    .save({
      name: "Executive Summary",
      description: "Revenue, goal progress, and approval status in one report.",
      owner: DASHBOARD_OWNER,
      tags: ["dashboard", "executive"],
      permissions: ["dashboard.view"],
      aiSummaryEnabled: true,
    });
}

function buildOperationsReport() {
  return ReportBuilder.create()
    .selectData({
      module: "core",
      category: "workflow",
      dimensions: [{ id: generateId(10), name: "Status", field: "status", type: "category" }],
    })
    .selectMetrics([
      { id: generateId(10), name: "Overdue Items", field: "overdue", aggregation: "count", format: "number" },
      { id: generateId(10), name: "Avg Approval Days", field: "avgApprovalDays", aggregation: "avg", format: "number" },
    ])
    .setFilters([])
    .setVisualization([
      { id: generateId(10), type: "table", title: "Workflow Activity", metricIds: ["overdue"], dimensionIds: ["status"], config: {} },
      { id: generateId(10), type: "gauge", title: "Avg Approval Time", metricIds: ["avgApprovalDays"], dimensionIds: [], config: {} },
    ])
    .setLayout({ type: "grid", widgetPlacements: [] })
    .setExportOptions({ supportedExports: ["pdf", "excel", "csv"], supportedSchedules: ["manual", "daily", "weekly"] })
    .save({
      name: "Weekly Operations Report",
      description: "Approval turnaround, overdue items, and workflow activity.",
      owner: DASHBOARD_OWNER,
      tags: ["dashboard", "operations"],
      permissions: ["dashboard.view"],
      aiSummaryEnabled: true,
    });
}

let registeredIds: { executiveReportId: string; operationsReportId: string } | null = null;

/** Safe to call more than once — always returns the same report ids. Seeds one real recurring schedule per report. */
export function registerDashboardReports(registry: ReportRegistry = reportRegistry): { executiveReportId: string; operationsReportId: string } {
  if (registeredIds) return registeredIds;
  const executiveReport = buildExecutiveSummaryReport();
  const operationsReport = buildOperationsReport();
  registerReports([executiveReport, operationsReport], registry);

  reportScheduler.create({ reportId: executiveReport.id, frequency: "weekly", recipients: [DASHBOARD_OWNER], exportFormat: "pdf" });
  reportScheduler.create({ reportId: operationsReport.id, frequency: "weekly", recipients: [DASHBOARD_OWNER], exportFormat: "excel" });

  registeredIds = { executiveReportId: executiveReport.id, operationsReportId: operationsReport.id };
  return registeredIds;
}
