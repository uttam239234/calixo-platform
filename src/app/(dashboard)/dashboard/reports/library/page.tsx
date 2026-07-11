"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Copy, LayoutTemplate } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { useReports } from "@/hooks/useReports";
import { useDashboards } from "@/hooks/useDashboards";
import { useTemplates } from "@/hooks/useTemplates";
import { useExports } from "@/hooks/useExports";
import { ReportsSidebar, ReportsHeader, ReportsDashboard, TemplateBrowser, ReportPreview, PropertiesPanel, FilterPanel, ExportPanel, ReportCard } from "@/components/reports";
import type { RightPanelTab } from "@/components/reports";
import type { ReportDashboard } from "@/core/reports";
import { useReportsContext } from "@/features/reports/ReportsProvider";

type CenterView = "report" | "templates" | "archived";

const RIGHT_TABS: { id: RightPanelTab; label: string }[] = [
  { id: "properties", label: "Properties" },
  { id: "filters", label: "Filters" },
  { id: "export", label: "Export" },
  { id: "metadata", label: "Metadata" },
];

export default function ReportLibraryPage() {
  const router = useRouter();
  const { currentUserName, canExport, canManage, recordExport, showToast } = useReportsContext();
  const reports = useReports();
  const dashboards = useDashboards();
  const templates = useTemplates();
  const exportsHook = useExports(reports.currentReportId);

  const [centerView, setCenterView] = useState<CenterView>("report");
  const [rightTab, setRightTab] = useState<RightPanelTab>("properties");
  const [templatePreviewId, setTemplatePreviewId] = useState<string | null>(null);

  const { getHistory, getFilters, currentReportId } = reports;
  const globalHistory = useMemo(() => getHistory(), [getHistory]);
  const currentFilters = useMemo(() => (currentReportId ? getFilters(currentReportId) : []), [currentReportId, getFilters]);
  const archived = useMemo(() => reports.listArchived(), [reports]);

  const handleSelectReport = useCallback(
    (id: string) => {
      reports.selectReport(id);
      setCenterView("report");
      reports.executeReport(id);
    },
    [reports]
  );

  const handleSelectDashboard = useCallback(
    (dashboard: ReportDashboard) => {
      if (dashboard.reportIds.length === 0) return;
      handleSelectReport(dashboard.reportIds[0]);
    },
    [handleSelectReport]
  );

  const handleCloneTemplate = useCallback((id: string) => templates.clone(id), [templates]);
  const handlePreviewTemplate = useCallback((id: string) => setTemplatePreviewId(id), []);
  const templatePreviewDraft = templatePreviewId ? templates.toReportDraft(templatePreviewId) : undefined;

  const handleExport = useCallback(
    (format: Parameters<typeof exportsHook.requestExport>[0]) => {
      if (!canExport) {
        showToast("You don't have permission to export reports.");
        return;
      }
      exportsHook.requestExport(format, currentUserName);
      recordExport();
      showToast(`Export requested (${format.toUpperCase()}).`);
    },
    [canExport, currentUserName, exportsHook, recordExport, showToast]
  );

  const handleArchive = useCallback(
    (id: string) => {
      if (!canManage) return;
      reports.archiveReport(id);
      showToast("Report archived.");
    },
    [canManage, reports, showToast]
  );

  const handleUnarchive = useCallback(
    (id: string) => {
      reports.unarchiveReport(id);
      showToast("Report restored.");
    },
    [reports, showToast]
  );

  return (
    <div className="flex h-[calc(100vh-11rem)] gap-4">
      <div className="flex w-[280px] flex-shrink-0 flex-col gap-2">
        <div className="flex gap-1.5">
          <Button size="xs" variant={centerView === "templates" ? "primary" : "outline"} onClick={() => setCenterView(v => (v === "templates" ? "report" : "templates"))} className="flex-1 gap-1">
            <LayoutTemplate size={11} /> Templates
          </Button>
          <Button size="xs" variant={centerView === "archived" ? "primary" : "outline"} onClick={() => setCenterView(v => (v === "archived" ? "report" : "archived"))} className="flex-1 gap-1">
            <Archive size={11} /> Archived ({archived.length})
          </Button>
        </div>
        <ReportsSidebar
          reports={reports.reports}
          favorites={reports.favorites}
          recent={reports.recent}
          dashboards={dashboards.dashboards}
          history={globalHistory}
          currentReportId={reports.currentReportId}
          onSelectReport={handleSelectReport}
          onToggleFavorite={reports.toggleFavorite}
          onSelectDashboard={handleSelectDashboard}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col rounded-3xl border border-border bg-card">
        <ReportsHeader
          report={reports.currentReport}
          mode="view"
          onNewReport={() => router.push("/dashboard/reports/builder")}
          onToggleFavorite={reports.toggleFavorite}
          onDuplicate={id => reports.duplicateReport(id)}
          onPreview={() => reports.currentReportId && reports.executeReport(reports.currentReportId)}
          onExport={() => setRightTab("export")}
          onSchedule={() => router.push("/dashboard/reports/scheduled")}
        />

        <div className="scrollbar-thin flex-1 overflow-y-auto p-5">
          {centerView === "templates" ? (
            <div className="space-y-4">
              {templatePreviewId && templatePreviewDraft && (
                <Card>
                  <CardHeader
                    title="Template Preview"
                    action={
                      <button type="button" onClick={() => setTemplatePreviewId(null)} className="text-xs text-muted-foreground hover:text-foreground">
                        Close
                      </button>
                    }
                  />
                  <CardContent>
                    <ReportPreview report={templatePreviewDraft} />
                  </CardContent>
                </Card>
              )}
              <TemplateBrowser templates={templates.templates} onClone={handleCloneTemplate} onPreview={handlePreviewTemplate} onToggleFavorite={templates.toggleFavorite} />
            </div>
          ) : centerView === "archived" ? (
            <div className="space-y-1.5">
              {archived.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No archived reports.</p>
              ) : (
                archived.map(report => (
                  <div key={report.id} className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <ReportCard report={report} isActive={report.id === reports.currentReportId} onSelect={handleSelectReport} compact />
                    </div>
                    <Button size="xs" variant="outline" onClick={() => handleUnarchive(report.id)} className="flex-shrink-0 gap-1">
                      <ArchiveRestore size={11} /> Restore
                    </Button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <ReportsDashboard report={reports.currentReport} dataset={reports.dataset} executing={reports.executing} />
          )}
        </div>
      </div>

      <div className="w-[300px] flex-shrink-0 rounded-3xl border border-border bg-card">
        <div className="flex border-b border-border/60 px-2 pt-2">
          {RIGHT_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRightTab(tab.id)}
              className={
                rightTab === tab.id
                  ? "rounded-t-xl border-b-2 border-primary px-2.5 py-2 text-[11px] font-semibold text-primary"
                  : "rounded-t-xl px-2.5 py-2 text-[11px] font-medium text-muted-foreground hover:text-foreground"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="scrollbar-thin h-[calc(100%-42px)] overflow-y-auto p-4">
          {rightTab === "properties" && (
            <div className="space-y-3">
              <PropertiesPanel report={reports.currentReport} section="properties" />
              {reports.currentReport && canManage && (
                reports.currentReport.archived ? (
                  <Button size="sm" variant="outline" onClick={() => handleUnarchive(reports.currentReport!.id)} className="w-full gap-1.5">
                    <ArchiveRestore size={13} /> Restore Report
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => handleArchive(reports.currentReport!.id)} className="w-full gap-1.5">
                    <Archive size={13} /> Archive Report
                  </Button>
                )
              )}
              {reports.currentReport && (
                <Button size="sm" variant="ghost" onClick={() => reports.duplicateReport(reports.currentReport!.id)} className="w-full gap-1.5">
                  <Copy size={13} /> Duplicate
                </Button>
              )}
            </div>
          )}
          {rightTab === "metadata" && <PropertiesPanel report={reports.currentReport} metadata={reports.metadata} section="metadata" />}
          {rightTab === "filters" && <FilterPanel filters={currentFilters} onApply={reports.applyFiltersToDataset} />}
          {rightTab === "export" && <ExportPanel formats={exportsHook.formats} history={exportsHook.history} onExport={handleExport} />}
        </div>
      </div>
    </div>
  );
}
