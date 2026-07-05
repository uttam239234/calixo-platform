/**
 * Calixo Platform - Mock Reports Generator
 *
 * Generates realistic enterprise report definitions using the real
 * ReportBuilder pipeline — not a shortcut object literal — so the mock
 * data doubles as a demonstration of the builder actually working.
 */

import { ReportBuilder } from "../builder/ReportBuilder";
import { generateId } from "@/shared/utils/string";
import { REPORT_CATEGORIES, REPORT_CATEGORY_MODULE_MAP } from "../types";
import type { MetricAggregation, MetricFormat, ReportCategory, ReportDefinition, ReportDimension, ReportMetric, ReportWidget, WidgetType } from "../types";
import { MOCK_OWNERS, MOCK_PERIOD_LABELS, MOCK_REGIONS, pick } from "./data";

const REPORT_NAME_BANK: Record<ReportCategory, string[]> = {
  executive: ["Executive Summary", "Board Performance Review", "Leadership Scorecard", "Strategic Overview"],
  marketing: ["Marketing Performance", "Campaign Effectiveness", "Channel Mix Analysis", "Marketing ROI"],
  analytics: ["Traffic Analytics", "Conversion Funnel Analysis", "User Engagement Report", "Site Analytics Overview"],
  advertising: ["Ad Spend Performance", "ROAS Breakdown", "Campaign Bidding Analysis", "Ad Creative Performance"],
  content: ["Content Performance", "Content Engagement Report", "Editorial Calendar Summary", "Content Velocity"],
  seo: ["SEO Rankings Report", "Organic Search Performance", "Keyword Visibility Report", "Backlink Analysis"],
  brand: ["Brand Sentiment Report", "Brand Mention Volume", "Brand Health Index", "Competitive Brand Analysis"],
  social: ["Social Media Performance", "Follower Growth Report", "Social Engagement Summary", "Platform Comparison"],
  workflow: ["Approval Cycle Time", "Workflow Throughput", "Review Bottleneck Analysis", "Task Completion Report"],
  assets: ["Asset Utilization Report", "Library Usage Summary", "Asset Reuse Analysis", "Storage Utilization"],
  users: ["User Adoption Report", "Active User Trends", "Seat Utilization Report", "User Activity Summary"],
  audit: ["Audit Trail Report", "Compliance Summary", "Access Log Review", "Security Audit Report"],
  financial: ["Budget Utilization Report", "Cost per Acquisition Summary", "Spend Efficiency Report", "Financial Forecast"],
  custom: ["Custom KPI Report", "Ad Hoc Analysis", "Custom Data Export", "Custom Scorecard"],
};

const CATEGORY_METRICS: Record<ReportCategory, { name: string; aggregation: MetricAggregation; format: MetricFormat }[]> = {
  executive: [
    { name: "Revenue", aggregation: "sum", format: "currency" },
    { name: "Growth Rate", aggregation: "avg", format: "percent" },
  ],
  marketing: [
    { name: "Leads Generated", aggregation: "sum", format: "number" },
    { name: "Marketing ROI", aggregation: "avg", format: "percent" },
  ],
  analytics: [
    { name: "Sessions", aggregation: "sum", format: "number" },
    { name: "Conversion Rate", aggregation: "avg", format: "percent" },
  ],
  advertising: [
    { name: "Ad Spend", aggregation: "sum", format: "currency" },
    { name: "ROAS", aggregation: "avg", format: "percent" },
  ],
  content: [
    { name: "Content Published", aggregation: "count", format: "number" },
    { name: "Avg Engagement Rate", aggregation: "avg", format: "percent" },
  ],
  seo: [
    { name: "Organic Traffic", aggregation: "sum", format: "number" },
    { name: "Avg Ranking Position", aggregation: "avg", format: "number" },
  ],
  brand: [
    { name: "Brand Mentions", aggregation: "count", format: "number" },
    { name: "Sentiment Score", aggregation: "avg", format: "percent" },
  ],
  social: [
    { name: "Followers Gained", aggregation: "sum", format: "number" },
    { name: "Engagement Rate", aggregation: "avg", format: "percent" },
  ],
  workflow: [
    { name: "Tasks Completed", aggregation: "count", format: "number" },
    { name: "Avg Cycle Time", aggregation: "avg", format: "duration" },
  ],
  assets: [
    { name: "Assets Used", aggregation: "count", format: "number" },
    { name: "Storage Consumed", aggregation: "sum", format: "number" },
  ],
  users: [
    { name: "Active Users", aggregation: "count", format: "number" },
    { name: "Adoption Rate", aggregation: "avg", format: "percent" },
  ],
  audit: [
    { name: "Audit Events", aggregation: "count", format: "number" },
    { name: "Compliance Score", aggregation: "avg", format: "percent" },
  ],
  financial: [
    { name: "Total Spend", aggregation: "sum", format: "currency" },
    { name: "Cost per Acquisition", aggregation: "avg", format: "currency" },
  ],
  custom: [
    { name: "Custom Metric", aggregation: "sum", format: "number" },
    { name: "Custom Rate", aggregation: "avg", format: "percent" },
  ],
};

const CHART_TYPES: WidgetType[] = ["line-chart", "bar-chart", "area-chart"];

function toField(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export function generateMockReports(count = 150): ReportDefinition[] {
  const reports: ReportDefinition[] = [];

  for (let i = 0; i < count; i++) {
    const category = REPORT_CATEGORIES[i % REPORT_CATEGORIES.length].id;
    const baseName = pick(REPORT_NAME_BANK[category], i);
    const modifier = i % 3 === 0 ? pick(MOCK_REGIONS, i) : pick(MOCK_PERIOD_LABELS, i);
    const name = `${baseName} — ${modifier}`;

    const dimension: ReportDimension = { id: generateId(10), name: "Period", field: "period", type: "time" };
    const metrics: ReportMetric[] = CATEGORY_METRICS[category].map(m => ({
      id: generateId(10),
      name: m.name,
      field: toField(m.name),
      aggregation: m.aggregation,
      format: m.format,
    }));

    const widgets: ReportWidget[] = [
      { id: generateId(10), type: "kpi-card", title: metrics[0].name, metricIds: [metrics[0].id], dimensionIds: [], config: {} },
      {
        id: generateId(10),
        type: pick(CHART_TYPES, i),
        title: `${baseName} Trend`,
        metricIds: metrics.map(m => m.id),
        dimensionIds: [dimension.id],
        config: {},
      },
      { id: generateId(10), type: "table", title: "Detail", metricIds: metrics.map(m => m.id), dimensionIds: [dimension.id], config: {} },
    ];

    const report = ReportBuilder.create()
      .selectData({ module: REPORT_CATEGORY_MODULE_MAP[category], category, dimensions: [dimension] })
      .selectMetrics(metrics)
      .setFilters([])
      .setVisualization(widgets)
      .setLayout({
        type: "grid",
        widgetPlacements: widgets.map((w, wi) => ({ widgetId: w.id, x: (wi % 2) * 6, y: Math.floor(wi / 2) * 4, w: 6, h: 4 })),
      })
      .setExportOptions({ supportedExports: ["pdf", "csv", "excel"], supportedSchedules: ["manual", "weekly", "monthly"] })
      .save({
        name,
        description: `${baseName} for ${modifier}.`,
        owner: pick(MOCK_OWNERS, i),
        tags: [category, modifier.toLowerCase()],
        aiSummaryEnabled: i % 4 === 0,
      });

    reports.push(i % 11 === 0 ? { ...report, favorite: true } : report);
  }

  return reports;
}
