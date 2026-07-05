/**
 * Calixo Platform - Report Builder
 *
 * Reusable pipeline for constructing a ReportDefinition:
 * Select Data -> Select Metrics -> Filters -> Visualization -> Layout ->
 * Export Options -> Save. Each stage is a chainable method; save()
 * returns a plain ReportDefinition. This never registers the report
 * itself — the caller decides whether/where to register it.
 */

import { generateId } from "@/shared/utils/string";
import type { ModuleCategory } from "@/core/modules/ModuleTypes";
import type {
  ExportFormat,
  ReportCategory,
  ReportDefinition,
  ReportDimension,
  ReportFilter,
  ReportLayout,
  ReportMetric,
  ReportWidget,
  ScheduleFrequency,
} from "../types";

export type ReportBuilderStage = "data" | "metrics" | "filters" | "visualization" | "layout" | "export-options" | "save";

interface ReportDraft {
  module?: ModuleCategory;
  category?: ReportCategory;
  dimensions: ReportDimension[];
  metrics: ReportMetric[];
  filters: ReportFilter[];
  widgets: ReportWidget[];
  defaultLayout?: ReportLayout;
  supportedExports: ExportFormat[];
  supportedSchedules: ScheduleFrequency[];
}

export interface ReportBuilderSaveInput {
  name: string;
  description: string;
  owner: string;
  tags?: string[];
  permissions?: string[];
  aiSummaryEnabled?: boolean;
}

function emptyDraft(): ReportDraft {
  return { dimensions: [], metrics: [], filters: [], widgets: [], supportedExports: [], supportedSchedules: [] };
}

export class ReportBuilder {
  private stage: ReportBuilderStage = "data";
  private draft: ReportDraft = emptyDraft();

  static create(): ReportBuilder {
    return new ReportBuilder();
  }

  getStage(): ReportBuilderStage {
    return this.stage;
  }

  reset(): this {
    this.draft = emptyDraft();
    this.stage = "data";
    return this;
  }

  selectData(input: { module: ModuleCategory; category: ReportCategory; dimensions?: ReportDimension[] }): this {
    this.draft.module = input.module;
    this.draft.category = input.category;
    this.draft.dimensions = input.dimensions ?? [];
    this.stage = "metrics";
    return this;
  }

  selectMetrics(metrics: ReportMetric[]): this {
    this.draft.metrics = metrics;
    this.stage = "filters";
    return this;
  }

  setFilters(filters: ReportFilter[]): this {
    this.draft.filters = filters;
    this.stage = "visualization";
    return this;
  }

  setVisualization(widgets: ReportWidget[]): this {
    this.draft.widgets = widgets;
    this.stage = "layout";
    return this;
  }

  setLayout(layout: ReportLayout): this {
    this.draft.defaultLayout = layout;
    this.stage = "export-options";
    return this;
  }

  setExportOptions(options: { supportedExports: ExportFormat[]; supportedSchedules?: ScheduleFrequency[] }): this {
    this.draft.supportedExports = options.supportedExports;
    this.draft.supportedSchedules = options.supportedSchedules ?? [];
    this.stage = "save";
    return this;
  }

  save(input: ReportBuilderSaveInput): ReportDefinition {
    if (!this.draft.module || !this.draft.category) {
      throw new Error("ReportBuilder: selectData() must be called before save()");
    }
    const now = new Date().toISOString();
    const report: ReportDefinition = {
      id: generateId(16),
      name: input.name,
      description: input.description,
      module: this.draft.module,
      category: this.draft.category,
      owner: input.owner,
      tags: input.tags ?? [],
      permissions: input.permissions ?? [],
      widgets: this.draft.widgets,
      filters: this.draft.filters,
      metrics: this.draft.metrics,
      dimensions: this.draft.dimensions,
      defaultLayout: this.draft.defaultLayout ?? { type: "grid", widgetPlacements: [] },
      supportedExports: this.draft.supportedExports,
      supportedSchedules: this.draft.supportedSchedules,
      aiSummaryEnabled: input.aiSummaryEnabled ?? false,
      favorite: false,
      createdAt: now,
      updatedAt: now,
    };
    this.stage = "save";
    return report;
  }
}
