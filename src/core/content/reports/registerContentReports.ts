/**
 * Calixo Platform - Content Studio Reports Integration
 *
 * Registers Content Studio's report definitions into the REAL Reports platform (ReportRegistry)
 * via the existing ReportBuilder pipeline — mirrors `registerReputationReports.ts`. `module:
 * "content"` / `category: "content"` are already valid enum members — no platform edits needed.
 */
import { generateId } from "@/shared/utils/string";
import { ReportBuilder, registerReports, reportRegistry, reportScheduler } from "@/core/reports";
import type { ReportRegistry } from "@/core/reports";

const CONTENT_OWNER = "Content Studio Module";

function buildGenerationSummaryReport() {
  return ReportBuilder.create()
    .selectData({
      module: "content",
      category: "content",
      dimensions: [{ id: generateId(10), name: "Output Kind", field: "kind", type: "category" }],
    })
    .selectMetrics([
      { id: generateId(10), name: "Total Generations", field: "totalGenerations", aggregation: "sum", format: "number" },
      { id: generateId(10), name: "Creative Generations", field: "creativeGenerations", aggregation: "sum", format: "number" },
      { id: generateId(10), name: "Content Generations", field: "contentGenerations", aggregation: "sum", format: "number" },
    ])
    .setFilters([])
    .setVisualization([{ id: generateId(10), type: "table", title: "Generation Summary", metricIds: ["totalGenerations", "creativeGenerations", "contentGenerations"], dimensionIds: ["kind"], config: {} }])
    .setLayout({ type: "grid", widgetPlacements: [] })
    .setExportOptions({ supportedExports: ["pdf", "excel"], supportedSchedules: ["manual", "weekly"] })
    .save({
      name: "Content Generation Summary",
      description: "Volume of creative and content generations produced through Content Studio.",
      owner: CONTENT_OWNER,
      tags: ["content", "generation"],
      permissions: ["content:read"],
      aiSummaryEnabled: true,
    });
}

function buildUsageReport() {
  return ReportBuilder.create()
    .selectData({
      module: "content",
      category: "content",
      dimensions: [{ id: generateId(10), name: "Action", field: "action", type: "category" }],
    })
    .selectMetrics([
      { id: generateId(10), name: "Exports", field: "exportCount", aggregation: "sum", format: "number" },
      { id: generateId(10), name: "Variants", field: "variantCount", aggregation: "sum", format: "number" },
      { id: generateId(10), name: "Translations", field: "translationCount", aggregation: "sum", format: "number" },
    ])
    .setFilters([])
    .setVisualization([{ id: generateId(10), type: "bar-chart", title: "Usage Breakdown", metricIds: ["exportCount", "variantCount", "translationCount"], dimensionIds: ["action"], config: {} }])
    .setLayout({ type: "grid", widgetPlacements: [] })
    .setExportOptions({ supportedExports: ["pdf", "excel", "csv"], supportedSchedules: ["manual", "weekly"] })
    .save({
      name: "Content Studio Usage Report",
      description: "Exports, variants, and translations generated across Content Studio.",
      owner: CONTENT_OWNER,
      tags: ["content", "usage"],
      permissions: ["content:read"],
      aiSummaryEnabled: true,
    });
}

let registeredIds: { generationSummaryReportId: string; usageReportId: string } | null = null;

/** Safe to call more than once — always returns the same report ids, registering only on the first call. */
export function registerContentReports(registry: ReportRegistry = reportRegistry) {
  if (registeredIds) return registeredIds;
  const generationSummaryReport = buildGenerationSummaryReport();
  const usageReport = buildUsageReport();
  registerReports([generationSummaryReport, usageReport], registry);

  reportScheduler.create({ reportId: generationSummaryReport.id, frequency: "weekly", recipients: [CONTENT_OWNER], exportFormat: "pdf" });

  registeredIds = { generationSummaryReportId: generationSummaryReport.id, usageReportId: usageReport.id };
  return registeredIds;
}
