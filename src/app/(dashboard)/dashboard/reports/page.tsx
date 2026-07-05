"use client";

import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useReports } from "@/hooks/useReports";
import { useDashboards } from "@/hooks/useDashboards";
import { useTemplates } from "@/hooks/useTemplates";
import { useReportBuilder } from "@/hooks/useReportBuilder";
import { useSchedules } from "@/hooks/useSchedules";
import { useExports } from "@/hooks/useExports";
import {
  ReportsSidebar,
  ReportsHeader,
  ReportsDashboard,
  TemplateBrowser,
  ReportBuilderPanel,
  ReportPreview,
  PropertiesPanel,
  FilterPanel,
  ExportPanel,
  SchedulePanel,
} from "@/components/reports";
import type { ReportsCenterMode, RightPanelTab } from "@/components/reports";
import { reportRegistry, initializeReportsFoundation, seedReportsPlatformMockData, registerReportSkills } from "@/core/reports";
import type { ReportDashboard } from "@/core/reports";

// Bootstraps the Reports platform with realistic demo data once per
// browser session (idempotent — guarded by the registry's own count).
if (reportRegistry.count() === 0) {
  initializeReportsFoundation();
  seedReportsPlatformMockData();
}
registerReportSkills();

const RIGHT_TABS: { id: RightPanelTab; label: string }[] = [
  { id: "properties", label: "Properties" },
  { id: "filters", label: "Filters" },
  { id: "export", label: "Export" },
  { id: "schedule", label: "Schedule" },
  { id: "metadata", label: "Metadata" },
];

export default function ReportsCenterPage() {
  const reports = useReports();
  const dashboards = useDashboards();
  const templates = useTemplates();
  const builder = useReportBuilder();
  const schedules = useSchedules(reports.currentReportId);
  const allSchedules = useSchedules(null);
  const exports = useExports(reports.currentReportId);

  const [mode, setMode] = useState<ReportsCenterMode>("view");
  const [rightTab, setRightTab] = useState<RightPanelTab>("properties");
  const [browsingTemplates, setBrowsingTemplates] = useState(false);
  const [templatePreviewId, setTemplatePreviewId] = useState<string | null>(null);

  const { getHistory, getFilters, currentReportId } = reports;
  const globalHistory = useMemo(() => getHistory(), [getHistory]);
  const currentFilters = useMemo(() => (currentReportId ? getFilters(currentReportId) : []), [currentReportId, getFilters]);

  const handleNewReport = useCallback(() => {
    builder.reset();
    setBrowsingTemplates(false);
    setMode("build");
  }, [builder]);

  const handleCancelBuild = useCallback(() => {
    builder.reset();
    setMode("view");
  }, [builder]);

  const handleSave = useCallback(
    (input: Parameters<typeof builder.save>[0]) => {
      const saved = builder.save(input);
      reports.refresh();
      reports.selectReport(saved.id);
      setMode("view");
    },
    [builder, reports]
  );

  const handleSelectDashboard = useCallback(
    (dashboard: ReportDashboard) => {
      if (dashboard.reportIds.length === 0) return;
      reports.selectReport(dashboard.reportIds[0]);
      setBrowsingTemplates(false);
      setMode("view");
    },
    [reports]
  );

  const handleCloneTemplate = useCallback(
    (id: string) => {
      templates.clone(id);
    },
    [templates]
  );

  const handlePreviewTemplate = useCallback((id: string) => {
    setTemplatePreviewId(id);
  }, []);

  const templatePreviewDraft = templatePreviewId ? templates.toReportDraft(templatePreviewId) : undefined;

  const handleExecute = useCallback(() => {
    if (reports.currentReportId) reports.executeReport(reports.currentReportId);
  }, [reports]);

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      <ReportsSidebar
        reports={reports.reports}
        favorites={reports.favorites}
        recent={reports.recent}
        dashboards={dashboards.dashboards}
        templates={templates.templates}
        schedules={allSchedules.schedules}
        history={globalHistory}
        currentReportId={reports.currentReportId}
        onSelectReport={id => {
          reports.selectReport(id);
          setBrowsingTemplates(false);
          setMode("view");
          reports.executeReport(id);
        }}
        onToggleFavorite={reports.toggleFavorite}
        onSelectDashboard={handleSelectDashboard}
        onBrowseTemplates={() => {
          setBrowsingTemplates(true);
          setMode("view");
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col rounded-3xl border border-border bg-card">
        <ReportsHeader
          report={reports.currentReport}
          mode={mode}
          onNewReport={handleNewReport}
          onToggleFavorite={reports.toggleFavorite}
          onDuplicate={id => reports.duplicateReport(id)}
          onPreview={handleExecute}
          onExport={() => setRightTab("export")}
          onSchedule={() => setRightTab("schedule")}
        />

        <div className="scrollbar-thin flex-1 overflow-y-auto p-5">
          {browsingTemplates ? (
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
          ) : mode === "build" ? (
            <div className="space-y-4">
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
                onCancel={handleCancelBuild}
              />
              <div>
                <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live Preview</h2>
                <ReportPreview report={builder.draftPreview} />
              </div>
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
          {rightTab === "properties" && <PropertiesPanel report={reports.currentReport} section="properties" />}
          {rightTab === "metadata" && <PropertiesPanel report={reports.currentReport} metadata={reports.metadata} section="metadata" />}
          {rightTab === "filters" && <FilterPanel filters={currentFilters} onApply={reports.applyFiltersToDataset} />}
          {rightTab === "export" && <ExportPanel formats={exports.formats} history={exports.history} onExport={exports.requestExport} />}
          {rightTab === "schedule" && (
            <SchedulePanel schedules={schedules.schedules} onCreate={schedules.createSchedule} onPause={schedules.pause} onResume={schedules.resume} onDelete={schedules.remove} />
          )}
        </div>
      </div>
    </div>
  );
}
