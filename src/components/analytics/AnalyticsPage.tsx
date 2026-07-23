"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, LayoutGrid, Search, Maximize2, Minimize2 } from "lucide-react";
import AnalyticsCommandPalette from "./AnalyticsCommandPalette";
import AnalyticsHealthScoreCard from "./AnalyticsHealthScoreCard";
import AnalyticsInsightActionCenter from "./AnalyticsInsightActionCenter";
import { AnalyticsHeader } from "./AnalyticsHeader";
import { AnalyticsFilters } from "./AnalyticsFilters";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { RevenueChart } from "./RevenueChart";
import { TrafficAnalytics } from "./TrafficAnalytics";
import { ChannelPerformance } from "./ChannelPerformance";
import { CampaignPerformance } from "./CampaignPerformance";
import { ConversionFunnel } from "./ConversionFunnel";
import { AudienceInsights } from "./AudienceInsights";
import { GeoPerformance } from "./GeoPerformance";
import { AIInsights } from "./AIInsights";
import { ReportsPanel } from "./ReportsPanel";
import SegmentsPanel from "./SegmentsPanel";
import CustomKpiBuilder from "./CustomKpiBuilder";
import RevenueBridgeChart from "./RevenueBridgeChart";
import ChannelEfficiencyScatter from "./ChannelEfficiencyScatter";
import GoalsScorecard from "@/components/platform/goals/GoalsScorecard";
import DashboardSwitcher from "@/components/platform/dashboardBuilder/DashboardSwitcher";
import WidgetLibraryPanel from "@/components/platform/dashboardBuilder/WidgetLibraryPanel";
import WidgetGrid from "@/components/platform/dashboardBuilder/WidgetGrid";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAnalyticsDashboards } from "@/hooks/useAnalyticsDashboards";
import { useGoals } from "@/hooks/useGoals";
import { useSegments } from "@/hooks/useSegments";
import { useCustomMetrics } from "@/hooks/useCustomMetrics";
import { useReports } from "@/hooks/useReports";
import { useSchedules } from "@/hooks/useSchedules";
import { useExports } from "@/hooks/useExports";
import { useAnalyticsAnnotations } from "@/hooks/useAnalyticsAnnotations";
import {
  initializeAnalyticsFoundation,
  registerAnalyticsSkills,
  ANALYTICS_WIDGET_GROUPS,
  ANALYTICS_ORGANIZATION_ID,
  canUseAnalyticsFeature,
  recordAnalyticsUsage,
  trackAnalyticsAction,
  syncAnalyticsFactsFromConnectors,
} from "@/core/analytics";
import type { AnalyticsChannel, AnalyticsFilterState, AnalyticsPeriodComparison, AnalyticsRegion, AnalyticsSegment, AnalyticsWidgetConfig } from "@/core/analytics";
import { useCalixoIdentity } from "@/identity/bridge/useCalixoIdentity";
import { useOrganizationId } from "@/organizations/hooks/useOrganization";
import { authorizationPlatformAPI, permissionName } from "@/core/platform/access";
import { initializePlatformFoundation } from "@/core/platform";
import { EmptyState } from "@/components/ui/EmptyState";
import { Lock } from "lucide-react";

const ANALYTICS_ACTION_PERMISSIONS = {
  read: permissionName("analytics", "read"),
  export: permissionName("analytics", "export"),
  create: permissionName("analytics", "create"),
  execute: permissionName("analytics", "execute"),
} as const;

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

interface AnalyticsReportIds {
  channelReportId: string;
  trafficReportId: string;
  executiveReportId: string;
  revenueReportId: string;
  audienceReportId: string;
}

