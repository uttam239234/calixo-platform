/**
 * Calixo Platform - Reports Mock Data Seeding
 *
 * Opt-in only — never called automatically. Populates the registries
 * and engines with realistic demo data (150 reports, 40 templates, 30
 * schedules, 100 exports, 20 dashboards) for development, demos, and
 * future UI work.
 */

import { reportRegistry, ReportRegistry } from "../registry/ReportRegistry";
import { dashboardRegistry, DashboardRegistry } from "../registry/DashboardRegistry";
import { templateRegistry, TemplateRegistry } from "../templates/TemplateRegistry";
import { exportEngine, ExportEngine } from "../export/ExportEngine";
import { reportScheduler, ReportScheduler } from "../scheduler/ReportScheduler";
import { generateMockReports } from "./mockReports";
import { generateMockTemplates } from "./mockTemplates";
import { generateMockSchedules } from "./mockSchedules";
import { generateMockExports } from "./mockExports";
import { generateMockDashboards } from "./mockDashboards";

export interface ReportsMockSeedResult {
  reports: number;
  templates: number;
  schedules: number;
  exports: number;
  dashboards: number;
}

export function seedReportsPlatformMockData(deps: {
  reports?: ReportRegistry;
  dashboards?: DashboardRegistry;
  templates?: TemplateRegistry;
  exports?: ExportEngine;
  scheduler?: ReportScheduler;
} = {}): ReportsMockSeedResult {
  const reportsRegistry = deps.reports ?? reportRegistry;
  const dashboardsRegistry = deps.dashboards ?? dashboardRegistry;
  const templatesRegistry = deps.templates ?? templateRegistry;
  const exportsEngine = deps.exports ?? exportEngine;
  const scheduler = deps.scheduler ?? reportScheduler;

  const reports = generateMockReports(150);
  reportsRegistry.registerMany(reports);
  const reportIds = reports.map(r => r.id);

  const templates = generateMockTemplates(40);
  templatesRegistry.registerMany(templates);

  const schedules = generateMockSchedules(reportIds, 30);
  scheduler.seed(schedules);

  const exportRecords = generateMockExports(reportIds, 100);
  exportsEngine.seed(exportRecords);

  const dashboards = generateMockDashboards(reportIds, 20);
  dashboardsRegistry.registerMany(dashboards);

  return {
    reports: reports.length,
    templates: templates.length,
    schedules: schedules.length,
    exports: exportRecords.length,
    dashboards: dashboards.length,
  };
}
