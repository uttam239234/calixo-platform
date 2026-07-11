"use client";

import type { ReportDefinition, ReportDataset, ReportWidget } from "@/core/reports";
import { resolveWidgetFields } from "./resolveWidgetFields";
import { formatValue } from "./chartTheme";

interface ChartWidgetProps {
  report: ReportDefinition;
  widget: ReportWidget;
  dataset: ReportDataset;
}

/**
 * A simplified, honest heatmap treatment — a table with cell intensity
 * driven by a single sequential hue (light -> dark), not a full 2D matrix
 * grid. Disclosed in the certification report as simpler than a literal
 * heatmap, matching the depth `ReportDataset`'s flat row shape supports.
 */
export function HeatmapWidget({ report, widget, dataset }: ChartWidgetProps) {
  const { dimensionKey, metrics } = resolveWidgetFields(report, widget);
  const metric = metrics[0];
  if (!dimensionKey || !metric) return null;

  const values = dataset.rows.map(r => Number(r[metric.key]) || 0);
  const max = Math.max(1, ...values);

  return (
    <div className="space-y-1.5 p-1">
      {dataset.rows.map((row, i) => {
        const value = values[i];
        const intensity = Math.max(0.08, value / max);
        return (
          <div key={i} className="flex items-center gap-2">
            <span className="w-28 flex-shrink-0 truncate text-xs text-muted-foreground">{String(row[dimensionKey])}</span>
            <div className="h-6 flex-1 overflow-hidden rounded-md bg-accent/30">
              <div className="flex h-full items-center rounded-md px-2 text-[10px] font-medium text-white" style={{ width: `${Math.max(intensity * 100, 12)}%`, background: "var(--chart-1)", opacity: 0.4 + intensity * 0.6 }}>
                {formatValue(value, metric.format)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
