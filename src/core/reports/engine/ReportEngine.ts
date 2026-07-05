/**
 * Calixo Platform - Report Engine
 *
 * Loads, validates, filters, and executes reports against mock datasets.
 * No visualization and no export logic lives here — those are separate,
 * dedicated services (VisualizationEngine, ExportEngine).
 */

import { generateId } from "@/shared/utils/string";
import { reportRegistry, ReportRegistry } from "../registry/ReportRegistry";
import type {
  ReportDataset,
  ReportDatasetColumn,
  ReportDefinition,
  ReportExecutionRecord,
  ReportFilter,
  ReportMetadataSummary,
  ReportValidationResult,
} from "../types";

export class ReportEngine {
  constructor(private registry: ReportRegistry = reportRegistry) {}

  private history: ReportExecutionRecord[] = [];

  load(id: string): ReportDefinition | undefined {
    return this.registry.lookup(id);
  }

  validate(report: ReportDefinition): ReportValidationResult {
    const issues: string[] = [];
    if (!report.name.trim()) issues.push("Report name is required.");
    if (!report.module) issues.push("Report module is required.");
    if (!report.category) issues.push("Report category is required.");
    if (report.metrics.length === 0) issues.push("At least one metric is required.");
    for (const widget of report.widgets) {
      for (const metricId of widget.metricIds) {
        if (!report.metrics.some(m => m.id === metricId)) issues.push(`Widget ${widget.id} references unknown metric: ${metricId}`);
      }
      for (const dimensionId of widget.dimensionIds) {
        if (!report.dimensions.some(d => d.id === dimensionId)) issues.push(`Widget ${widget.id} references unknown dimension: ${dimensionId}`);
      }
    }
    return { valid: issues.length === 0, issues };
  }

  getMetadata(id: string): ReportMetadataSummary | undefined {
    const report = this.registry.lookup(id);
    if (!report) return undefined;
    const lastExecution = this.history.filter(h => h.reportId === id && h.status === "completed").sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))[0];
    return {
      id: report.id,
      name: report.name,
      module: report.module,
      category: report.category,
      widgetCount: report.widgets.length,
      metricCount: report.metrics.length,
      filterCount: report.filters.length,
      lastExecutedAt: lastExecution?.completedAt,
      updatedAt: report.updatedAt,
    };
  }

  applyFilters(dataset: ReportDataset, filters: ReportFilter[]): ReportDataset {
    if (filters.length === 0) return dataset;
    const rows = dataset.rows.filter(row => filters.every(filter => this.matchesFilter(row, filter)));
    return { ...dataset, rows, rowCount: rows.length };
  }

  private matchesFilter(row: Record<string, unknown>, filter: ReportFilter): boolean {
    const value = row[filter.field];
    switch (filter.operator) {
      case "equals":
        return value === filter.value;
      case "not_equals":
        return value !== filter.value;
      case "contains":
        return typeof value === "string" && typeof filter.value === "string" && value.toLowerCase().includes(filter.value.toLowerCase());
      case "gt":
        return typeof value === "number" && typeof filter.value === "number" && value > filter.value;
      case "gte":
        return typeof value === "number" && typeof filter.value === "number" && value >= filter.value;
      case "lt":
        return typeof value === "number" && typeof filter.value === "number" && value < filter.value;
      case "lte":
        return typeof value === "number" && typeof filter.value === "number" && value <= filter.value;
      case "between": {
        const [min, max] = Array.isArray(filter.value) ? filter.value : [undefined, undefined];
        return typeof value === "number" && typeof min === "number" && typeof max === "number" && value >= min && value <= max;
      }
      case "in":
        return Array.isArray(filter.value) && filter.value.includes(value);
      default:
        return true;
    }
  }

  /** Builds a structured mock dataset shaped by the report's declared metrics/dimensions. */
  prepareDataset(report: ReportDefinition, rowCount = 12): ReportDataset {
    const columns: ReportDatasetColumn[] = [
      ...report.dimensions.map(d => ({ id: d.id, label: d.name, kind: "dimension" as const })),
      ...report.metrics.map(m => ({ id: m.id, label: m.name, kind: "metric" as const, format: m.format })),
    ];

    const rows: Record<string, unknown>[] = Array.from({ length: rowCount }, (_, i) => {
      const row: Record<string, unknown> = {};
      for (const dimension of report.dimensions) {
        row[dimension.field] = dimension.type === "time" ? `Period ${i + 1}` : `${dimension.name} ${i + 1}`;
      }
      for (const metric of report.metrics) {
        const magnitude = metric.format === "percent" ? 100 : metric.format === "currency" ? 50000 : 1000;
        row[metric.field] = Math.round(((i + 1) * magnitude) / rowCount + i * 7.3);
      }
      return row;
    });

    return { reportId: report.id, columns, rows, rowCount: rows.length, generatedAt: new Date().toISOString() };
  }

  /** Runs a report end-to-end (load -> validate -> prepare -> filter) and records history. Mock execution — no real data source is queried. */
  async execute(reportId: string, options: { filters?: ReportFilter[] } = {}): Promise<{ record: ReportExecutionRecord; dataset?: ReportDataset }> {
    const startedAt = new Date().toISOString();
    const report = this.load(reportId);

    if (!report) {
      const record: ReportExecutionRecord = { id: generateId(12), reportId, status: "failed", startedAt, completedAt: new Date().toISOString(), error: "Report not found" };
      this.history.push(record);
      return { record };
    }

    const validation = this.validate(report);
    if (!validation.valid) {
      const record: ReportExecutionRecord = {
        id: generateId(12),
        reportId,
        status: "failed",
        startedAt,
        completedAt: new Date().toISOString(),
        error: validation.issues.join("; "),
      };
      this.history.push(record);
      return { record };
    }

    let dataset = this.prepareDataset(report);
    dataset = this.applyFilters(dataset, options.filters ?? report.filters);

    const completedAt = new Date().toISOString();
    const record: ReportExecutionRecord = {
      id: generateId(12),
      reportId,
      status: "completed",
      startedAt,
      completedAt,
      durationMs: new Date(completedAt).getTime() - new Date(startedAt).getTime(),
      rowCount: dataset.rowCount,
    };
    this.history.push(record);
    return { record, dataset };
  }

  getHistory(reportId?: string): ReportExecutionRecord[] {
    return reportId ? this.history.filter(h => h.reportId === reportId) : [...this.history];
  }
}

export const reportEngine = new ReportEngine();
