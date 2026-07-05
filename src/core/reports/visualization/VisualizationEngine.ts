/**
 * Calixo Platform - Visualization Engine
 *
 * Architecture only. Describes and validates widget configuration for
 * the 12 supported widget types — it never renders a chart.
 */

import { generateId } from "@/shared/utils/string";
import type { ReportDefinition, ReportWidget, WidgetType, WidgetTypeDefinition, WidgetValidationResult } from "../types";

const WIDGET_CATALOG: Record<WidgetType, WidgetTypeDefinition> = {
  "kpi-card": { type: "kpi-card", label: "KPI Card", description: "A single headline metric with trend indicator", minMetrics: 1, minDimensions: 0, defaultConfig: { showTrend: true } },
  "line-chart": { type: "line-chart", label: "Line Chart", description: "Metric trend across a dimension over time", minMetrics: 1, minDimensions: 1, defaultConfig: { smooth: false } },
  "bar-chart": { type: "bar-chart", label: "Bar Chart", description: "Metric comparison across categories", minMetrics: 1, minDimensions: 1, defaultConfig: { stacked: false } },
  "area-chart": { type: "area-chart", label: "Area Chart", description: "Cumulative metric trend over time", minMetrics: 1, minDimensions: 1, defaultConfig: { stacked: true } },
  "pie-chart": { type: "pie-chart", label: "Pie Chart", description: "Metric share across categories", minMetrics: 1, minDimensions: 1, defaultConfig: { showLegend: true } },
  table: { type: "table", label: "Table", description: "Tabular view of metrics and dimensions", minMetrics: 1, minDimensions: 0, defaultConfig: { pageSize: 10 } },
  heatmap: { type: "heatmap", label: "Heatmap", description: "Metric intensity across two dimensions", minMetrics: 1, minDimensions: 2, defaultConfig: { colorScale: "sequential" } },
  timeline: { type: "timeline", label: "Timeline", description: "Chronological sequence of events", minMetrics: 0, minDimensions: 1, defaultConfig: {} },
  gauge: { type: "gauge", label: "Gauge", description: "A single metric against a target range", minMetrics: 1, minDimensions: 0, defaultConfig: { min: 0, max: 100 } },
  scorecard: { type: "scorecard", label: "Scorecard", description: "A set of metrics graded against targets", minMetrics: 1, minDimensions: 0, defaultConfig: {} },
  funnel: { type: "funnel", label: "Funnel", description: "Sequential stage drop-off visualization", minMetrics: 1, minDimensions: 1, defaultConfig: {} },
  treemap: { type: "treemap", label: "TreeMap", description: "Hierarchical, proportionally sized categories", minMetrics: 1, minDimensions: 1, defaultConfig: {} },
};

export class VisualizationEngine {
  getSupportedWidgetTypes(): WidgetTypeDefinition[] {
    return Object.values(WIDGET_CATALOG);
  }

  getWidgetTypeDefinition(type: WidgetType): WidgetTypeDefinition | undefined {
    return WIDGET_CATALOG[type];
  }

  /** Returns widget configuration only — never a rendered chart. */
  createWidget(params: { type: WidgetType; title: string; metricIds?: string[]; dimensionIds?: string[]; config?: Record<string, unknown> }): ReportWidget {
    const definition = WIDGET_CATALOG[params.type];
    return {
      id: generateId(12),
      type: params.type,
      title: params.title,
      metricIds: params.metricIds ?? [],
      dimensionIds: params.dimensionIds ?? [],
      config: { ...definition.defaultConfig, ...params.config },
    };
  }

  validateWidget(widget: ReportWidget, report: Pick<ReportDefinition, "metrics" | "dimensions">): WidgetValidationResult {
    const definition = WIDGET_CATALOG[widget.type];
    const issues: string[] = [];

    if (!definition) {
      return { valid: false, issues: [`Unknown widget type: ${widget.type}`] };
    }
    if (widget.metricIds.length < definition.minMetrics) {
      issues.push(`${definition.label} requires at least ${definition.minMetrics} metric(s)`);
    }
    if (widget.dimensionIds.length < definition.minDimensions) {
      issues.push(`${definition.label} requires at least ${definition.minDimensions} dimension(s)`);
    }
    for (const metricId of widget.metricIds) {
      if (!report.metrics.some(m => m.id === metricId)) issues.push(`Unknown metric reference: ${metricId}`);
    }
    for (const dimensionId of widget.dimensionIds) {
      if (!report.dimensions.some(d => d.id === dimensionId)) issues.push(`Unknown dimension reference: ${dimensionId}`);
    }

    return { valid: issues.length === 0, issues };
  }
}

export const visualizationEngine = new VisualizationEngine();
