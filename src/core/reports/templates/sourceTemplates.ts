/**
 * Calixo Platform - Real-Data Report Templates
 *
 * Builds a `ReportDefinition` per `ReportSourceId`, via the real
 * `ReportBuilder` pipeline (never a shortcut object literal) — shared by
 * the AI Report Assistant (R4) and the 6 Beginner Mode one-click
 * templates (R7), so both paths produce identically-shaped, real-data-bound
 * reports. Dimension/metric `field` names here must match the row keys
 * `ReportDataSourceRouter`'s handlers produce for the same `sourceId`.
 */

import { ReportBuilder } from "../builder/ReportBuilder";
import { REPORT_CATEGORY_MODULE_MAP } from "../types/report";
import type { ReportCategory, ReportDefinition, ReportDimension, ReportMetric, ReportSourceId, ReportWidget } from "../types";
import { visualizationEngine } from "../visualization/VisualizationEngine";

interface SourceTemplateSpec {
  category: ReportCategory;
  name: string;
  description: string;
  dimensions: ReportDimension[];
  metrics: ReportMetric[];
  widgets: (dims: ReportDimension[], mets: ReportMetric[]) => Omit<ReportWidget, "id">[];
}

const SOURCE_TEMPLATES: Record<ReportSourceId, SourceTemplateSpec> = {
  "analytics-executive": {
    category: "executive",
    name: "Executive Summary",
    description: "Real KPIs and revenue trend from Analytics.",
    dimensions: [{ id: "dim-period", field: "period", name: "Period", type: "time" }],
    metrics: [
      { id: "met-revenue", field: "revenue", name: "Revenue", aggregation: "sum", format: "currency" },
      { id: "met-spend", field: "spend", name: "Spend", aggregation: "sum", format: "currency" },
    ],
    widgets: (dims, mets) => [
      { type: "kpi-card", title: "Key Metrics", metricIds: mets.map(m => m.id), dimensionIds: [], config: {} },
      { type: "line-chart", title: "Revenue Trend", metricIds: mets.map(m => m.id), dimensionIds: dims.map(d => d.id), config: {} },
    ],
  },
  "analytics-conversion": {
    category: "marketing",
    name: "Admissions Performance",
    description: "Real conversion funnel and geography breakdown from Analytics.",
    dimensions: [{ id: "dim-region", field: "region", name: "Region", type: "geography" }],
    metrics: [{ id: "met-conversions", field: "conversions", name: "Conversions", aggregation: "sum", format: "number" }],
    widgets: (dims, mets) => [
      { type: "kpi-card", title: "Funnel Stages", metricIds: mets.map(m => m.id), dimensionIds: [], config: {} },
      { type: "bar-chart", title: "Conversions by Region", metricIds: mets.map(m => m.id), dimensionIds: dims.map(d => d.id), config: {} },
      { type: "table", title: "Regional Detail", metricIds: mets.map(m => m.id), dimensionIds: dims.map(d => d.id), config: {} },
    ],
  },
  "ads-performance": {
    category: "advertising",
    name: "Campaign Performance",
    description: "Real spend, ROAS, and conversions per campaign from Ads Manager.",
    dimensions: [{ id: "dim-campaign", field: "campaign", name: "Campaign", type: "category" }],
    metrics: [
      { id: "met-spend", field: "spend", name: "Spend", aggregation: "sum", format: "currency" },
      { id: "met-conversions", field: "conversions", name: "Conversions", aggregation: "sum", format: "number" },
      { id: "met-roas", field: "roas", name: "ROAS", aggregation: "avg", format: "number" },
    ],
    widgets: (dims, mets) => [
      { type: "kpi-card", title: "Performance Summary", metricIds: mets.map(m => m.id), dimensionIds: [], config: {} },
      { type: "bar-chart", title: "Spend by Campaign", metricIds: [mets[0].id], dimensionIds: dims.map(d => d.id), config: {} },
      { type: "table", title: "Campaign Detail", metricIds: mets.map(m => m.id), dimensionIds: dims.map(d => d.id), config: {} },
    ],
  },
  "social-overview": {
    category: "social",
    name: "Social Performance",
    description: "Real reach, followers, and engagement per platform from Social Media.",
    dimensions: [{ id: "dim-platform", field: "platform", name: "Platform", type: "category" }],
    metrics: [
      { id: "met-reach", field: "reach", name: "Reach", aggregation: "sum", format: "number" },
      { id: "met-followers", field: "followers", name: "Followers", aggregation: "sum", format: "number" },
      { id: "met-engagementRate", field: "engagementRate", name: "Engagement Rate", aggregation: "avg", format: "percent" },
    ],
    widgets: (dims, mets) => [
      { type: "kpi-card", title: "Overview", metricIds: mets.map(m => m.id), dimensionIds: [], config: {} },
      { type: "bar-chart", title: "Reach by Platform", metricIds: [mets[0].id], dimensionIds: dims.map(d => d.id), config: {} },
      { type: "pie-chart", title: "Followers by Platform", metricIds: [mets[1].id], dimensionIds: dims.map(d => d.id), config: {} },
    ],
  },
  "reputation-health": {
    category: "brand",
    name: "Brand Health",
    description: "Real sentiment KPIs and mention distribution from Brand Monitoring.",
    dimensions: [{ id: "dim-platform", field: "platform", name: "Platform", type: "category" }],
    metrics: [
      { id: "met-mentions", field: "mentions", name: "Mentions", aggregation: "sum", format: "number" },
      { id: "met-percentage", field: "percentage", name: "Share", aggregation: "avg", format: "percent" },
    ],
    widgets: (dims, mets) => [
      { type: "kpi-card", title: "Brand Health", metricIds: mets.map(m => m.id), dimensionIds: [], config: {} },
      { type: "pie-chart", title: "Mentions by Platform", metricIds: [mets[0].id], dimensionIds: dims.map(d => d.id), config: {} },
    ],
  },
  "content-history": {
    category: "content",
    name: "Content Performance",
    description: "Real generation volume by output type from Content Studio.",
    dimensions: [{ id: "dim-output", field: "output", name: "Output Type", type: "category" }],
    metrics: [{ id: "met-count", field: "count", name: "Generated", aggregation: "sum", format: "number" }],
    widgets: (dims, mets) => [
      { type: "kpi-card", title: "Generation Summary", metricIds: mets.map(m => m.id), dimensionIds: [], config: {} },
      { type: "bar-chart", title: "Generations by Output Type", metricIds: mets.map(m => m.id), dimensionIds: dims.map(d => d.id), config: {} },
    ],
  },
};