export function AnalyticsPage() {
  const [reportIds, setReportIds] = useState<AnalyticsReportIds | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [permissions, setPermissions] = useState<string[] | null>(null);
  const [periodComparison, setPeriodComparison] = useState<AnalyticsPeriodComparison | null>(null);

  const { identity } = useCalixoIdentity();
  const organizationId = useOrganizationId();

  const tenantContext = useMemo(
    () => ({ organizationId: organizationId ?? ANALYTICS_ORGANIZATION_ID, userId: identity?.userId ?? "" }),
    [organizationId, identity?.userId]
  );

  useEffect(() => {
    (async () => {
      const ids = initializeAnalyticsFoundation();
      registerAnalyticsSkills();
      setReportIds(ids);
    })();
  }, []);

  const viewRecorded = useRef(false);
  useEffect(() => {
    if (viewRecorded.current) return;
    viewRecorded.current = true;
    recordAnalyticsUsage(tenantContext, "analytics.dashboardView");
  }, [tenantContext]);

  /** `null` while identity resolution is still in flight — `middleware.ts` already blocks unauthenticated requests before this component ever renders. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!identity) {
        if (!cancelled) setPermissions(null);
        return;
      }
      await initializePlatformFoundation();
      const effective = await authorizationPlatformAPI.getEffectivePermissions(identity.userId, organizationId ?? undefined);
      if (!cancelled) setPermissions(effective);
    })();
    return () => {
      cancelled = true;
    };
  }, [identity, organizationId]);

  const hasPermission = useCallback((permission: string) => !permissions || permissions.includes(permission), [permissions]);
  const canRead = hasPermission(ANALYTICS_ACTION_PERMISSIONS.read);
  const canExport = hasPermission(ANALYTICS_ACTION_PERMISSIONS.export);
  const canCreate = hasPermission(ANALYTICS_ACTION_PERMISSIONS.create);
  const canExecute = hasPermission(ANALYTICS_ACTION_PERMISSIONS.execute);

  const analytics = useAnalytics(tenantContext.organizationId);
  const revenueAnnotations = useAnalyticsAnnotations("revenue-chart");
  const dashboards = useAnalyticsDashboards();
  const goals = useGoals();
  const segments = useSegments();
  const customMetrics = useCustomMetrics(analytics.range, analytics.filters);
  const reports = useReports();
  const allSchedules = useSchedules(null);
  const channelExports = useExports(reportIds?.channelReportId ?? null);
  const trafficExports = useExports(reportIds?.trafficReportId ?? null);

  const { refresh: refreshAnalytics } = analytics;

  /** The Connector Platform's real hookup point — narrows the fact table to whatever's actually connected, then forces a fresh snapshot pull so the change is visible immediately. */
  useEffect(() => {
    (async () => {
      await syncAnalyticsFactsFromConnectors();
      refreshAnalytics();
    })();
  }, [refreshAnalytics]);

  const reportIdSet = useMemo(() => (reportIds ? Object.values(reportIds) : []), [reportIds]);

  const analyticsReports = useMemo(() => reports.reports.filter(r => reportIdSet.includes(r.id)), [reports.reports, reportIdSet]);
  const analyticsSchedules = useMemo(() => allSchedules.schedules.filter(s => reportIdSet.includes(s.reportId)), [allSchedules.schedules, reportIdSet]);
  const recentExports = useMemo(
    () => [...channelExports.history, ...trafficExports.history].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)),
    [channelExports.history, trafficExports.history]
  );

  const reportNameById = useCallback((reportId: string) => analyticsReports.find(r => r.id === reportId)?.name ?? "Analytics Report", [analyticsReports]);

  const handleExport = useCallback(
    (format: "pdf" | "excel") => {
      if (!reportIds || !canExport || !canUseAnalyticsFeature(tenantContext, "analytics.export")) return;
      channelExports.requestExport(format);
      recordAnalyticsUsage(tenantContext, "analytics.export");
      trackAnalyticsAction("export");
    },
    [reportIds, channelExports, canExport, tenantContext]
  );

  const handleCreateDashboard = useCallback(
    async (name: string, description: string, templateId?: string) => {
      if (!canCreate) return undefined;
      const layout = await dashboards.create(name, description, templateId);
      if (layout) {
        recordAnalyticsUsage(tenantContext, "analytics.dashboardCreated");
        trackAnalyticsAction("dashboard_created");
      }
      return layout;
    },
    [dashboards, canCreate, tenantContext]
  );

  const handleCloneDashboard = useCallback(
    async (id: string, name: string) => {
      if (!canCreate) return undefined;
      const layout = await dashboards.clone(id, name);
      if (layout) {
        recordAnalyticsUsage(tenantContext, "analytics.dashboardCreated");
        trackAnalyticsAction("dashboard_created");
      }
      return layout;
    },
    [dashboards, canCreate, tenantContext]
  );

  const handleUpdateWidgets = useCallback(
    (widgets: AnalyticsWidgetConfig[]) => {
      if (!dashboards.active) return;
      dashboards.updateWidgets(widgets);
      recordAnalyticsUsage(tenantContext, "analytics.widgetCreated");
    },
    [dashboards, tenantContext]
  );

  const handleCreateMetric = useCallback(
    (params: Parameters<typeof customMetrics.createMetric>[0]) => {
      if (!canCreate) return undefined;
      const metric = customMetrics.createMetric(params);
      recordAnalyticsUsage(tenantContext, "analytics.customMetricCreated");
      trackAnalyticsAction("custom_metric_created");
      return metric;
    },
    [customMetrics, canCreate, tenantContext]
  );

  const handleSaveSegment = useCallback(
    (name: string, description: string, filters: Parameters<typeof segments.saveSegment>[2]) => {
      if (!canCreate) return undefined;
      const segment = segments.saveSegment(name, description, filters);
      recordAnalyticsUsage(tenantContext, "analytics.segmentCreated");
      trackAnalyticsAction("segment_created");
      return segment;
    },
    [segments, canCreate, tenantContext]
  );

  const handleApplyInsight = useCallback(
    (id: string) => {
      if (!canExecute) return undefined;
      analytics.applyInsight(id);
      recordAnalyticsUsage(tenantContext, "analytics.aiInsightViewed");
      trackAnalyticsAction("ai_insight_applied");
      return undefined;
    },
    [analytics, canExecute, tenantContext]
  );

  const handleChartInteraction = useCallback(
    <K extends keyof AnalyticsFilterState>(key: K, value: AnalyticsFilterState[K]) => {
      analytics.setFilter(key, value);
      recordAnalyticsUsage(tenantContext, "analytics.chartInteraction");
      trackAnalyticsAction("chart_interaction");
    },
    [analytics, tenantContext]
  );

  const handleToggleSchedule = useCallback(
    (schedule: (typeof analyticsSchedules)[number]) => {
      if (schedule.active) allSchedules.pause(schedule.id);
      else allSchedules.resume(schedule.id);
    },
    [allSchedules]
  );

  const scrollToWidget = useCallback((id: string) => {
    document.getElementById(`widget-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleSelectSegmentFromSearch = useCallback(
    (segment: AnalyticsSegment) => {
      (Object.keys(segment.filters) as (keyof AnalyticsFilterState)[]).forEach(key => analytics.setFilter(key, segment.filters[key]));
    },
    [analytics]
  );

  const openPalette = useCallback(() => {
    recordAnalyticsUsage(tenantContext, "analytics.search");
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

  const renderableWidgets = useMemo(() => {
    const widgets = dashboards.active?.widgets ?? [];
    return widgets.filter(w => dashboards.renderableIds.has(w.instanceId));
  }, [dashboards.active, dashboards.renderableIds]);

  const renderAnalyticsWidget = useCallback(
    (config: AnalyticsWidgetConfig): React.ReactNode => {
      switch (config.key) {
        case "executive-summary":
          return <ExecutiveSummary metrics={analytics.snapshot.summaryMetrics} />;
        case "health-score":
          return <AnalyticsHealthScoreCard health={analytics.healthScore} loading={analytics.loading} />;
        case "goals-scorecard":
          return <GoalsScorecard goals={goals.scorecard} loading={goals.loading} />;
        case "revenue-chart":
          return (
            <RevenueChart
              data={analytics.snapshot.revenueSeries}
              range={analytics.range}
              onExport={() => handleExport("pdf")}
              annotations={revenueAnnotations.annotations}
              onAddAnnotation={canCreate ? revenueAnnotations.addAnnotation : undefined}
              onRemoveAnnotation={revenueAnnotations.removeAnnotation}
            />
          );
        case "traffic-analytics":
          return <TrafficAnalytics metrics={analytics.snapshot.trafficMetrics} />;
        case "channel-performance":
          return (
            <div className="flex h-full flex-col gap-4 overflow-auto">
              <RevenueBridgeChart channels={analytics.snapshot.channelPerformance} />
              <ChannelEfficiencyScatter channels={analytics.snapshot.channelPerformance} onSelectChannel={channel => handleChartInteraction("channel", channel as AnalyticsChannel)} />
              <ChannelPerformance rows={analytics.snapshot.channelPerformance} activeChannel={analytics.filters.channel} onSelectChannel={channel => handleChartInteraction("channel", channel as AnalyticsChannel)} />
            </div>
          );
        case "campaign-performance":
          return <CampaignPerformance rows={analytics.snapshot.campaignPerformance} activeCampaign={analytics.filters.campaign} onSelectCampaign={campaign => handleChartInteraction("campaign", campaign)} />;
        case "conversion-funnel":
          return <ConversionFunnel stages={analytics.snapshot.conversionFunnel} />;
        case "audience-insights":
          return <AudienceInsights items={analytics.snapshot.audienceInsights} />;
        case "geo-performance":
          return (
            <GeoPerformance
              rows={analytics.snapshot.geoPerformance}
              regionCount={analytics.snapshot.regionCount}
              activeRegion={analytics.filters.region}
              onSelectRegion={region => handleChartInteraction("region", region as AnalyticsRegion)}
            />
          );
        case "ai-insights":
          return <AIInsights insights={analytics.insights} onApply={handleApplyInsight} onDismiss={analytics.dismissInsight} onGenerate={analytics.generateInsight} generating={analytics.generatingInsight} generateError={analytics.insightError} />;
        case "insight-action-center":
          return <AnalyticsInsightActionCenter items={analytics.actionCenterItems} loading={analytics.loading} onScrollToWidget={scrollToWidget} />;
        case "reports-panel":
          return <ReportsPanel reports={analyticsReports} exports={recentExports} schedules={analyticsSchedules} reportNameById={reportNameById} onToggleSchedule={handleToggleSchedule} />;
        default:
          return null;
      }
    },
    [analytics, goals.scorecard, goals.loading, handleExport, revenueAnnotations, canCreate, handleChartInteraction, handleApplyInsight, scrollToWidget, analyticsReports, recentExports, analyticsSchedules, reportNameById, handleToggleSchedule]
  );

  if (!canRead) {
    return (
      <div className="flex items-center justify-center py-24">
        <EmptyState icon={<Lock size={32} />} title="You don't have access to Analytics" description="Ask a workspace admin to grant the analytics:read permission." />
      </div>
    );
  }

  return (
    <div className={presentationMode ? "mx-auto max-w-6xl space-y-6 pb-8" : "space-y-6 pb-8"}>
      {!presentationMode && (
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="flex flex-wrap items-center justify-between gap-3">
          <DashboardSwitcher
            layouts={dashboards.layouts}
            active={dashboards.active}
            onSwitch={dashboards.switchTo}
            onCreate={handleCreateDashboard}
            onClone={handleCloneDashboard}
            onRename={dashboards.rename}
            onDelete={dashboards.remove}
            onToggleFavorite={dashboards.toggleFavorite}
            onSetDefault={dashboards.setAsDefault}
            onResetToTemplate={dashboards.resetToTemplate}
            onSaveAsTemplate={dashboards.saveAsTemplate}
          />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={openPalette}>
              <Search size={14} />
              Search
              <kbd className="ml-1 rounded border border-border px-1 text-[10px] text-muted-foreground">⌘K</kbd>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setLibraryOpen(v => !v)}>
              <LayoutGrid size={14} />
              Manage Widgets
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPresentationMode(true)}>
              <Maximize2 size={14} />
              Presentation Mode
            </Button>
          </div>
        </motion.div>
      )}

      {presentationMode && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPresentationMode(false)}>
            <Minimize2 size={14} />
            Exit Presentation Mode
          </Button>
        </div>
      )}

      {libraryOpen && dashboards.active && (
        <motion.div variants={sectionVariants} initial="hidden" animate="visible">
          <WidgetLibraryPanel
            widgets={dashboards.active.widgets}
            catalog={dashboards.catalog}
            groups={ANALYTICS_WIDGET_GROUPS}
            readOnly={!canCreate}
            onChange={handleUpdateWidgets}
            onAdd={dashboards.addWidget}
            onClose={() => setLibraryOpen(false)}
          />
        </motion.div>
      )}

      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <AnalyticsHeader
          selectedRange={analytics.range}
          onRangeChange={analytics.setRange}
          customRange={analytics.filters.customRange}
          onCustomRangeChange={range => analytics.setFilter("customRange", range)}
          onExport={handleExport}
          onRefresh={analytics.refresh}
        />
      </motion.div>

      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <AnalyticsFilters
          filters={analytics.filters}
          options={analytics.options}
          activeFilterCount={analytics.activeFilterCount}
          onApply={next => {
            (Object.keys(next) as (keyof typeof next)[]).forEach(key => analytics.setFilter(key, next[key]));
            (Object.keys(analytics.filters) as (keyof typeof analytics.filters)[])
              .filter(key => !(key in next))
              .forEach(key => analytics.setFilter(key, undefined));
          }}
          onClear={analytics.clearFilters}
        />
      </motion.div>

      <motion.div id="widget-segments-panel" variants={sectionVariants} initial="hidden" animate="visible">
        <SegmentsPanel
          segments={segments.segments}
          currentFilters={analytics.filters}
          activeFilterCount={analytics.activeFilterCount}
          onApply={filters => {
            (Object.keys(filters) as (keyof typeof filters)[]).forEach(key => analytics.setFilter(key, filters[key]));
          }}
          onSave={(name, description, filters) => handleSaveSegment(name, description, filters)}
          onRemove={segments.removeSegment}
        />
      </motion.div>

      <motion.div id="widget-custom-kpi-builder" variants={sectionVariants} initial="hidden" animate="visible">
        <CustomKpiBuilder computed={customMetrics.computed} onCreate={handleCreateMetric} onRemove={customMetrics.removeMetric} />
      </motion.div>

      {dashboards.loaded && (
        <WidgetGrid
          widgets={renderableWidgets}
          catalog={dashboards.catalog}
          readOnly={!canCreate}
          renderWidget={renderAnalyticsWidget}
          onWidgetsChange={dashboards.updateWidgets}
          onDuplicateWidget={dashboards.duplicateWidget}
          onRemoveWidget={dashboards.removeWidget}
          onResetWidget={dashboards.resetWidget}
        />
      )}

      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-sm">
          <Sparkles size={16} className="text-primary" />
          Insights are computed live from your selected range and filters.
          <div className="ml-auto flex items-center gap-2 text-primary">
            <TrendingUp size={16} />
            {analytics.insights.filter(i => i.status === "new").length} open recommendation{analytics.insights.filter(i => i.status === "new").length === 1 ? "" : "s"}
          </div>
        </div>
      </motion.div>

      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-border bg-card p-4 text-sm">
          <Button variant="outline" size="sm" className="gap-1.5 flex-shrink-0" onClick={() => setPeriodComparison(analytics.comparePeriods({ range: "30d", label: "prior 30 days" }, { range: "7d", label: "last 7 days" }))}>
            <TrendingUp size={14} />
            Compare last 7 days vs. prior 30 days
          </Button>
          {periodComparison && <p className="min-w-0 text-muted-foreground">{periodComparison.summary}</p>}
        </div>
      </motion.div>

      <AnalyticsCommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        layouts={dashboards.layouts}
        onSwitchLayout={dashboards.switchTo}
        metrics={customMetrics.metrics}
        onSelectMetric={() => scrollToWidget("custom-kpi-builder")}
        segments={segments.segments}
        onSelectSegment={handleSelectSegmentFromSearch}
        reports={analyticsReports}
        onSelectReport={() => scrollToWidget("reports-panel")}
        insights={analytics.insights}
        onSelectInsight={() => scrollToWidget("ai-insights")}
        goals={goals.scorecard}
        onSelectGoal={() => scrollToWidget("goals-scorecard")}
      />
    </div>
  );
}
