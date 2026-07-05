/**
 * Calixo Reports Center - UI constants.
 */

import type { ModuleCategory } from "@/core/modules/ModuleTypes";

export const DEMO_OWNER = "Uttam";

export const MODULE_OPTIONS: { id: ModuleCategory; label: string }[] = [
  { id: "core", label: "Core" },
  { id: "marketing", label: "Marketing" },
  { id: "analytics", label: "Analytics" },
  { id: "social", label: "Social" },
  { id: "brand", label: "Brand" },
  { id: "content", label: "Content" },
  { id: "ai", label: "AI" },
  { id: "administration", label: "Administration" },
];

export const AGGREGATION_OPTIONS = [
  { id: "sum", label: "Sum" },
  { id: "avg", label: "Average" },
  { id: "count", label: "Count" },
  { id: "min", label: "Min" },
  { id: "max", label: "Max" },
] as const;

export const METRIC_FORMAT_OPTIONS = [
  { id: "number", label: "Number" },
  { id: "percent", label: "Percent" },
  { id: "currency", label: "Currency" },
  { id: "duration", label: "Duration" },
] as const;

export const DIMENSION_TYPE_OPTIONS = [
  { id: "time", label: "Time" },
  { id: "category", label: "Category" },
  { id: "geography", label: "Geography" },
  { id: "custom", label: "Custom" },
] as const;

export const FILTER_OPERATOR_OPTIONS = [
  { id: "equals", label: "Equals" },
  { id: "not_equals", label: "Not equals" },
  { id: "contains", label: "Contains" },
  { id: "gt", label: "Greater than" },
  { id: "gte", label: "Greater or equal" },
  { id: "lt", label: "Less than" },
  { id: "lte", label: "Less or equal" },
] as const;

export const LAYOUT_TYPE_OPTIONS = [
  { id: "grid", label: "Grid" },
  { id: "single-column", label: "Single Column" },
  { id: "tabs", label: "Tabs" },
] as const;
