"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ReportDefinition, ReportDataset, ReportWidget } from "@/core/reports";
import { resolveWidgetFields } from "./resolveWidgetFields";
import { chartColor, chartText, tooltipContentStyle, tooltipLabelStyle, formatValue } from "./chartTheme";

interface ChartWidgetProps {
  report: ReportDefinition;
  widget: ReportWidget;
  dataset: ReportDataset;
}

export function LineChartWidget({ report, widget, dataset }: ChartWidgetProps) {
  const { dimensionKey, metrics } = resolveWidgetFields(report, widget);
  if (!dimensionKey || metrics.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={dataset.rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={chartText.grid} strokeDasharray="0" vertical={false} />
        <XAxis dataKey={dimensionKey} tick={{ fill: chartText.secondary, fontSize: 11 }} axisLine={{ stroke: chartText.axis }} tickLine={false} />
        <YAxis tick={{ fill: chartText.secondary, fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
        <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} formatter={(value, name) => [formatValue(Number(value), metrics.find(m => m.label === name)?.format), name]} />
        {metrics.length > 1 && <Legend wrapperStyle={{ fontSize: 11, color: chartText.secondary }} iconType="plainline" />}
        {metrics.map((m, i) => (
          <Line key={m.key} type="monotone" dataKey={m.key} name={m.label} stroke={chartColor(i)} strokeWidth={2} dot={{ r: 3, fill: chartColor(i), strokeWidth: 2, stroke: "var(--card)" }} activeDot={{ r: 5 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
