"use client";

import type { ReportDefinition, ReportDataset, ReportWidget } from "@/core/reports";
import { LineChartWidget } from "./LineChartWidget";
import { BarChartWidget } from "./BarChartWidget";
import { AreaChartWidget } from "./AreaChartWidget";
import { PieChartWidget } from "./PieChartWidget";
import { TableWidget } from "./TableWidget";
import { FunnelChartWidget } from "./FunnelChartWidget";
import { WaterfallChartWidget } from "./WaterfallChartWidget";
import { ScatterChartWidget } from "./ScatterChartWidget";
import { KpiCardWidget } from "./KpiCardWidget";
import { GaugeWidget } from "./GaugeWidget";
import { TreemapWidget } from "./TreemapWidget";
import { HeatmapWidget } from "./HeatmapWidget";
import { TimelineWidget } from "./TimelineWidget";

interface ReportWidgetRendererProps {
  report: ReportDefinition;
  widget: ReportWidget;
  dataset?: ReportDataset;
}

/** Real chart rendering, replacing the striped "{type} placeholder" box every widget used to render. Every `WidgetType` maps to a genuine, data-driven component. */
export function ReportWidgetRenderer({ report, widget, dataset }: ReportWidgetRendererProps) {
  if (!dataset) {
    return <p className="p-6 text-center text-xs text-muted-foreground">Run the report to see this widget.</p>;
  }
  if (dataset.rows.length === 0 && widget.type !== "kpi-card" && widget.type !== "scorecard") {
    return <p className="p-6 text-center text-xs text-muted-foreground">No data for this widget yet.</p>;
  }

  switch (widget.type) {
    case "line-chart":
      return <LineChartWidget report={report} widget={widget} dataset={dataset} />;
    case "bar-chart":
      return <BarChartWidget report={report} widget={widget} dataset={dataset} />;
    case "area-chart":
      return <AreaChartWidget report={report} widget={widget} dataset={dataset} />;
    case "pie-chart":
      return <PieChartWidget report={report} widget={widget} dataset={dataset} />;
    case "table":
      return <TableWidget dataset={dataset} />;
    case "funnel":
      return <FunnelChartWidget report={report} widget={widget} dataset={dataset} />;
    case "waterfall":
      return <WaterfallChartWidget report={report} widget={widget} dataset={dataset} />;
    case "scatter":
      return <ScatterChartWidget report={report} widget={widget} dataset={dataset} />;
    case "kpi-card":
    case "scorecard":
      return <KpiCardWidget report={report} widget={widget} dataset={dataset} />;
    case "gauge":
      return <GaugeWidget report={report} widget={widget} dataset={dataset} />;
    case "treemap":
      return <TreemapWidget report={report} widget={widget} dataset={dataset} />;
    case "heatmap":
      return <HeatmapWidget report={report} widget={widget} dataset={dataset} />;
    case "timeline":
      return <TimelineWidget report={report} widget={widget} dataset={dataset} />;
    default:
      return <TableWidget dataset={dataset} />;
  }
}
