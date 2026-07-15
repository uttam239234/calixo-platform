"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
import ConnectorStatusBar from "./ConnectorStatusBar";
import HealthScoreCard from "./HealthScoreCard";
import ActionCenter from "./ActionCenter";
import SubscriptionSummary from "./SubscriptionSummary";
import PersonalizationNudge from "./PersonalizationNudge";
import EnterpriseOperationsBanner from "./EnterpriseOperationsBanner";
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
import {
  initializeDashboardFoundation,
  registerDashboardSkills,
  registerDashboardReports,
  DASHBOARD_WIDGET_CATALOG,
  DASHBOARD_WIDGET_PERMISSIONS,
  DASHBOARD_ORGANIZATION_ID,
  dashboardActivityLog,
  canUseDashboardFeature,
  recordDashboardUsage,
  getDashboardUsageTotal,
  trackDashboardAction,
} from "@/core/dashboard";
import { useCurrentOrganization } from "@/organizations/hooks/useOrganization";
import { useCurrentWorkspace } from "@/workspaces/hooks/useWorkspace";
import { useUser } from "@clerk/nextjs";
import { useCalixoIdentity } from "@/identity/bridge/useCalixoIdentity";
import { authorizationPlatformAPI, permissionName } from "@/core/platform/access";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, LayoutGrid, Lock, Unlock } from "lucide-react";
import type { DashboardWidgetKey, DashboardWidgetConfig, DashboardTenantContext } from "@/core/dashboard";

const DASHBOARD_WIDGET_GROUPS = ["Overview", "Performance", "Operations", "AI", "Integrations"] as const;

