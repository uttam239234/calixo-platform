/**
 * Calixo Platform - Analytics Metric Registry
 *
 * Registry of computable metric DEFINITIONS (id, source field,
 * aggregation, format) — this is the "Custom KPIs / Custom Metrics"
 * extension point. AnalyticsEngine reads the field/aggregation pair to
 * compute a value over the filtered fact rows; nothing here hardcodes an
 * output value.
 */

import { appLogger } from "@/logging";
import type { AnalyticsFact } from "../types";

export type AnalyticsMetricAggregation = "sum" | "avg" | "count";
export type AnalyticsMetricFormat = "currency" | "number" | "percent" | "ratio" | "duration";

export interface AnalyticsMetricDefinition {
  id: string;
  label: string;
  field: keyof AnalyticsFact | "roas" | "cpa" | "conversionRate" | "ctr" | "bounceRate" | "avgSessionDuration";
  aggregation: AnalyticsMetricAggregation;
  format: AnalyticsMetricFormat;
  description?: string;
  custom?: boolean;
}

export class AnalyticsMetricRegistry {
  private metrics: Map<string, AnalyticsMetricDefinition> = new Map();

  register(metric: AnalyticsMetricDefinition): void {
    if (this.metrics.has(metric.id)) {
      appLogger.warn("Analytics.AnalyticsMetricRegistry", `Metric ${metric.id} already registered`);
      return;
    }
    this.metrics.set(metric.id, metric);
    appLogger.info("Analytics.AnalyticsMetricRegistry", `Metric registered: ${metric.label} (${metric.id})`);
  }

  registerMany(metrics: AnalyticsMetricDefinition[]): void {
    for (const metric of metrics) this.register(metric);
  }

  unregister(id: string): void {
    this.metrics.delete(id);
  }

  lookup(id: string): AnalyticsMetricDefinition | undefined {
    return this.metrics.get(id);
  }

  list(): AnalyticsMetricDefinition[] {
    return Array.from(this.metrics.values());
  }

  discover(query: string): AnalyticsMetricDefinition[] {
    const q = query.toLowerCase();
    return this.list().filter(m => m.label.toLowerCase().includes(q) || m.id.toLowerCase().includes(q));
  }

  count(): number {
    return this.metrics.size;
  }
}

export const analyticsMetricRegistry = new AnalyticsMetricRegistry();

const DEFAULT_METRICS: AnalyticsMetricDefinition[] = [
  { id: "revenue", label: "Revenue", field: "revenue", aggregation: "sum", format: "currency" },
  { id: "spend", label: "Marketing Spend", field: "spend", aggregation: "sum", format: "currency" },
  { id: "roas", label: "ROAS", field: "roas", aggregation: "avg", format: "ratio", description: "Return on ad spend (revenue / spend)" },
  { id: "cpa", label: "CPA", field: "cpa", aggregation: "avg", format: "currency", description: "Cost per acquisition (spend / conversions)" },
  { id: "conversion-rate", label: "Conversion Rate", field: "conversionRate", aggregation: "avg", format: "percent" },
  { id: "leads", label: "Leads", field: "leads", aggregation: "sum", format: "number" },
  { id: "conversions", label: "Sales", field: "conversions", aggregation: "sum", format: "number" },
  { id: "sessions", label: "Sessions", field: "sessions", aggregation: "sum", format: "number" },
  { id: "users", label: "Users", field: "users", aggregation: "sum", format: "number" },
  { id: "bounce-rate", label: "Bounce Rate", field: "bounceRate", aggregation: "avg", format: "percent" },
  { id: "avg-session-duration", label: "Average Time", field: "avgSessionDuration", aggregation: "avg", format: "duration" },
];

/** The single integration point future modules use to contribute custom metrics. */
export function registerAnalyticsMetrics(metrics: AnalyticsMetricDefinition[], registry: AnalyticsMetricRegistry = analyticsMetricRegistry): void {
  registry.registerMany(metrics);
}

export function registerDefaultAnalyticsMetrics(registry: AnalyticsMetricRegistry = analyticsMetricRegistry): void {
  registerAnalyticsMetrics(DEFAULT_METRICS, registry);
}
