import type { ReportDefinition, ReportWidget } from "@/core/reports";

export interface ResolvedMetric {
  key: string;
  label: string;
  format?: string;
}

export interface ResolvedWidgetFields {
  dimensionKey?: string;
  dimensionLabel?: string;
  metrics: ResolvedMetric[];
}

/**
 * A `ReportWidget` references metrics/dimensions by their report-level `id`;
 * a `ReportDataset` row is keyed by `field` (see `ReportEngine.prepareDataset`'s
 * doc-comment). This is the one place that resolves id -> field so every
 * chart component reads rows the same, correct way.
 */
export function resolveWidgetFields(report: ReportDefinition, widget: ReportWidget): ResolvedWidgetFields {
  const dimension = report.dimensions.find(d => widget.dimensionIds.includes(d.id));
  const metrics = widget.metricIds
    .map(id => report.metrics.find(m => m.id === id))
    .filter((m): m is NonNullable<typeof m> => !!m)
    .map(m => ({ key: m.field, label: m.name, format: m.format }));

  return { dimensionKey: dimension?.field, dimensionLabel: dimension?.name, metrics };
}
