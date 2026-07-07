"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import WelcomeHero from "./WelcomeHero";
import KpiGrid from "./KpiGrid";
import GoalsScorecard from "@/components/platform/goals/GoalsScorecard";
import MarketingPerformanceChart from "./MarketingPerformanceChart";
import ChannelOverview from "./ChannelOverview";
import QuickActions from "./QuickActions";
import PendingApprovals from "./PendingApprovals";
import RecentActivity from "./RecentActivity";
import AiRecommendations from "./AiRecommendations";
import UpcomingTasks from "./UpcomingTasks";
import ConnectedPlatforms from "./ConnectedPlatforms";
import DashboardReportsPanel from "./DashboardReportsPanel";
import DashboardSwitcher from "@/components/platform/dashboardBuilder/DashboardSwitcher";
import WidgetLibraryPanel from "@/components/platform/dashboardBuilder/WidgetLibraryPanel";
import CommandPalette from "./CommandPalette";
import { motion, type Variants } from "framer-motion";
import { useDashboard } from "@/hooks/useDashboard";
import { useNotifications } from "@/hooks/useNotifications";
import { useDashboardLayouts } from "@/hooks/useDashboardLayouts";
import { useGoals } from "@/hooks/useGoals";
import { useReports } from "@/hooks/useReports";
import { useSchedules } from "@/hooks/useSchedules";
import { useExports } from "@/hooks/useExports";
import { initializeDashboardFoundation, registerDashboardSkills, registerDashboardReports, DASHBOARD_WIDGET_CATALOG } from "@/core/dashboard";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, LayoutGrid, Lock, Unlock } from "lucide-react";
import type { DashboardWidgetKey } from "@/core/dashboard";

