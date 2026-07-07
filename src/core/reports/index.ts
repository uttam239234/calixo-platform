/**
 * Calixo Platform - Enterprise Reports Platform Foundation
 *
 * Reusable, module-agnostic reporting building blocks: registry,
 * execution engine, builder, templates, visualization catalog, export
 * metadata, and scheduling. Modules integrate by calling
 * `registerReports()` — nothing here should ever require modification
 * to support a new module or report type.
 *
 * This is the foundation only: no UI, no real chart rendering, no real
 * file generation, and no real job execution.
 */

import { registerDefaultTemplates } from "./templates/defaultTemplates";

export * from "./types";

export { ReportRegistry, reportRegistry, registerReports } from "./registry/ReportRegistry";
export { DashboardRegistry, dashboardRegistry } from "./registry/DashboardRegistry";
export { ReportEngine, reportEngine } from "./engine/ReportEngine";
export { ReportBuilder } from "./builder/ReportBuilder";
export type { ReportBuilderStage, ReportBuilderSaveInput } from "./builder/ReportBuilder";
export { TemplateRegistry, templateRegistry } from "./templates/TemplateRegistry";
export { registerDefaultTemplates } from "./templates/defaultTemplates";
export { VisualizationEngine, visualizationEngine } from "./visualization/VisualizationEngine";
export { ExportEngine, exportEngine } from "./export/ExportEngine";
export { ReportScheduler, reportScheduler } from "./scheduler/ReportScheduler";
export { registerReportSkills } from "./skills/registerReportSkills";
export { ReportsPlatformAPI, reportsPlatformAPI } from "./platform/ReportsPlatformAPI";

export { seedReportsPlatformMockData } from "./mock/seed";
export type { ReportsMockSeedResult } from "./mock/seed";
export { generateMockReports } from "./mock/mockReports";
export { generateMockTemplates } from "./mock/mockTemplates";
export { generateMockSchedules } from "./mock/mockSchedules";
export { generateMockExports } from "./mock/mockExports";
export { generateMockDashboards } from "./mock/mockDashboards";

let initialized = false;

/** Registers the small foundational set of default templates (one per report category). Safe to call more than once. */
export function initializeReportsFoundation(): void {
  if (initialized) return;
  registerDefaultTemplates();
  initialized = true;
}
