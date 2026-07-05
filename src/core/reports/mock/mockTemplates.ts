/**
 * Calixo Platform - Mock Templates Generator
 */

import { generateId } from "@/shared/utils/string";
import { REPORT_CATEGORIES, REPORT_CATEGORY_MODULE_MAP } from "../types";
import type { ReportCategory, ReportDimension, ReportMetric, ReportTemplate, ReportWidget } from "../types";
import { pick } from "./data";

const TEMPLATE_VARIANTS: Record<ReportCategory, string[]> = {
  executive: ["Executive Summary", "Board Deck Overview"],
  marketing: ["Marketing Snapshot", "Campaign Retrospective"],
  analytics: ["Analytics Starter", "Funnel Deep Dive"],
  advertising: ["Ad Performance Starter", "Spend Efficiency"],
  content: ["Content Snapshot", "Editorial Performance"],
  seo: ["SEO Starter", "Ranking Watch"],
  brand: ["Brand Pulse", "Sentiment Deep Dive"],
  social: ["Social Snapshot", "Growth Tracker"],
  workflow: ["Workflow Health", "Cycle Time Tracker"],
  assets: ["Asset Usage Starter", "Library Health"],
  users: ["Adoption Starter", "Activity Tracker"],
  audit: ["Compliance Starter", "Access Review"],
  financial: ["Budget Starter", "Spend Tracker"],
  custom: ["Blank Canvas", "Custom Starter"],
};

export function generateMockTemplates(count = 40): ReportTemplate[] {
  const templates: ReportTemplate[] = [];

  for (let i = 0; i < count; i++) {
    const category = REPORT_CATEGORIES[i % REPORT_CATEGORIES.length].id;
    const name = pick(TEMPLATE_VARIANTS[category], i);
    const now = new Date().toISOString();

    const dimension: ReportDimension = { id: generateId(10), name: "Period", field: "period", type: "time" };
    const metric: ReportMetric = { id: generateId(10), name: "Value", field: "value", aggregation: "sum", format: "number" };
    const widgets: ReportWidget[] = [
      { id: generateId(10), type: "kpi-card", title: name, metricIds: [metric.id], dimensionIds: [], config: {} },
      { id: generateId(10), type: "bar-chart", title: `${name} Breakdown`, metricIds: [metric.id], dimensionIds: [dimension.id], config: {} },
    ];

    templates.push({
      id: generateId(16),
      name: `${name} Template`,
      description: `Reusable ${name.toLowerCase()} blueprint for ${category} reporting.`,
      module: REPORT_CATEGORY_MODULE_MAP[category],
      category,
      tags: [category, "template"],
      isDefault: false,
      isFavorite: i % 9 === 0,
      widgets,
      metrics: [metric],
      dimensions: [dimension],
      defaultLayout: {
        type: "grid",
        widgetPlacements: widgets.map((w, wi) => ({ widgetId: w.id, x: (wi % 2) * 6, y: Math.floor(wi / 2) * 4, w: 6, h: 4 })),
      },
      createdAt: now,
      updatedAt: now,
    });
  }

  return templates;
}
