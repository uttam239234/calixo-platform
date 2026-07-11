"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportDefinition, ReportDataset, ReportWidget } from "@/core/reports";
import { resolveWidgetFields } from "./resolveWidgetFields";
import { formatValue } from "./chartTheme";

interface ChartWidgetProps {
  report: ReportDefinition;
  widget: ReportWidget;
  dataset: ReportDataset;
}

const TONE_CLASS = { positive: "text-success", negative: "text-destructive", neutral: "text-muted-foreground" } as const;

export function KpiCardWidget({ report, widget, dataset }: ChartWidgetProps) {
  if (dataset.summary && dataset.summary.length > 0) {
    return (
      <div className="grid grid-cols-2 gap-3 p-1 sm:grid-cols-3">
        {dataset.summary.slice(0, 6).map(item => (
          <div key={item.id} className="rounded-xl bg-accent/30 p-3">
            <p className="text-[11px] text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{item.value}</p>
            {item.change && (
              <p className={cn("mt-0.5 flex items-center gap-0.5 text-[11px]", TONE_CLASS[item.tone ?? "neutral"])}>
                {item.tone === "positive" ? <ArrowUp size={11} /> : item.tone === "negative" ? <ArrowDown size={11} /> : null}
                {item.change}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  const { metrics } = resolveWidgetFields(report, widget);
  const metric = metrics[0];
  const firstRow = dataset.rows[0];
  if (!metric || !firstRow) return <p className="p-4 text-center text-xs text-muted-foreground">No data yet.</p>;

  return (
    <div className="p-1">
      <div className="rounded-xl bg-accent/30 p-3">
        <p className="text-[11px] text-muted-foreground">{metric.label}</p>
        <p className="mt-1 text-lg font-semibold text-foreground">{formatValue(firstRow[metric.key], metric.format)}</p>
      </div>
    </div>
  );
}
