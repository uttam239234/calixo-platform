"use client";

import {
  AreaChart,
  BarChart3,
  ClipboardList,
  CreditCard,
  Funnel,
  Gauge,
  Grid3x3,
  History,
  LayoutGrid,
  LineChart,
  PieChart,
  Table2,
} from "lucide-react";
import type { ReportDefinition, WidgetType } from "@/core/reports";

interface WidgetCanvasProps {
  report: ReportDefinition | null;
}

const WIDGET_ICONS: Record<WidgetType, typeof LineChart> = {
  "kpi-card": CreditCard,
  "line-chart": LineChart,
  "bar-chart": BarChart3,
  "area-chart": AreaChart,
  "pie-chart": PieChart,
  table: Table2,
  heatmap: Grid3x3,
  timeline: History,
  gauge: Gauge,
  scorecard: ClipboardList,
  funnel: Funnel,
  treemap: LayoutGrid,
};

export function WidgetCanvas({ report }: WidgetCanvasProps) {
  if (!report) return null;

  if (report.widgets.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center gap-2 p-10 text-center">
        <LayoutGrid size={22} className="text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">No widgets yet</p>
        <p className="text-xs text-muted-foreground">Use the Report Builder to add visualizations.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {report.widgets.map(widget => {
        const Icon = WIDGET_ICONS[widget.type];
        const metricNames = widget.metricIds.map(id => report.metrics.find(m => m.id === id)?.name).filter((n): n is string => !!n);
        const dimensionNames = widget.dimensionIds.map(id => report.dimensions.find(d => d.id === id)?.name).filter((n): n is string => !!n);

        return (
          <div key={widget.id} className="card overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <Icon size={14} className="flex-shrink-0 text-primary" />
                <p className="truncate text-sm font-medium text-foreground">{widget.title}</p>
              </div>
              <span className="badge badge-outline flex-shrink-0 capitalize">{widget.type.replace("-", " ")}</span>
            </div>
            <div className="flex h-32 flex-col items-center justify-center gap-1 bg-[repeating-linear-gradient(135deg,var(--accent)_0px,var(--accent)_8px,transparent_8px,transparent_16px)] text-center">
              <Icon size={20} className="text-muted-foreground/50" />
              <p className="text-[11px] text-muted-foreground">{widget.type.replace("-", " ")} placeholder</p>
            </div>
            <div className="space-y-1 border-t border-border/60 px-4 py-2.5 text-[11px] text-muted-foreground">
              {metricNames.length > 0 && (
                <p>
                  <span className="font-medium text-foreground">Metrics:</span> {metricNames.join(", ")}
                </p>
              )}
              {dimensionNames.length > 0 && (
                <p>
                  <span className="font-medium text-foreground">Dimensions:</span> {dimensionNames.join(", ")}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
