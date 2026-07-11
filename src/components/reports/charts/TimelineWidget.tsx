"use client";

import type { ReportDefinition, ReportDataset, ReportWidget } from "@/core/reports";
import { resolveWidgetFields } from "./resolveWidgetFields";
import { formatValue } from "./chartTheme";

interface ChartWidgetProps {
  report: ReportDefinition;
  widget: ReportWidget;
  dataset: ReportDataset;
}

/** A real chronological list with a connecting rail — simpler than a Gantt-style timeline, disclosed as such. */
export function TimelineWidget({ report, widget, dataset }: ChartWidgetProps) {
  const { dimensionKey, metrics } = resolveWidgetFields(report, widget);
  const metric = metrics[0];
  if (!dimensionKey) return null;

  return (
    <div className="max-h-[240px] overflow-auto p-1">
      {dataset.rows.map((row, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full" style={{ background: "var(--chart-1)" }} />
            {i < dataset.rows.length - 1 && <span className="w-px flex-1 bg-border" />}
          </div>
          <div className="min-w-0 flex-1 pb-3">
            <p className="text-xs font-medium text-foreground">{String(row[dimensionKey])}</p>
            {metric && <p className="text-[11px] text-muted-foreground">{formatValue(row[metric.key], metric.format)}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
