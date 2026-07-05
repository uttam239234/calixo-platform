"use client";

import { BarChart3 } from "lucide-react";
import type { ReportDataset, ReportDefinition } from "@/core/reports";
import { KpiGrid } from "./KpiGrid";
import { WidgetCanvas } from "./WidgetCanvas";

interface ReportsDashboardProps {
  report: ReportDefinition | null;
  dataset?: ReportDataset;
  executing?: boolean;
}

export function ReportsDashboard({ report, dataset, executing }: ReportsDashboardProps) {
  if (!report) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-ai/20">
          <BarChart3 size={22} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Select a report to get started</p>
          <p className="mt-1 text-xs text-muted-foreground">Choose one from the sidebar, or build a new one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Key Performance Indicators</h2>
          {executing && <span className="text-[10px] text-info">Running…</span>}
        </div>
        <KpiGrid report={report} dataset={dataset} />
      </section>

      <section>
        <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Widgets</h2>
        <WidgetCanvas report={report} />
      </section>
    </div>
  );
}
