"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, LayoutGrid } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAnalyticsDashboards } from "@/hooks/useAnalyticsDashboards";
import { useGoals } from "@/hooks/useGoals";
import { useSegments } from "@/hooks/useSegments";
import { useCustomMetrics } from "@/hooks/useCustomMetrics";
import { useReports } from "@/hooks/useReports";
import { useSchedules } from "@/hooks/useSchedules";
import { useExports } from "@/hooks/useExports";
import { initializeAnalyticsFoundation, registerAnalyticsSkills, ANALYTICS_WIDGET_CATALOG, ANALYTICS_WIDGET_GROUPS } from "@/core/analytics";
import type { AnalyticsChannel, AnalyticsRegion, AnalyticsWidgetKey } from "@/core/analytics";

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

  useEffect(() => {
    (async () => {
      const ids = initializeAnalyticsFoundation();
      registerAnalyticsSkills();
      setReportIds(ids);
    })();
  }, []);

  const analytics = useAnalytics();
  const dashboards = useAnalyticsDashboards();
  const goals = useGoals();
  const segments = useSegments();
  const customMetrics = useCustomMetrics(analytics.range, analytics.filters);
  const reports = useReports();
  const allSchedules = useSchedules(null);
  const channelExports = useExports(reportIds?.channelReportId ?? null);
  const trafficExports = useExports(reportIds?.trafficReportId ?? null);

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
      if (!reportIds) return;
      channelExports.requestExport(format);
    },
    [reportIds, channelExports]
  );

  const handleToggleSchedule = useCallback(
    (schedule: (typeof analyticsSchedules)[number]) => {
      if (schedule.active) allSchedules.pause(schedule.id);
      else allSchedules.resume(schedule.id);
    },
    [allSchedules]
  );

  const visibleWidgets = useMemo(() => {
    const widgets = dashboards.active?.widgets ?? [];
    return [...widgets].filter(w => w.visible).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || a.order - b.order);
  }, [dashboards.active]);

  const isVisible = useCallback((key: AnalyticsWidgetKey) => visibleWidgets.some(w => w.key === key), [visibleWidgets]);

  return (
    <div className="space-y-6 pb-8">
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="flex flex-wrap items-center justify-between gap-3">
        <DashboardSwitcher
          layouts={dashboards.layouts}
          active={dashboards.active}
          onSwitch={dashboards.switchTo}
          onCreate={dashboards.create}
          onClone={dashboards.clone}
          onRename={dashboards.rename}
          onDelete={dashboards.remove}
          onToggleFavorite={dashboards.toggleFavorite}
          onSetDefault={dashboards.setAsDefault}
          onResetToTemplate={dashboards.resetToTemplate}
        />
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setLibraryOpen(v => !v)}>
          <LayoutGrid size={14} />
          Manage Widgets
        </Button>
      </motion.div>

      {libraryOpen && dashboards.active && (
        <motion.div variants={sectionVariants} initial="hidden" animate="visible">
          <WidgetLibraryPanel
            widgets={dashboards.active.widgets}
            catalog={ANALYTICS_WIDGET_CATALOG}
            groups={ANALYTICS_WIDGET_GROUPS}
            readOnly={false}
            onChange={widgets => dashboards.updateWidgets(dashboards.active!.id, widgets)}
            onClose={() => setLibraryOpen(false)}
          />
        </motion.div>
      )}

      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <AnalyticsHeader selectedRange={analytics.range} onRangeChange={analytics.setRange} onExport={handleExport} onRefresh={analytics.refresh} />
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

      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <SegmentsPanel
          segments={segments.segments}
          currentFilters={analytics.filters}
          activeFilterCount={analytics.activeFilterCount}
          onApply={filters => {
            (Object.keys(filters) as (keyof typeof filters)[]).forEach(key => analytics.setFilter(key, filters[key]));
          }}
          onSave={(name, description, filters) => segments.saveSegment(name, description, filters)}
          onRemove={segments.removeSegment}
        />
      </motion.div>

      {isVisible("executive-summary") && (
        <motion.div variants={sectionVariants} initial="hidden" animate="visible">
          <ExecutiveSummary metrics={analytics.snapshot.summaryMetrics} />
        </motion.div>
      )}

      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <CustomKpiBuilder computed={customMetrics.computed} onCreate={customMetrics.createMetric} onRemove={customMetrics.removeMetric} />
      </motion.div>

      {isVisible("goals-scorecard") && (
        <motion.div variants={sectionVariants} initial="hidden" animate="visible">
          <GoalsScorecard goals={goals.scorecard} loading={goals.loading} />
        </motion.div>
      )}

      {(isVisible("revenue-chart") || isVisible("traffic-analytics")) && (
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
          {isVisible("revenue-chart") && <RevenueChart data={analytics.snapshot.revenueSeries} range={analytics.range} onExport={() => handleExport("pdf")} />}
          {isVisible("traffic-analytics") && <TrafficAnalytics metrics={analytics.snapshot.trafficMetrics} />}
        </motion.div>
      )}

      {isVisible("channel-performance") && (
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="grid gap-6 xl:grid-cols-2">
          <RevenueBridgeChart channels={analytics.snapshot.channelPerformance} />
          <ChannelEfficiencyScatter channels={analytics.snapshot.channelPerformance} onSelectChannel={channel => analytics.setFilter("channel", channel as AnalyticsChannel)} />
        </motion.div>
      )}

      {(isVisible("channel-performance") || isVisible("campaign-performance")) && (
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          {isVisible("channel-performance") && (
            <ChannelPerformance rows={analytics.snapshot.channelPerformance} activeChannel={analytics.filters.channel} onSelectChannel={channel => analytics.setFilter("channel", channel as AnalyticsChannel)} />
          )}
          {isVisible("campaign-performance") && (
            <CampaignPerformance rows={analytics.snapshot.campaignPerformance} activeCampaign={analytics.filters.campaign} onSelectCampaign={campaign => analytics.setFilter("campaign", campaign)} />
          )}
        </motion.div>
      )}

      {(isVisible("conversion-funnel") || isVisible("audience-insights")) && (
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          {isVisible("conversion-funnel") && <ConversionFunnel stages={analytics.snapshot.conversionFunnel} />}
          {isVisible("audience-insights") && <AudienceInsights items={analytics.snapshot.audienceInsights} />}
        </motion.div>
      )}

      {(isVisible("geo-performance") || isVisible("ai-insights")) && (
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          {isVisible("geo-performance") && (
            <GeoPerformance rows={analytics.snapshot.geoPerformance} regionCount={analytics.snapshot.regionCount} activeRegion={analytics.filters.region} onSelectRegion={region => analytics.setFilter("region", region as AnalyticsRegion)} />
          )}
          {isVisible("ai-insights") && <AIInsights insights={analytics.insights} onApply={analytics.applyInsight} onDismiss={analytics.dismissInsight} />}
        </motion.div>
      )}

      {isVisible("reports-panel") && (
        <motion.div variants={sectionVariants} initial="hidden" animate="visible">
          <ReportsPanel reports={analyticsReports} exports={recentExports} schedules={analyticsSchedules} reportNameById={reportNameById} onToggleSchedule={handleToggleSchedule} />
        </motion.div>
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
    </div>
  );
}
