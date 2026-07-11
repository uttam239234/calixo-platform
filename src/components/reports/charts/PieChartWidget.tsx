"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ReportDefinition, ReportDataset, ReportWidget } from "@/core/reports";
import { resolveWidgetFields } from "./resolveWidgetFields";
import { chartColor, tooltipContentStyle, tooltipLabelStyle, formatValue } from "./chartTheme";

interface ChartWidgetProps {
  report: ReportDefinition;
  widget: ReportWidget;
  dataset: ReportDataset;
}

export function PieChartWidget({ report, widget, dataset }: ChartWidgetProps) {
  const { dimensionKey, metrics } = resolveWidgetFields(report, widget);
  const metric = metrics[0];
  if (!dimensionKey || !metric) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} formatter={value => formatValue(Number(value), metric.format)} />
        <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
        <Pie data={dataset.rows} dataKey={metric.key} nameKey={dimensionKey} innerRadius={48} outerRadius={80} paddingAngle={2} stroke="var(--card)" strokeWidth={2}>
          {dataset.rows.map((_, i) => (
            <Cell key={i} fill={chartColor(i)} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
