/**
 * Calixo Platform - AI Copilot Reports Integration
 *
 * Registers Copilot's report definitions into the REAL Reports platform
 * (`ReportRegistry`) via the existing `ReportBuilder` pipeline — mirrors
 * `registerContentReports.ts`. Reconciles with the module manifest's
 * existing `ai-usage`/`ai-suggestions` report placeholders rather than
 * duplicating them (those are nav-level descriptions; these are the real,
 * queryable report definitions behind them). `module: "ai"` is already a
 * valid `ModuleCategory`; `category: "custom"` since no `ReportCategory`
 * value names AI/Copilot specifically — no enum edits needed either way.
 */
import { generateId } from "@/shared/utils/string";
import { ReportBuilder, registerReports, reportRegistry } from "@/core/reports";
import type { ReportRegistry } from "@/core/reports";

const COPILOT_OWNER = "AI Copilot Module";

function buildUsageReport() {
  return ReportBuilder.create()
    .selectData({
      module: "ai",
      category: "custom",
      dimensions: [{ id: generateId(10), name: "Agent", field: "agentId", type: "category" }],
    })
    .selectMetrics([
      { id: generateId(10), name: "AI Requests", field: "aiRequests", aggregation: "sum", format: "number" },
      { id: generateId(10), name: "Actions Executed", field: "actionsExecuted", aggregation: "sum", format: "number" },
      { id: generateId(10), name: "Generations", field: "generations", aggregation: "sum", format: "number" },
    ])
    .setFilters([])
    .setVisualization([{ id: generateId(10), type: "table", title: "AI Usage Summary", metricIds: ["aiRequests", "actionsExecuted", "generations"], dimensionIds: ["agentId"], config: {} }])
    .setLayout({ type: "grid", widgetPlacements: [] })
    .setExportOptions({ supportedExports: ["pdf", "csv"], supportedSchedules: ["manual", "weekly"] })
    .save({
      name: "AI Usage Report",
      description: "AI Copilot requests, executed actions, and generations by specialist agent.",
      owner: COPILOT_OWNER,
      tags: ["ai", "copilot", "usage"],
      permissions: ["ai:read"],
      aiSummaryEnabled: true,
    });
}

function buildActionLogReport() {
  return ReportBuilder.create()
    .selectData({
      module: "ai",
      category: "custom",
      dimensions: [{ id: generateId(10), name: "Action", field: "action", type: "category" }],
    })
    .selectMetrics([
      { id: generateId(10), name: "Actions Requiring Approval", field: "gatedActions", aggregation: "sum", format: "number" },
      { id: generateId(10), name: "Approved", field: "approved", aggregation: "sum", format: "number" },
      { id: generateId(10), name: "Rejected", field: "rejected", aggregation: "sum", format: "number" },
    ])
    .setFilters([])
    .setVisualization([{ id: generateId(10), type: "bar-chart", title: "Action & Approval Log", metricIds: ["gatedActions", "approved", "rejected"], dimensionIds: ["action"], config: {} }])
    .setLayout({ type: "grid", widgetPlacements: [] })
    .setExportOptions({ supportedExports: ["pdf", "csv"], supportedSchedules: ["manual", "weekly"] })
    .save({
      name: "AI Suggestions Log",
      description: "Actions AI Copilot proposed, and whether they were approved or rejected.",
      owner: COPILOT_OWNER,
      tags: ["ai", "copilot", "approvals"],
      permissions: ["ai:read"],
      aiSummaryEnabled: true,
    });
}

let registeredIds: { usageReportId: string; actionLogReportId: string } | null = null;

/** Safe to call more than once — always returns the same report ids, registering only on the first call. */
export function registerCopilotReports(registry: ReportRegistry = reportRegistry) {
  if (registeredIds) return registeredIds;
  const usageReport = buildUsageReport();
  const actionLogReport = buildActionLogReport();
  registerReports([usageReport, actionLogReport], registry);
  registeredIds = { usageReportId: usageReport.id, actionLogReportId: actionLogReport.id };
  return registeredIds;
}
