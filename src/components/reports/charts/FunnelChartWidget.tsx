"use client";

import { Cell, Funnel, FunnelChart, LabelList, ResponsiveContainer, Tooltip } from "recharts";
import type { ReportDefinition, ReportDataset, ReportWidget } from "@/core/reports";
import { resolveWidgetFields } from "./resolveWidgetFields";
import { chartColor, tooltipContentStyle, tooltipLabelStyle, formatValue } from "./chartTheme";

interface ChartWidgetProps {
  report: ReportDefinition;
  widget: ReportWidget;
  dataset: ReportDataset;
}

export function FunnelChartWidget({ report, widget, dataset }: ChartWidgetProps) {
  const { dimensionKey, metrics } = resolveWidgetFields(report, widget);
  const metric = metrics[0];
  if (!dimensionKey || !metric) return null;

  const data = dataset.rows.map(row => ({ name: String(row[dimensionKey]), value: row[metric.key] }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <FunnelChart margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
        <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} formatter={value => formatValue(Number(value), metric.format)} />
        <Funnel data={data} dataKey="value" nameKey="name" isAnimationActive={false}>
          <LabelList position="right" dataKey="name" style={{ fill: "var(--foreground)", fontSize: 11 }} />
          {data.map((_, i) => (
            <Cell key={i} fill={chartColor(i)} stroke="var(--card)" strokeWidth={2} />
          ))}
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}
