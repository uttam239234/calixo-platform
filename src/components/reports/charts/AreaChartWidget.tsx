"use client";

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ReportDefinition, ReportDataset, ReportWidget } from "@/core/reports";
import { resolveWidgetFields } from "./resolveWidgetFields";
import { chartColor, chartText, tooltipContentStyle, tooltipLabelStyle, formatValue } from "./chartTheme";

interface ChartWidgetProps {
  report: ReportDefinition;
  widget: ReportWidget;
  dataset: ReportDataset;
}

export function AreaChartWidget({ report, widget, dataset }: ChartWidgetProps) {
  const { dimensionKey, metrics } = resolveWidgetFields(report, widget);
  if (!dimensionKey || metrics.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={dataset.rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={chartText.grid} strokeDasharray="0" vertical={false} />
        <XAxis dataKey={dimensionKey} tick={{ fill: chartText.secondary, fontSize: 11 }} axisLine={{ stroke: chartText.axis }} tickLine={false} />
        <YAxis tick={{ fill: chartText.secondary, fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
        <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} formatter={(value, name) => [formatValue(Number(value), metrics.find(m => m.label === name)?.format), name]} />
        {metrics.length > 1 && <Legend wrapperStyle={{ fontSize: 11, color: chartText.secondary }} iconType="plainline" />}
        {metrics.map((m, i) => (
          <Area key={m.key} type="monotone" dataKey={m.key} name={m.label} stroke={chartColor(i)} strokeWidth={2} fill={chartColor(i)} fillOpacity={0.1} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
