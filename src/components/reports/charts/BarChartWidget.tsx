"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ReportDefinition, ReportDataset, ReportWidget } from "@/core/reports";
import { resolveWidgetFields } from "./resolveWidgetFields";
import { chartColor, chartText, tooltipContentStyle, tooltipLabelStyle, formatValue } from "./chartTheme";

interface ChartWidgetProps {
  report: ReportDefinition;
  widget: ReportWidget;
  dataset: ReportDataset;
}

export function BarChartWidget({ report, widget, dataset }: ChartWidgetProps) {
  const { dimensionKey, metrics } = resolveWidgetFields(report, widget);
  if (!dimensionKey || metrics.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={dataset.rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} barGap={2} barCategoryGap="20%">
        <CartesianGrid stroke={chartText.grid} strokeDasharray="0" vertical={false} />
        <XAxis dataKey={dimensionKey} tick={{ fill: chartText.secondary, fontSize: 11 }} axisLine={{ stroke: chartText.axis }} tickLine={false} />
        <YAxis tick={{ fill: chartText.secondary, fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
        <Tooltip
          cursor={{ fill: "var(--accent)" }}
          contentStyle={tooltipContentStyle}
          labelStyle={tooltipLabelStyle}
          formatter={(value, name) => [formatValue(Number(value), metrics.find(m => m.label === name)?.format), name]}
        />
        {metrics.length > 1 && <Legend wrapperStyle={{ fontSize: 11, color: chartText.secondary }} iconType="circle" />}
        {metrics.map((m, i) => (
          <Bar key={m.key} dataKey={m.key} name={m.label} fill={chartColor(i)} radius={[4, 4, 0, 0]} maxBarSize={24} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