const DASHBOARD_WIDGET_GROUPS = ["Overview", "Performance", "Operations", "AI", "Integrations"] as const;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export default function DashboardShell() {
  const [loading, setLoading] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [reportIds, setReportIds] = useState<{ executiveReportId: string; operationsReportId: string } | null>(null);

  const dashboard = useDashboard();
  const notifications = useNotifications();
  const layouts = useDashboardLayouts();
  const goals = useGoals();
  const reports = useReports();
  const allSchedules = useSchedules(null);
  const execExports = useExports(reportIds?.executiveReportId ?? null);
  const opsExports = useExports(reportIds?.operationsReportId ?? null);

  const { refresh: refreshDashboard } = dashboard;
  const { refresh: refreshNotifications } = notifications;

  useEffect(() => {
    (async () => {
      const minDelay = new Promise(resolve => setTimeout(resolve, 600));
      await Promise.all([initializeDashboardFoundation(), minDelay]);
      registerDashboardSkills();
      setReportIds(registerDashboardReports());
      await refreshDashboard();
      await refreshNotifications();
      setLoading(false);
    })();
  }, [refreshDashboard, refreshNotifications]);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  const scrollToWidget = useCallback((key: DashboardWidgetKey) => {
    document.getElementById(`widget-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  }, []);

  const dashboardReports = useMemo(() => {
    if (!reportIds) return [];
    return reports.reports.filter(r => r.id === reportIds.executiveReportId || r.id === reportIds.operationsReportId);
  }, [reports.reports, reportIds]);

  const dashboardSchedules = useMemo(() => {
    if (!reportIds) return [];
    return allSchedules.schedules.filter(s => s.reportId === reportIds.executiveReportId || s.reportId === reportIds.operationsReportId);
  }, [allSchedules.schedules, reportIds]);

  const recentExports = useMemo(
    () => [...execExports.history, ...opsExports.history].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)),
    [execExports.history, opsExports.history]
  );

  const reportNameById = useCallback((reportId: string) => dashboardReports.find(r => r.id === reportId)?.name ?? "Dashboard Report", [dashboardReports]);

  const handleExport = useCallback(
    (format: "pdf" | "excel") => {
      if (!reportIds) return;
      execExports.requestExport(format);
    },
    [reportIds, execExports]
  );

  const handleToggleSchedule = useCallback(
    (schedule: (typeof dashboardSchedules)[number]) => {
      if (schedule.active) allSchedules.pause(schedule.id);
      else allSchedules.resume(schedule.id);
    },
    [allSchedules]
  );

  const visibleWidgets = useMemo(() => {
    const widgets = layouts.active?.widgets ?? [];
    return [...widgets].filter(w => w.visible).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || a.order - b.order);
  }, [layouts.active]);

  const isVisible = useCallback((key: DashboardWidgetKey) => visibleWidgets.some(w => w.key === key), [visibleWidgets]);

  const widgetSection = useCallback(
    (key: DashboardWidgetKey, node: React.ReactNode) => (
      <motion.div id={`widget-${key}`} key={key} variants={sectionVariants}>
        {node}
      </motion.div>
    ),
    []
  );

  return (
    <div className={presentationMode ? "mx-auto max-w-6xl" : ""}>
      {!presentationMode && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <DashboardSwitcher
            layouts={layouts.layouts}
            active={layouts.active}
            onSwitch={layouts.switchTo}
            onCreate={layouts.create}
            onClone={layouts.clone}
            onRename={layouts.rename}
            onDelete={layouts.remove}
            onToggleFavorite={layouts.toggleFavorite}
            onSetDefault={layouts.setAsDefault}
            onResetToTemplate={layouts.resetToTemplate}
          />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setReadOnly(v => !v)}>
              {readOnly ? <Lock size={14} /> : <Unlock size={14} />}
              {readOnly ? "Read-only" : "Editing"}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setLibraryOpen(v => !v)} disabled={readOnly}>
              <LayoutGrid size={14} />
              Manage Widgets
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPresentationMode(true)}>
              <Maximize2 size={14} />
              Presentation Mode
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Fullscreen" onClick={toggleFullscreen}>
              <Maximize2 size={14} />
            </Button>
          </div>
        </div>
      )}

      {presentationMode && (
        <div className="mb-4 flex justify-end">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPresentationMode(false)}>
            <Minimize2 size={14} />
            Exit Presentation Mode
          </Button>
        </div>
      )}

      {libraryOpen && !presentationMode && layouts.active && (
        <div className="mb-6">
          <WidgetLibraryPanel
            widgets={layouts.active.widgets}
            catalog={DASHBOARD_WIDGET_CATALOG}
            groups={DASHBOARD_WIDGET_GROUPS}
            readOnly={readOnly}
            onChange={widgets => layouts.updateWidgets(layouts.active!.id, widgets)}
            onClose={() => setLibraryOpen(false)}
          />
        </div>
      )}

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-8">
        <motion.div variants={sectionVariants}>
          <WelcomeHero
            workspace="Royal Global University"
            briefing={dashboard.briefing}
            loading={loading}
            onOpenSearch={() => setPaletteOpen(true)}
            onViewRecommendations={() => scrollToWidget("ai-recommendations")}
          />
        </motion.div>

        {isVisible("kpi-grid") && widgetSection("kpi-grid", <KpiGrid items={dashboard.marketingKpis} loading={loading} />)}

        {isVisible("goals-scorecard") && widgetSection("goals-scorecard", <GoalsScorecard goals={goals.scorecard} loading={loading} />)}

        {(isVisible("marketing-performance") || isVisible("channel-overview")) && (
          <motion.div variants={sectionVariants} className="grid gap-6 xl:grid-cols-2">
            {isVisible("marketing-performance") && (
              <div id="widget-marketing-performance">
                <MarketingPerformanceChart data={dashboard.performanceSeries} kpis={dashboard.marketingKpis} loading={loading} onExport={() => handleExport("pdf")} />
              </div>
            )}
            {isVisible("channel-overview") && (
              <div id="widget-channel-overview">
                <ChannelOverview rows={dashboard.channelOverview} loading={loading} />
              </div>
            )}
          </motion.div>
        )}

        {isVisible("quick-actions") && widgetSection("quick-actions", <QuickActions />)}

        {isVisible("pending-approvals") && widgetSection("pending-approvals", <PendingApprovals kpis={dashboard.kpis} approvals={dashboard.pendingApprovals} loading={loading} />)}

        {(isVisible("recent-activity") || isVisible("upcoming-tasks")) && (
          <motion.div variants={sectionVariants} className="grid gap-6 lg:grid-cols-2">
            {isVisible("recent-activity") && (
              <div id="widget-recent-activity">
                <RecentActivity items={dashboard.activity} loading={loading} />
              </div>
            )}
            {isVisible("upcoming-tasks") && (
              <div id="widget-upcoming-tasks">
                <UpcomingTasks tasks={dashboard.upcomingTasks} loading={loading} />
              </div>
            )}
          </motion.div>
        )}

        {(isVisible("ai-recommendations") || isVisible("connected-platforms")) && (
          <motion.div variants={sectionVariants} className="grid gap-6 lg:grid-cols-2">
            {isVisible("ai-recommendations") && (
              <div id="widget-ai-recommendations">
                <AiRecommendations
                  items={dashboard.recommendations}
                  loading={loading}
                  onApply={readOnly ? () => {} : dashboard.applyRecommendation}
                  onDismiss={readOnly ? () => {} : dashboard.dismissRecommendation}
                />
              </div>
            )}
            {isVisible("connected-platforms") && (
              <div id="widget-connected-platforms">
                <ConnectedPlatforms platforms={dashboard.connectedPlatforms} loading={loading} onRetry={readOnly ? async () => {} : dashboard.retryConnection} onRefreshAll={dashboard.refresh} />
              </div>
            )}
          </motion.div>
        )}

        {isVisible("reports-panel") &&
          widgetSection(
            "reports-panel",
            <DashboardReportsPanel reports={dashboardReports} exports={recentExports} schedules={dashboardSchedules} reportNameById={reportNameById} onToggleSchedule={handleToggleSchedule} onExport={handleExport} />
          )}
      </motion.div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} layouts={layouts.layouts} onSwitchLayout={layouts.switchTo} />
    </div>
  );
}
