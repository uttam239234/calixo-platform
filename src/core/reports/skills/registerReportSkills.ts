/**
 * Calixo Platform - Reports Module AI Skills
 *
 * Registers the Reports module's capabilities into the existing Copilot
 * Skill/Tool registries — no Copilot code is modified. This is metadata
 * only: no handler is wired and no LLM execution happens here, exactly
 * like the Copilot foundation's own default tools.
 */

import { skillRegistry, copilotToolRegistry } from "@/core/copilot";
import type { Skill, PlatformTool } from "@/core/copilot";

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

let registered = false;

/** Safe to call more than once. Registers metadata only — no handlers, no LLM execution. */
export function registerReportSkills(): void {
  if (registered) return;
  for (const tool of REPORT_TOOLS) copilotToolRegistry.register(tool);
  for (const skill of REPORT_SKILLS) skillRegistry.register(skill);
  registered = true;
}
