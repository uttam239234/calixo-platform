"use client";

import { ResponsiveContainer, Tooltip, Treemap } from "recharts";
import type { ReportDefinition, ReportDataset, ReportWidget } from "@/core/reports";
import { resolveWidgetFields } from "./resolveWidgetFields";
import { chartColor, tooltipContentStyle, tooltipLabelStyle, formatValue } from "./chartTheme";

interface ChartWidgetProps {
  report: ReportDefinition;
  widget: ReportWidget;
  dataset: ReportDataset;
}

export function TreemapWidget({ report, widget, dataset }: ChartWidgetProps) {
  const { dimensionKey, metrics } = resolveWidgetFields(report, widget);
  const metric = metrics[0];
  if (!dimensionKey || !metric) return null;

  const data = dataset.rows.map((row, i) => ({ name: String(row[dimensionKey]), size: Number(row[metric.key]) || 0, fill: chartColor(i) }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <Treemap data={data} dataKey="size" nameKey="name" stroke="var(--card)" fill={chartColor(0)} isAnimationActive={false}>
        <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} formatter={value => formatValue(Number(value), metric.format)} />
      </Treemap>
    </ResponsiveContainer>
  );
}
