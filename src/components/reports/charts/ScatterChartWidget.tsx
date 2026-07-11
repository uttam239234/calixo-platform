"use client";

import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import type { ReportDefinition, ReportDataset, ReportWidget } from "@/core/reports";
import { resolveWidgetFields } from "./resolveWidgetFields";
import { chartColor, chartText, tooltipContentStyle, tooltipLabelStyle, formatValue } from "./chartTheme";

interface ChartWidgetProps {
  report: ReportDefinition;
  widget: ReportWidget;
  dataset: ReportDataset;
}

export function ScatterChartWidget({ report, widget, dataset }: ChartWidgetProps) {
  const { metrics } = resolveWidgetFields(report, widget);
  const [x, y] = metrics;
  if (!x || !y) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={chartText.grid} strokeDasharray="0" />
        <XAxis type="number" dataKey={x.key} name={x.label} tick={{ fill: chartText.secondary, fontSize: 11 }} axisLine={{ stroke: chartText.axis }} tickLine={false} />
        <YAxis type="number" dataKey={y.key} name={y.label} tick={{ fill: chartText.secondary, fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
        <ZAxis range={[64, 64]} />
        <Tooltip
          cursor={{ strokeDasharray: "0", stroke: chartText.axis }}
          contentStyle={tooltipContentStyle}
          labelStyle={tooltipLabelStyle}
          formatter={(value, name) => [formatValue(Number(value), name === x.label ? x.format : y.format), name]}
        />
        <Scatter data={dataset.rows} fill={chartColor(0)} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
