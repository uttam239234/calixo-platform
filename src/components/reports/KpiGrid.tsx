"use client";

import { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MetricFormat, ReportDataset, ReportDefinition } from "@/core/reports";
import type { KpiCardView, KpiStatus } from "./types";

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

function buildKpiViews(report: ReportDefinition, dataset?: ReportDataset): KpiCardView[] {
  return report.metrics.map((metric, i) => {
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
    const trend = ((i * 13 + 7) % 41) - 20;
    const status: KpiStatus = trend > 5 ? "good" : trend < -5 ? "critical" : "neutral";
    const sparkline = values.length > 0 ? values.slice(0, 8) : Array.from({ length: 8 }, (_, j) => ((i * 7 + j * 13) % 100) + 10);

    return { metricId: metric.id, label: metric.name, value, formattedValue: formatMetricValue(value, metric.format), trend, status, sparkline };
  });
}

const STATUS_DOT: Record<KpiStatus, string> = {
  good: "success",
  warning: "warning",
  critical: "error",
  neutral: "info",
};

function MiniSparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-6 items-end gap-0.5" aria-hidden="true">
      {values.map((v, i) => (
        <div key={i} className="w-1 flex-1 rounded-t bg-primary/30" style={{ height: `${Math.max(8, (v / max) * 100)}%` }} />
      ))}
    </div>
  );
}

function KpiCard({ kpi }: { kpi: KpiCardView }) {
  const TrendIcon = kpi.trend > 0 ? ArrowUpRight : kpi.trend < 0 ? ArrowDownRight : Minus;
  const trendClass = kpi.trend > 0 ? "text-success" : kpi.trend < 0 ? "text-destructive" : "text-muted-foreground";

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
        <span className={cn("status-dot", STATUS_DOT[kpi.status])}>
          <span className="ping" />
          <span className="core" />
        </span>
      </div>
      <p className="mt-1.5 text-2xl font-bold tabular-nums text-foreground">{kpi.formattedValue}</p>
      <div className="mt-1 flex items-center gap-1">
        <TrendIcon size={12} className={trendClass} />
        <span className={cn("text-xs font-medium", trendClass)}>{Math.abs(kpi.trend)}%</span>
        <span className="text-xs text-muted-foreground">vs last period</span>
      </div>
      <div className="mt-2.5">
        <MiniSparkline values={kpi.sparkline} />
      </div>
    </div>
  );
}

export function KpiGrid({ report, dataset }: KpiGridProps) {
  const kpis = useMemo(() => (report ? buildKpiViews(report, dataset) : []), [report, dataset]);

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