const NUDGE_CANDIDATES: { key: DashboardWidgetKey; label: string; usageTypeId: string; reason: string }[] = [
  { key: "ai-recommendations", label: "AI Recommendations", usageTypeId: "dashboard.aiRecommendationApplied", reason: "You've applied several AI recommendations." },
  { key: "reports-panel", label: "Reports & Exports", usageTypeId: "dashboard.export", reason: "You've exported a few times this month." },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export default function DashboardShell() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [reportIds, setReportIds] = useState<{ executiveReportId: string; operationsReportId: string } | null>(null);
  const [dismissedNudges, setDismissedNudges] = useState<Set<DashboardWidgetKey>>(new Set());

  const dashboard = useDashboard();
  const notifications = useNotifications();
  const currentOrganization = useCurrentOrganization();
  const currentWorkspace = useCurrentWorkspace();
  const { identity } = useCalixoIdentity();
  const { user: clerkUser } = useUser();
  const [permissions, setPermissions] = useState<string[] | null>(null);
  const layouts = useDashboardLayouts();
  const goals = useGoals();
  const reports = useReports();
  const allSchedules = useSchedules(null);
  const execExports = useExports(reportIds?.executiveReportId ?? null);
  const opsExports = useExports(reportIds?.operationsReportId ?? null);

  const { refresh: refreshDashboard } = dashboard;
  const { refresh: refreshNotifications } = notifications;

  const tenantContext: DashboardTenantContext = useMemo(
    () => ({
      organizationId: currentOrganization?.id ?? DASHBOARD_ORGANIZATION_ID,
      workspaceId: currentWorkspace?.id,
      userId: identity?.userId ?? "",
    }),
    [currentOrganization?.id, currentWorkspace?.id, identity?.userId]
  );

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

  /** Gated on `!loading` — usage types only exist once `initializeDashboardFoundation()` (awaited in the effect above) has registered them; firing this independently of that would race it. */
  const viewRecorded = useRef(false);
  useEffect(() => {
    if (loading || viewRecorded.current) return;
    viewRecorded.current = true;
    recordDashboardUsage(tenantContext, "dashboard.view");
  }, [loading, tenantContext]);

  /**
   * `null` means "no gating" — either unauthenticated (today's default,
   * where every widget stays visible exactly as before) or not yet
   * resolved. Once a real session + organization exist, this becomes the
   * user's real effective permission list and `isVisible()` below starts
   * enforcing `DASHBOARD_WIDGET_PERMISSIONS`.
   */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!identity) {
        if (!cancelled) setPermissions(null);
        return;
      }
      const effective = await authorizationPlatformAPI.getEffectivePermissions(identity.userId, currentOrganization?.id);
      if (!cancelled) setPermissions(effective);
    })();
    return () => {
      cancelled = true;
    };
  }, [identity, currentOrganization?.id]);

  const openPalette = useCallback(() => {
    recordDashboardUsage(tenantContext, "dashboard.search");
    setPaletteOpen(true);
  }, [tenantContext]);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openPalette();
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [openPalette]);

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
      if (!canUseDashboardFeature(tenantContext, "dashboard.export")) {
        dashboardActivityLog.record("System", "blocked export (plan limit reached)", format);
        return;
      }
      execExports.requestExport(format);
      recordDashboardUsage(tenantContext, "dashboard.export");
      trackDashboardAction("export");
    },
    [reportIds, execExports, tenantContext]
  );

  const handleToggleSchedule = useCallback(
    (schedule: (typeof dashboardSchedules)[number]) => {
      if (schedule.active) allSchedules.pause(schedule.id);
      else allSchedules.resume(schedule.id);
      trackDashboardAction("schedule_toggle");
    },
    [allSchedules]
  );

  const handleSwitchLayout = useCallback(
    (id: string) => {
      layouts.switchTo(id);
      recordDashboardUsage(tenantContext, "dashboard.layoutChange");
    },
    [layouts, tenantContext]
  );

  const handleCreateLayout = useCallback(
    (name: string, description: string, templateId?: string) => {
      const layout = layouts.create(name, description, templateId);
      recordDashboardUsage(tenantContext, "dashboard.layoutChange");
      return layout;
    },
    [layouts, tenantContext]
  );

  const handleCloneLayout = useCallback(
    (id: string, name: string) => {
      const layout = layouts.clone(id, name);
      recordDashboardUsage(tenantContext, "dashboard.layoutChange");
      return layout;
    },
    [layouts, tenantContext]
  );

  const handleUpdateWidgets = useCallback(
    (widgets: DashboardWidgetConfig[]) => {
      if (!layouts.active) return;
      layouts.updateWidgets(layouts.active.id, widgets);
      recordDashboardUsage(tenantContext, "dashboard.widgetVisibilityChange");
    },
    [layouts, tenantContext]
  );

  const handleApplyRecommendation = useCallback(
    async (id: string) => {
      if (!canUseDashboardFeature(tenantContext, "dashboard.aiRecommendationApplied")) {
        dashboardActivityLog.record("System", "blocked AI recommendation apply (plan limit reached)", id);
        return;
      }
      await dashboard.applyRecommendation(id);
      recordDashboardUsage(tenantContext, "dashboard.aiRecommendationApplied");
      trackDashboardAction("recommendation_apply");
    },
    [dashboard, tenantContext]
  );

  const handleDismissRecommendation = useCallback(
    async (id: string) => {
      await dashboard.dismissRecommendation(id);
      trackDashboardAction("recommendation_dismiss");
    },
    [dashboard]
  );

  const handleRetryConnection = useCallback(
    async (connectionId: string) => {
      await dashboard.retryConnection(connectionId);
      trackDashboardAction("connector_retry");
    },
    [dashboard]
  );

  const handleSelectNotification = useCallback(
    (notification: (typeof notifications.notifications)[number]) => {
      notifications.markRead(notification.id);
      if (notification.actionUrl) router.push(notification.actionUrl);
    },
    [notifications, router]
  );

  const visibleWidgets = useMemo(() => {
    const widgets = layouts.active?.widgets ?? [];
    return [...widgets].filter(w => w.visible).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || a.order - b.order);
  }, [layouts.active]);

  const isVisible = useCallback(
    (key: DashboardWidgetKey) => {
      if (!visibleWidgets.some(w => w.key === key)) return false;
      const requiredPermission = DASHBOARD_WIDGET_PERMISSIONS[key];
      if (requiredPermission && permissions && !permissions.includes(requiredPermission)) return false;
      return true;
    },
    [visibleWidgets, permissions]
  );

  /** Real permission check when a session exists; falls back to the "workspace" (admin) persona so the banner stays demo-visible without a login flow. */
  const isAdmin = permissions ? permissions.includes(permissionName("organization", "admin")) : layouts.active?.persona === "workspace";

  /**
   * A single real, session-scoped "pin this?" nudge — derived from actual
   * Commercial-Platform usage totals already recorded by Workstreams C/H
   * (`dashboard.aiRecommendationApplied` / `dashboard.export`), not a
   * fabricated per-widget view count (this in-memory demo has no
   * cross-session persistence to base one on honestly).
   */
  const nudgeSuggestion = useMemo(() => {
    if (!layouts.active) return null;
    const activeWidgets = layouts.active.widgets;
    const eligible = NUDGE_CANDIDATES.filter(candidate => {
      if (dismissedNudges.has(candidate.key)) return false;
      const config = activeWidgets.find(w => w.key === candidate.key);
      return Boolean(config?.visible) && !config?.pinned;
    });
    const match = eligible.find(candidate => getDashboardUsageTotal(tenantContext, candidate.usageTypeId) >= 3);
    return match ? { widgetKey: match.key, widgetLabel: match.label, reason: match.reason } : null;
  }, [layouts.active, tenantContext, dismissedNudges]);

  const handlePinNudge = useCallback(
    (key: DashboardWidgetKey) => {
      if (!layouts.active) return;
      handleUpdateWidgets(layouts.active.widgets.map(w => (w.key === key ? { ...w, pinned: true } : w)));
      setDismissedNudges(prev => new Set(prev).add(key));
    },
    [layouts.active, handleUpdateWidgets]
  );

  const handleDismissNudge = useCallback(() => {
    if (nudgeSuggestion) setDismissedNudges(prev => new Set(prev).add(nudgeSuggestion.widgetKey));
  }, [nudgeSuggestion]);

  /** Meters one `dashboard.widgetView` usage record the first time each widget key becomes visible in this session — a ref-backed guard so re-renders never double-count. */
  const recordedWidgetViews = useRef<Set<DashboardWidgetKey>>(new Set());
  useEffect(() => {
    for (const widget of visibleWidgets) {
      if (!recordedWidgetViews.current.has(widget.key)) {
        recordedWidgetViews.current.add(widget.key);
        recordDashboardUsage(tenantContext, "dashboard.widgetView");
      }
    }
  }, [visibleWidgets, tenantContext]);

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
      {!presentationMode && isAdmin && !loading && (
        <EnterpriseOperationsBanner health={dashboard.healthScore} actionItems={dashboard.actionCenterItems} connectedPlatforms={dashboard.connectedPlatforms} subscription={dashboard.subscription} />
      )}

      {!presentationMode && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <DashboardSwitcher
              layouts={layouts.layouts}
              active={layouts.active}
              onSwitch={handleSwitchLayout}
              onCreate={handleCreateLayout}
              onClone={handleCloneLayout}
              onRename={layouts.rename}
              onDelete={layouts.remove}
              onToggleFavorite={layouts.toggleFavorite}
              onSetDefault={layouts.setAsDefault}
              onResetToTemplate={layouts.resetToTemplate}
            />
            <ConnectorStatusBar platforms={dashboard.connectedPlatforms} />
          </div>
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

      {!presentationMode && !readOnly && <PersonalizationNudge suggestion={nudgeSuggestion} onPin={handlePinNudge} onDismiss={handleDismissNudge} />}

      {libraryOpen && !presentationMode && layouts.active && (
        <div className="mb-6">
          <WidgetLibraryPanel
            widgets={layouts.active.widgets}
            catalog={DASHBOARD_WIDGET_CATALOG}
            groups={DASHBOARD_WIDGET_GROUPS}
            readOnly={readOnly}
            onChange={handleUpdateWidgets}
            onClose={() => setLibraryOpen(false)}
          />
        </div>
      )}

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-8">
        <motion.div variants={sectionVariants}>
          <WelcomeHero
            workspace={currentWorkspace?.name ?? currentOrganization?.name ?? "Royal Global University"}
            userName={clerkUser?.fullName ?? clerkUser?.firstName ?? undefined}
            briefing={dashboard.briefing}
            loading={loading}
            onOpenSearch={openPalette}
            onViewRecommendations={() => scrollToWidget("ai-recommendations")}
          />
        </motion.div>

        {isVisible("kpi-grid") && widgetSection("kpi-grid", <KpiGrid items={dashboard.marketingKpis} loading={loading} />)}

        {(isVisible("goals-scorecard") || isVisible("health-score")) && (
          <motion.div variants={sectionVariants} className="grid gap-6 lg:grid-cols-2">
            {isVisible("goals-scorecard") && (
              <div id="widget-goals-scorecard">
                <GoalsScorecard goals={goals.scorecard} loading={loading} />
              </div>
            )}
            {isVisible("health-score") && (
              <div id="widget-health-score">
                <HealthScoreCard health={dashboard.healthScore} loading={loading} />
              </div>
            )}
          </motion.div>
        )}

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

        {isVisible("action-center") && widgetSection("action-center", <ActionCenter items={dashboard.actionCenterItems} loading={loading} onSnooze={dashboard.snoozeActionCenterItem} />)}

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
                  onApply={readOnly ? () => {} : handleApplyRecommendation}
                  onDismiss={readOnly ? () => {} : handleDismissRecommendation}
                />
              </div>
            )}
            {isVisible("connected-platforms") && (
              <div id="widget-connected-platforms">
                <ConnectedPlatforms platforms={dashboard.connectedPlatforms} loading={loading} onRetry={readOnly ? async () => {} : handleRetryConnection} onRefreshAll={dashboard.refresh} />
              </div>
            )}
          </motion.div>
        )}

        {isVisible("subscription-summary") && widgetSection("subscription-summary", <SubscriptionSummary subscription={dashboard.subscription} loading={loading} />)}

        {isVisible("reports-panel") &&
          widgetSection(
            "reports-panel",
            <DashboardReportsPanel reports={dashboardReports} exports={recentExports} schedules={dashboardSchedules} reportNameById={reportNameById} onToggleSchedule={handleToggleSchedule} onExport={handleExport} />
          )}
      </motion.div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        layouts={layouts.layouts}
        onSwitchLayout={handleSwitchLayout}
        widgets={DASHBOARD_WIDGET_CATALOG}
        onSelectWidget={scrollToWidget}
        goals={goals.scorecard}
        onSelectGoal={() => scrollToWidget("goals-scorecard")}
        notifications={notifications.notifications}
        onSelectNotification={handleSelectNotification}
      />
    </div>
  );
}
