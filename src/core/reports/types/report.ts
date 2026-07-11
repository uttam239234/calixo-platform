/**
 * Calixo Platform - Reports Core Types
 */

import type { ModuleCategory } from "@/core/modules/ModuleTypes";
import type { ReportWidget } from "./widget";
import type { ExportFormat } from "./export";
import type { ScheduleFrequency } from "./schedule";

export type ReportCategory =
  | "executive"
  | "marketing"
  | "analytics"
  | "advertising"
  | "content"
  | "seo"
  | "brand"
  | "social"
  | "workflow"
  | "assets"
  | "users"
  | "audit"
  | "financial"
  | "custom";

export const REPORT_CATEGORIES: { id: ReportCategory; label: string }[] = [
  { id: "executive", label: "Executive" },
  { id: "marketing", label: "Marketing" },
  { id: "analytics", label: "Analytics" },
  { id: "advertising", label: "Advertising" },
  { id: "content", label: "Content" },
  { id: "seo", label: "SEO" },
  { id: "brand", label: "Brand" },
  { id: "social", label: "Social" },
  { id: "workflow", label: "Workflow" },
  { id: "assets", label: "Assets" },
  { id: "users", label: "Users" },
  { id: "audit", label: "Audit" },
  { id: "financial", label: "Financial" },
  { id: "custom", label: "Custom" },
];

/** Single source of truth for which platform module a category defaults to — used by default templates and mock generation. */
export const REPORT_CATEGORY_MODULE_MAP: Record<ReportCategory, ModuleCategory> = {
  executive: "core",
  marketing: "marketing",
  analytics: "analytics",
  advertising: "marketing",
  content: "content",
  seo: "content",
  brand: "brand",
  social: "social",
  workflow: "core",
  assets: "core",
  users: "administration",
  audit: "administration",
  financial: "core",
  custom: "core",
};

export type MetricAggregation = "sum" | "avg" | "count" | "min" | "max";
export type MetricFormat = "number" | "percent" | "currency" | "duration";

export interface ReportMetric {
  id: string;
  name: string;
  field: string;
  aggregation: MetricAggregation;
  format: MetricFormat;
}

export type DimensionType = "time" | "category" | "geography" | "custom";

export interface ReportDimension {
  id: string;
  name: string;
  field: string;
  type: DimensionType;
}

export type FilterOperator = "equals" | "not_equals" | "contains" | "gt" | "gte" | "lt" | "lte" | "between" | "in";

export interface ReportFilter {
  id: string;
  field: string;
  label: string;
  operator: FilterOperator;
  value: unknown;
}

export type ReportLayoutType = "grid" | "single-column" | "tabs";

export interface WidgetPlacement {
  widgetId: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ReportLayout {
  type: ReportLayoutType;
  widgetPlacements: WidgetPlacement[];
}

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  module: ModuleCategory;
  category: ReportCategory;
  owner: string;
  tags: string[];
  permissions: string[];
  widgets: ReportWidget[];
  filters: ReportFilter[];
  metrics: ReportMetric[];
  dimensions: ReportDimension[];
  defaultLayout: ReportLayout;
  supportedExports: ExportFormat[];
  supportedSchedules: ScheduleFrequency[];
  aiSummaryEnabled: boolean;
  favorite: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface ReportValidationResult {
  valid: boolean;
  issues: string[];
}

export interface ReportDatasetColumn {
  id: string;
  label: string;
  kind: "metric" | "dimension";
  format?: MetricFormat;
}

export interface ReportKpiSummaryItem {
  id: string;
  label: string;
  value: string;
  change?: string;
  tone?: "positive" | "negative" | "neutral";
}

export interface ReportDataset {
  reportId: string;
  columns: ReportDatasetColumn[];
  rows: Record<string, unknown>[];
  rowCount: number;
  generatedAt: string;
  /** KPI-card tiles for reports backed by a real platform facade (see `ReportDataSourceRouter`) — separate from `rows` since KPI tiles are single current values, not an iterable series. Absent for formula-generated/custom reports. */
  summary?: ReportKpiSummaryItem[];
  /** Set when this dataset came from a real platform facade rather than `ReportEngine`'s deterministic-formula fallback — surfaced in the UI as a "Live data from X" badge. */
  sourceLabel?: string;
}

export type ReportExecutionStatus = "queued" | "running" | "completed" | "failed";

export interface ReportExecutionRecord {
  id: string;
  reportId: string;
  status: ReportExecutionStatus;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  rowCount?: number;
  error?: string;
}

export interface ReportMetadataSummary {
  id: string;
  name: string;
  module: ModuleCategory;
  category: ReportCategory;
  widgetCount: number;
  metricCount: number;
  filterCount: number;
  lastExecutedAt?: string;
  updatedAt: string;
}
