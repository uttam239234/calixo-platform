/**
 * Calixo Platform - Default Report Templates
 *
 * One foundational, generic template per report category so the
 * platform is immediately usable. Real modules are expected to
 * contribute richer templates of their own via templateRegistry.register().
 */

import { generateId } from "@/shared/utils/string";
import { REPORT_CATEGORY_MODULE_MAP } from "../types";
import type { ReportCategory, ReportDimension, ReportMetric, ReportTemplate, ReportWidget } from "../types";
import { templateRegistry, TemplateRegistry } from "./TemplateRegistry";

function buildDefaultTemplate(category: ReportCategory, name: string, description: string): ReportTemplate {
  const now = new Date().toISOString();
  const dimension: ReportDimension = { id: generateId(10), name: "Period", field: "period", type: "time" };
  const metric: ReportMetric = { id: generateId(10), name: "Total", field: "total", aggregation: "sum", format: "number" };
  const widgets: ReportWidget[] = [
    { id: generateId(10), type: "kpi-card", title: name, metricIds: [metric.id], dimensionIds: [], config: {} },
    { id: generateId(10), type: "line-chart", title: `${name} Trend`, metricIds: [metric.id], dimensionIds: [dimension.id], config: {} },
  ];

  return {
    id: generateId(16),
    name,
    description,
    module: REPORT_CATEGORY_MODULE_MAP[category],
    category,
    tags: [category, "default"],
    isDefault: true,
    isFavorite: false,
    widgets,
    metrics: [metric],
    dimensions: [dimension],
    defaultLayout: {
      type: "grid",
      widgetPlacements: widgets.map((w, i) => ({ widgetId: w.id, x: (i % 2) * 6, y: Math.floor(i / 2) * 4, w: 6, h: 4 })),
    },
    createdAt: now,
    updatedAt: now,
  };
}

const DEFAULT_TEMPLATE_SEEDS: { category: ReportCategory; name: string; description: string }[] = [
  { category: "executive", name: "Executive Summary", description: "High-level performance overview for leadership" },
  { category: "marketing", name: "Marketing Overview", description: "Campaign and channel performance summary" },
  { category: "analytics", name: "Analytics Overview", description: "Traffic, engagement, and conversion trends" },
  { category: "advertising", name: "Advertising Performance", description: "Ad spend, reach, and ROAS overview" },
  { category: "content", name: "Content Performance", description: "Content output and engagement summary" },
  { category: "seo", name: "SEO Overview", description: "Search visibility and ranking trends" },
  { category: "brand", name: "Brand Health", description: "Brand sentiment and mention volume overview" },
  { category: "social", name: "Social Performance", description: "Social reach, engagement, and growth summary" },
  { category: "workflow", name: "Workflow Throughput", description: "Approval cycle time and completion rates" },
  { category: "assets", name: "Asset Utilization", description: "Asset library usage and reuse summary" },
  { category: "users", name: "User Activity", description: "Active users and adoption trends" },
  { category: "audit", name: "Audit Trail Summary", description: "System activity and compliance overview" },
  { category: "financial", name: "Financial Summary", description: "Budget, spend, and cost efficiency overview" },
  { category: "custom", name: "Custom Report", description: "A blank starting point for a custom report" },
];

export function registerDefaultTemplates(registry: TemplateRegistry = templateRegistry): void {
  for (const seed of DEFAULT_TEMPLATE_SEEDS) {
    registry.register(buildDefaultTemplate(seed.category, seed.name, seed.description));
  }
}
