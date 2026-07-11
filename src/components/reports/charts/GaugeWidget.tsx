"use client";

import { RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import type { ReportDefinition, ReportDataset, ReportWidget } from "@/core/reports";
import { resolveWidgetFields } from "./resolveWidgetFields";
import { chartColor, formatValue } from "./chartTheme";

interface ChartWidgetProps {
  report: ReportDefinition;
  widget: ReportWidget;
  dataset: ReportDataset;
}

export function GaugeWidget({ report, widget, dataset }: ChartWidgetProps) {
  const { metrics } = resolveWidgetFields(report, widget);
  const metric = metrics[0];
  const firstRow = dataset.rows[0];
  if (!metric || !firstRow) return null;

  const raw = Number(firstRow[metric.key]) || 0;
  const max = typeof widget.config.max === "number" ? widget.config.max : metric.format === "percent" ? 100 : raw * 1.5 || 100;
  const percent = Math.min(100, Math.round((raw / max) * 100));

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={180}>
        <RadialBarChart data={[{ value: percent, fill: chartColor(0) }]} innerRadius="72%" outerRadius="100%" startAngle={90} endAngle={-270} barSize={14}>
          <RadialBar dataKey="value" cornerRadius={7} background={{ fill: "var(--accent)" }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-xl font-semibold text-foreground">{formatValue(raw, metric.format)}</p>
        <p className="text-[11px] text-muted-foreground">{metric.label}</p>
      </div>
    </div>
  );
}
