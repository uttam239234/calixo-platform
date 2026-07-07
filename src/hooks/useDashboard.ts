"use client";

/**
 * Calixo Dashboard - operational KPIs / pending approvals / activity state.
 * The only place allowed to call DashboardEngine (and, through it,
 * WorkflowEngine) for the Dashboard landing page — components never
 * import either directly.
 */

import { useCallback, useEffect, useState } from "react";
import { dashboardEngine } from "@/core/dashboard";
import type {
  DashboardActivityEntry,
  DashboardApprovalItem,
  DashboardChannelRow,
  DashboardConnectedPlatform,
  DashboardForecastPoint,
  DashboardKpiSnapshot,
  DashboardMarketingKpi,
  DashboardMorningBriefing,
  DashboardPerformancePoint,
  DashboardRecommendation,
  DashboardRisk,
  DashboardTask,
} from "@/core/dashboard";

export function useDashboard() {
  const [kpis, setKpis] = useState<DashboardKpiSnapshot[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<DashboardApprovalItem[]>([]);
  const [activity, setActivity] = useState<DashboardActivityEntry[]>([]);
  const [marketingKpis, setMarketingKpis] = useState<DashboardMarketingKpi[]>([]);
  const [performanceSeries, setPerformanceSeries] = useState<DashboardPerformancePoint[]>([]);
  const [channelOverview, setChannelOverview] = useState<DashboardChannelRow[]>([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState<DashboardConnectedPlatform[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<DashboardTask[]>([]);
  const [recommendations, setRecommendations] = useState<DashboardRecommendation[]>([]);
  const [briefing, setBriefing] = useState<DashboardMorningBriefing | null>(null);
  const [forecast, setForecast] = useState<DashboardForecastPoint[]>([]);
  const [risks, setRisks] = useState<DashboardRisk[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setKpis(dashboardEngine.getOperationalKpis());
    setPendingApprovals(dashboardEngine.getPendingApprovals(5));
    setActivity(dashboardEngine.getActivityFeed(8));
    setMarketingKpis(dashboardEngine.getMarketingKpis());
    setPerformanceSeries(dashboardEngine.getPerformanceSeries());
    setChannelOverview(dashboardEngine.getChannelOverview());
    setConnectedPlatforms(await dashboardEngine.getConnectedPlatforms());
    setUpcomingTasks(dashboardEngine.getUpcomingTasks());
    setRecommendations(dashboardEngine.getRecommendations());
    setBriefing(dashboardEngine.getMorningBriefing());
    setForecast(dashboardEngine.getForecast());
    setRisks(dashboardEngine.detectRisks());
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
    })();
  }, [refresh]);

  const applyRecommendation = useCallback(
    async (id: string) => {
      dashboardEngine.applyRecommendation(id);
      await refresh();
    },
    [refresh]
  );

  const dismissRecommendation = useCallback(
    async (id: string) => {
      dashboardEngine.dismissRecommendation(id);
      await refresh();
    },
    [refresh]
  );

  const retryConnection = useCallback(
    async (connectionId: string) => {
      await dashboardEngine.retryConnection(connectionId);
      await refresh();
    },
    [refresh]
  );

  return {
    kpis,
    pendingApprovals,
    activity,
    marketingKpis,
    performanceSeries,
    channelOverview,
    connectedPlatforms,
    upcomingTasks,
    recommendations,
    briefing,
    forecast,
    risks,
    loading,
    refresh,
    applyRecommendation,
    dismissRecommendation,
    retryConnection,
  };
}

export type UseDashboardResult = ReturnType<typeof useDashboard>;
