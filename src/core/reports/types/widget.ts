/**
 * Calixo Platform - Reports Widget Types
 *
 * Widget configuration only — no chart rendering lives here or anywhere
 * in this platform. A ReportWidget is a placed, configured instance; a
 * WidgetTypeDefinition is the catalog entry describing what a widget
 * type supports.
 */

export type WidgetType =
  | "kpi-card"
  | "line-chart"
  | "bar-chart"
  | "area-chart"
  | "pie-chart"
  | "table"
  | "heatmap"
  | "timeline"
  | "gauge"
  | "scorecard"
  | "funnel"
  | "treemap";

export const WIDGET_TYPES: WidgetType[] = [
  "kpi-card",
  "line-chart",
  "bar-chart",
  "area-chart",
  "pie-chart",
  "table",
  "heatmap",
  "timeline",
  "gauge",
  "scorecard",
  "funnel",
  "treemap",
];

export interface WidgetTypeDefinition {
  type: WidgetType;
  label: string;
  description: string;
  minMetrics: number;
  minDimensions: number;
  defaultConfig: Record<string, unknown>;
}

export interface ReportWidget {
  id: string;
  type: WidgetType;
  title: string;
  metricIds: string[];
  dimensionIds: string[];
  config: Record<string, unknown>;
}

export interface WidgetValidationResult {
  valid: boolean;
  issues: string[];
}
