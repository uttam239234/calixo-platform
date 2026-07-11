"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ReportDefinition, ReportDataset, ReportWidget } from "@/core/reports";
import { resolveWidgetFields } from "./resolveWidgetFields";
import { chartColor, chartText, tooltipContentStyle, tooltipLabelStyle, formatValue } from "./chartTheme";

interface ChartWidgetProps {
  report: ReportDefinition;
  widget: ReportWidget;
  dataset: ReportDataset;
}

/** No native recharts waterfall — a transparent "base" bar stacked under a visible "delta" bar is the standard technique. */
export function WaterfallChartWidget({ report, widget, dataset }: ChartWidgetProps) {
  const { dimensionKey, metrics } = resolveWidgetFields(report, widget);
  const metric = metrics[0];
  if (!dimensionKey || !metric) return null;

  const data = dataset.rows.reduce<{ name: unknown; base: number; delta: number; positive: boolean; running: number }[]>((acc, row) => {
    const value = Number(row[metric.key]) || 0;
    const previousRunning = acc.length > 0 ? acc[acc.length - 1].running : 0;
    const base = value >= 0 ? previousRunning : previousRunning + value;
    acc.push({ name: row[dimensionKey], base, delta: Math.abs(value), positive: value >= 0, running: previousRunning + value });
    return acc;
  }, []);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} barCategoryGap="20%">
        <CartesianGrid stroke={chartText.grid} strokeDasharray="0" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: chartText.secondary, fontSize: 11 }} axisLine={{ stroke: chartText.axis }} tickLine={false} />
        <YAxis tick={{ fill: chartText.secondary, fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
        <Tooltip
          cursor={{ fill: "var(--accent)" }}
          contentStyle={tooltipContentStyle}
          labelStyle={tooltipLabelStyle}
          formatter={(value, name) => (name === "delta" ? [formatValue(Number(value), metric.format), metric.label] : ["", ""])}
        />
        <Bar dataKey="base" stackId="waterfall" fill="transparent" />
        <Bar dataKey="delta" stackId="waterfall" radius={[4, 4, 0, 0]} maxBarSize={24}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.positive ? chartColor(1) : chartColor(5)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