export const SOURCE_TEMPLATE_LIST: { sourceId: ReportSourceId; name: string; description: string }[] = (Object.keys(SOURCE_TEMPLATES) as ReportSourceId[]).map(sourceId => ({
  sourceId,
  name: SOURCE_TEMPLATES[sourceId].name,
  description: SOURCE_TEMPLATES[sourceId].description,
}));

export function buildSourceReport(sourceId: ReportSourceId, owner: string): ReportDefinition {
  const spec = SOURCE_TEMPLATES[sourceId];
  const widgets = spec.widgets(spec.dimensions, spec.metrics).map(w => ({ ...visualizationEngine.createWidget({ type: w.type, title: w.title, metricIds: w.metricIds, dimensionIds: w.dimensionIds, config: w.config }) }));

  const report = ReportBuilder.create()
    .selectData({ module: REPORT_CATEGORY_MODULE_MAP[spec.category], category: spec.category, dimensions: spec.dimensions })
    .selectMetrics(spec.metrics)
    .setFilters([])
    .setVisualization(widgets)
    .setLayout({ type: "grid", widgetPlacements: [] })
    .setExportOptions({ supportedExports: ["pdf", "excel", "csv"], supportedSchedules: ["manual", "daily", "weekly", "monthly", "quarterly", "yearly"] })
    .save({ name: spec.name, description: spec.description, owner, tags: [sourceId], aiSummaryEnabled: true });

  report.metadata = { ...report.metadata, sourceId };
  return report;
}
