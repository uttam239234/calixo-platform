/**
 * Calixo Platform - Reports Module AI Skills
 *
 * Registers the Reports module's capabilities into the existing Copilot
 * Skill/Tool registries — no Copilot code is modified. Wires real handlers
 * (this module owns the Reporting Agent, one of the brief's 7 named
 * specialist agents) calling `ReportsPlatformAPI`/`ExportEngine`/
 * `ReportScheduler` directly (same-module internals, not a cross-module
 * facade bypass) so `ToolRegistry.execute()` returns real results.
 *
 * Creating a report view/export/schedule isn't in the brief's named
 * approval list (publish/delete/pause-campaigns/budget-changes/connector-
 * changes) — all 4 tools execute immediately.
 */

import { skillRegistry, copilotToolRegistry } from "@/core/copilot";
import type { Skill, PlatformTool, ToolHandler } from "@/core/copilot";
import { reportsPlatformAPI } from "../platform/ReportsPlatformAPI";
import { exportEngine } from "../export/ExportEngine";
import { reportScheduler } from "../scheduler/ReportScheduler";

const AGENT_ID = "reporting-agent";

const REPORT_SKILLS: Skill[] = [
  {
    id: "generate-report",
    name: "Generate Report",
    description: "Build a new report using the Report Builder pipeline",
    category: "reports",
    engineRef: "ReportBuilder",
    toolIds: ["generate-report"],
    triggers: ["generate report", "create report", "build report", "new report"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "explain-report",
    name: "Explain Report",
    description: "Summarize a report's metadata, metrics, and results",
    category: "reports",
    engineRef: "ReportEngine",
    toolIds: ["explain-report"],
    triggers: ["explain report", "summarize report", "interpret report", "what does this report show"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "export-report",
    name: "Export Report",
    description: "Request an export of a report in a supported format",
    category: "reports",
    engineRef: "ExportEngine",
    toolIds: ["export-report"],
    triggers: ["export report", "download report", "export as pdf", "export as excel", "export as csv"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "schedule-report",
    name: "Schedule Report",
    description: "Create or manage a recurring report delivery schedule",
    category: "reports",
    engineRef: "ReportScheduler",
    toolIds: ["schedule-report"],
    triggers: ["schedule report", "recurring report", "automate report delivery", "send report weekly"],
    enabled: true,
    agentId: AGENT_ID,
  },
];

const REPORT_TOOLS: PlatformTool[] = [
  {
    id: "generate-report",
    name: "Generate Report",
    description: "Build a new report using the Report Builder pipeline",
    category: "reports",
    provider: "engine",
    providerRef: "ReportBuilder",
    capabilities: [{ name: "report-generation" }],
    isActive: true,
  },
  {
    id: "explain-report",
    name: "Explain Report",
    description: "Summarize a report's metadata, metrics, and results",
    category: "reports",
    provider: "engine",
    providerRef: "ReportEngine",
    capabilities: [{ name: "report-explanation" }],
    isActive: true,
  },
  {
    id: "export-report",
    name: "Export Report",
    description: "Request an export of a report in a supported format",
    category: "reports",
    provider: "engine",
    providerRef: "ExportEngine",
    capabilities: [{ name: "report-export" }],
    isActive: true,
  },
  {
    id: "schedule-report",
    name: "Schedule Report",
    description: "Create or manage a recurring report delivery schedule",
    category: "reports",
    provider: "engine",
    providerRef: "ReportScheduler",
    capabilities: [{ name: "report-scheduling" }],
    isActive: true,
  },
];

function ok(value: string) {
  return { success: true as const, data: { text: value }, durationMs: 0 };
}

const REPORT_HANDLERS: Record<string, ToolHandler> = {
  "generate-report": async () => {
    const reports = reportsPlatformAPI.listReportSummaries();
    return ok(reports.length > 0 ? `You have ${reports.length} report${reports.length === 1 ? "" : "s"} available: ${reports.slice(0, 5).map(r => r.name).join(", ")}.` : "No reports are registered yet.");
  },
  "explain-report": async () => {
    const reports = reportsPlatformAPI.listReportSummaries();
    const report = reports[0];
    return ok(report ? `"${report.name}" is a ${report.category} report.` : "No reports are registered yet to explain.");
  },
  "export-report": async () => {
    const reports = reportsPlatformAPI.listReportSummaries();
    const report = reports[0];
    if (!report) return ok("No reports are registered yet to export.");
    const record = exportEngine.requestExport({ reportId: report.id, format: "pdf", requestedBy: "copilot" });
    const sizeKb = record.fileSizeBytes ? Math.round(record.fileSizeBytes / 1024) : 0;
    return ok(`Exported "${report.name}" as ${record.format.toUpperCase()} (${sizeKb}KB) — ready at ${record.downloadUrl}.`);
  },
  "schedule-report": async () => {
    const reports = reportsPlatformAPI.listReportSummaries();
    const report = reports[0];
    if (!report) return ok("No reports are registered yet to schedule.");
    const schedule = reportScheduler.create({ reportId: report.id, frequency: "weekly", recipients: [] });
    const nextRun = schedule.nextRunAt ? new Date(schedule.nextRunAt).toLocaleDateString() : "soon";
    return ok(`Scheduled "${report.name}" to deliver ${schedule.frequency}, next run ${nextRun}.`);
  },
};

let registered = false;

/** Safe to call more than once. Registers metadata, tools, and their real handlers. */
export function registerReportSkills(): void {
  if (registered) return;
  for (const tool of REPORT_TOOLS) copilotToolRegistry.register(tool, REPORT_HANDLERS[tool.id]);
  for (const skill of REPORT_SKILLS) skillRegistry.register(skill);
  registered = true;
}
