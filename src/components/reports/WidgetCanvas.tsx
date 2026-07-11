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
  ScatterChart,
  Table2,
  Waves,
} from "lucide-react";
import type { ReportDataset, ReportDefinition, WidgetType } from "@/core/reports";
import { ReportWidgetRenderer } from "./charts/ReportWidgetRenderer";

interface WidgetCanvasProps {
  report: ReportDefinition | null;
  dataset?: ReportDataset;
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
  waterfall: Waves,
  scatter: ScatterChart,
};

export function WidgetCanvas({ report, dataset }: WidgetCanvasProps) {
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

        return (
          <div key={widget.id} className="card overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <Icon size={14} className="flex-shrink-0 text-primary" />
                <p className="truncate text-sm font-medium text-foreground">{widget.title}</p>
              </div>
              <span className="badge badge-outline flex-shrink-0 capitalize">{widget.type.replace("-", " ")}</span>
            </div>
            <div className="p-3">
              <ReportWidgetRenderer report={report} widget={widget} dataset={dataset} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
