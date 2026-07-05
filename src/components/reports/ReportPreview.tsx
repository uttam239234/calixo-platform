"use client";

import { REPORT_CATEGORIES } from "@/core/reports";
import type { ReportDefinition } from "@/core/reports";
import { MODULE_OPTIONS } from "./constants";

interface ReportPreviewProps {
  report: Partial<ReportDefinition> | null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-0.5 text-sm text-foreground">{children}</div>
    </div>
  );
}

export function ReportPreview({ report }: ReportPreviewProps) {
  if (!report) {
    return <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>;
  }

  const categoryLabel = report.category ? REPORT_CATEGORIES.find(c => c.id === report.category)?.label ?? report.category : "—";
  const moduleLabel = report.module ? MODULE_OPTIONS.find(m => m.id === report.module)?.label ?? report.module : "—";

  return (
    <div className="card space-y-5 p-5">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Field label="Category">{categoryLabel}</Field>
        <Field label="Module">{moduleLabel}</Field>
        <Field label="Widgets">{report.widgets?.length ?? 0}</Field>
        <Field label="Layout">{report.defaultLayout?.type ?? "—"}</Field>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Metrics ({report.metrics?.length ?? 0})</p>
        <div className="flex flex-wrap gap-1.5">
          {report.metrics && report.metrics.length > 0 ? (
            report.metrics.map(m => (
              <span key={m.id} className="badge badge-primary">
                {m.name} ({m.aggregation})
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">None yet</span>
          )}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Dimensions ({report.dimensions?.length ?? 0})</p>
        <div className="flex flex-wrap gap-1.5">
          {report.dimensions && report.dimensions.length > 0 ? (
            report.dimensions.map(d => (
              <span key={d.id} className="badge badge-secondary">
                {d.name} ({d.type})
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">None yet</span>
          )}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Filters ({report.filters?.length ?? 0})</p>
        <div className="flex flex-wrap gap-1.5">
          {report.filters && report.filters.length > 0 ? (
            report.filters.map(f => (
              <span key={f.id} className="badge badge-outline">
                {f.label || f.field} {f.operator} {String(f.value)}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">None</span>
          )}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Widgets &amp; Layout</p>
        {report.widgets && report.widgets.length > 0 ? (
          <div className="grid grid-cols-4 gap-1.5">
            {report.widgets.map(w => {
              const placement = report.defaultLayout?.widgetPlacements.find(p => p.widgetId === w.id);
              return (
                <div
                  key={w.id}
                  className="rounded-lg border border-border bg-accent/40 p-2 text-center text-[10px] text-muted-foreground"
                  style={{ gridColumn: `span ${placement ? Math.max(1, Math.round(placement.w / 3)) : 2}` }}
                >
                  {w.title}
                </div>
              );
            })}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No widgets yet</span>
        )}
      </div>
    </div>
  );
}
