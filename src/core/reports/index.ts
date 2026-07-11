/**
 * Calixo Platform - Enterprise Reports Platform Foundation
 *
 * Reusable, module-agnostic reporting building blocks: registry,
 * execution engine, data source router, builder, templates, visualization
 * catalog, export metadata, and scheduling. Modules integrate by calling
 * `registerReports()` — nothing here should ever require modification
 * to support a new module or report type.
 *
 * `ReportDataSourceRouter` fetches real data from the owning module's
 * platform facade for any report tagged with a source binding; real chart
 * rendering lives in `src/components/reports/charts/`. No real file
 * generation and no real job execution — those stay architecture-only.
 */

import { registerDefaultTemplates } from "./templates/defaultTemplates";
import { registerReportsUsageTypes } from "./commercial/ReportsUsageAdapter";

export * from "./types";

export { ReportRegistry, reportRegistry, registerReports } from "./registry/ReportRegistry";
export { DashboardRegistry, dashboardRegistry } from "./registry/DashboardRegistry";
export { ReportEngine, reportEngine } from "./engine/ReportEngine";
export { ReportDataSourceRouter, reportDataSourceRouter } from "./engine/ReportDataSourceRouter";
export { reportAssistantEngine } from "./engine/ReportAssistantEngine";
export { ReportBuilder } from "./builder/ReportBuilder";
export type { ReportBuilderStage, ReportBuilderSaveInput } from "./builder/ReportBuilder";
export { TemplateRegistry, templateRegistry } from "./templates/TemplateRegistry";
export { registerDefaultTemplates } from "./templates/defaultTemplates";
export { buildSourceReport, SOURCE_TEMPLATE_LIST } from "./templates/sourceTemplates";
export { VisualizationEngine, visualizationEngine } from "./visualization/VisualizationEngine";
export { ExportEngine, exportEngine } from "./export/ExportEngine";
export { ReportScheduler, reportScheduler } from "./scheduler/ReportScheduler";
export { registerReportSkills } from "./skills/registerReportSkills";
export { ReportsPlatformAPI, reportsPlatformAPI } from "./platform/ReportsPlatformAPI";
export type { ReportsTenantContext } from "./platform/ReportsPlatformAPI";

export { REPORTS_USAGE_TYPES, registerReportsUsageTypes, canUseReportsFeature, recordReportsUsage, getReportsUsageTotal } from "./commercial/ReportsUsageAdapter";
export type { ReportsUsageTenantContext } from "./commercial/ReportsUsageAdapter";
export { logReportsEvent, logReportsError, trackReportsAction, trackReportsTiming } from "./observability/ReportsTelemetry";
export { REPORTS_ORGANIZATION_ID, REPORTS_WORKSPACE_ID, REPORTS_CURRENT_USER_ID } from "./tenant/ReportsTenantDefaults";

export { seedReportsPlatformMockData } from "./mock/seed";
export type { ReportsMockSeedResult } from "./mock/seed";
export { generateMockReports } from "./mock/mockReports";
export { generateMockTemplates } from "./mock/mockTemplates";
export { generateMockSchedules } from "./mock/mockSchedules";
export { generateMockExports } from "./mock/mockExports";
export { generateMockDashboards } from "./mock/mockDashboards";

let initialized = false;

/** Registers the small foundational set of default templates (one per report category) and Reports' Commercial Platform usage types. Safe to call more than once. */
export function initializeReportsFoundation(): void {
  if (initialized) return;
  registerDefaultTemplates();
  registerReportsUsageTypes();
  initialized = true;
}
