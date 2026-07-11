"use client";

import { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MetricFormat, ReportDataset, ReportDefinition } from "@/core/reports";
import type { KpiCardView } from "./types";

interface KpiGridProps {
  report: ReportDefinition | null;
  dataset?: ReportDataset;
}

function formatMetricValue(value: number, format: MetricFormat): string {
  switch (format) {
    case "percent":
      return `${value.toFixed(1)}%`;
    case "currency":
      return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    case "duration":
      return `${value.toFixed(0)}m`;
    default:
      return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
}

/** Real aggregation only — no fabricated trend/comparison. A single-snapshot aggregation has no real prior-period value to diff against, so unlike `dataset.summary` (a real facade's own change values), this path shows the value alone. */
function buildFallbackKpiViews(report: ReportDefinition, dataset?: ReportDataset): KpiCardView[] {
  return report.metrics.map(metric => {
    const values = (dataset?.rows ?? []).map(row => Number(row[metric.field]) || 0);
    let value = 0;
    if (values.length > 0) {
      const total = values.reduce((sum, v) => sum + v, 0);
      if (metric.aggregation === "avg") value = total / values.length;
      else if (metric.aggregation === "count") value = values.length;
      else if (metric.aggregation === "min") value = Math.min(...values);
      else if (metric.aggregation === "max") value = Math.max(...values);
      else value = total;
    }
    return { metricId: metric.id, label: metric.name, formattedValue: formatMetricValue(value, metric.format) };
  });
}

function KpiCard({ kpi }: { kpi: KpiCardView }) {
  const trendClass = kpi.tone === "positive" ? "text-success" : kpi.tone === "negative" ? "text-destructive" : "text-muted-foreground";
  const TrendIcon = kpi.tone === "positive" ? ArrowUpRight : kpi.tone === "negative" ? ArrowDownRight : null;

  return (
    <div className="card p-4">
      <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
      <p className="mt-1.5 text-2xl font-bold tabular-nums text-foreground">{kpi.formattedValue}</p>
      {kpi.change ? (
        <div className="mt-1 flex items-center gap-1">
          {TrendIcon && <TrendIcon size={12} className={trendClass} />}
          <span className={cn("text-xs font-medium", trendClass)}>{kpi.change}</span>
        </div>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">No prior-period comparison available</p>
      )}
    </div>
  );
}

export function KpiGrid({ report, dataset }: KpiGridProps) {
  const kpis = useMemo<KpiCardView[]>(() => {
    if (dataset?.summary && dataset.summary.length > 0) {
      return dataset.summary.map(item => ({ metricId: item.id, label: item.label, formattedValue: item.value, change: item.change, tone: item.tone }));
    }
    return report ? buildFallbackKpiViews(report, dataset) : [];
  }, [report, dataset]);

  if (!report) return null;

  if (kpis.length === 0) {
    return <p className="text-sm text-muted-foreground">This report has no metrics yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {kpis.map(kpi => (
        <KpiCard key={kpi.metricId} kpi={kpi} />
      ))}
    </div>
  );
}
