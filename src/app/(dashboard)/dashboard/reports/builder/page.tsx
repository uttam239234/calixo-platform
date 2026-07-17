"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Wrench } from "lucide-react";
import { logReportsError, reportsPlatformAPI } from "@/core/reports";
import type { ReportDataset, ReportDefinition } from "@/core/reports";
import { useReportBuilder } from "@/hooks/useReportBuilder";
import { useReportsContext } from "@/features/reports/ReportsProvider";
import { ReportBuilderPanel } from "@/components/reports/ReportBuilderPanel";
import { ReportsDashboard } from "@/components/reports";
import { ModuleEmptyState } from "@/components/enterprise/module";

/**
 * Advanced-Mode, power-user path — the brief's own "manual, power users" section. Kept structurally
 * as the pre-existing 7-step wizard (already appropriately raw for this audience) with two real
 * fixes: the save owner now comes from the real signed-in user, not a hardcoded demo name, and the
 * widgets step shows a genuine `recharts`-rendered live preview instead of nothing.
 */
export default function ReportBuilderPage() {
  const router = useRouter();
  const { currentUserName, canCreate, recordReportCreated, showToast } = useReportsContext();
  const builder = useReportBuilder();
  const [created, setCreated] = useState<{ report: ReportDefinition; dataset?: ReportDataset } | null>(null);

  if (!canCreate) {
    return (
      <div className="flex items-center justify-center py-24">
        <ModuleEmptyState icon={<Wrench size={32} />} title="You can't create reports" description="Ask a workspace admin to grant the report:create permission." />
      </div>
    );
  }

  async function handleSave(input: Parameters<typeof builder.save>[0]) {
    try {
      const report = builder.save(input);
      recordReportCreated();
      const { dataset } = await reportsPlatformAPI.runReport(report.id);
      setCreated({ report, dataset });
      showToast(`${report.name} saved to your Report Library.`);
    } catch (error) {
      logReportsError("Failed to save report from builder", error);
      showToast("Something went wrong saving that report. Please try again.");
    }
  }

  if (created) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 py-4">
        <div className="flex items-center gap-2 rounded-2xl border border-success/20 bg-success/5 px-4 py-3">
          <CheckCircle2 size={18} className="text-success" />
          <p className="text-sm text-foreground">
            <span className="font-medium">{created.report.name}</span> is saved and ready.
          </p>
        </div>
        <ReportsDashboard report={created.report} dataset={created.dataset} />
        <div className="flex flex-wrap gap-2">
          <button onClick={() => router.push("/dashboard/reports/library")} className="rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:border-primary/30">
            Open in Report Library →
          </button>
          <button onClick={() => router.push("/dashboard/reports/scheduled")} className="rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:border-primary/30">
            Schedule delivery →
          </button>
          <button onClick={() => setCreated(null)} className="rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:border-primary/30">
            Build another report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-4">
      <ReportBuilderPanel
        stage={builder.stage}
        widgetTypes={builder.widgetTypes}
        onSelectData={builder.selectData}
        onSelectMetrics={builder.selectMetrics}
        onApplyFilters={builder.applyFilters}
        onApplyVisualization={builder.applyVisualization}
        onApplyLayout={builder.applyLayout}
        onApplyExportOptions={builder.applyExportOptions}
        onCreateWidget={builder.createWidget}
        onSave={handleSave}
        onCancel={builder.reset}
        defaultOwner={currentUserName}
      />
    </div>
  );
}
