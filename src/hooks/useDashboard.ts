"use client";

/**
 * Calixo Dashboard - operational KPIs / pending approvals / activity state.
 * The only place allowed to call DashboardEngine (and, through it,
 * WorkflowEngine) for the Dashboard landing page — components never
 * import either directly.
 */

import { useCallback, useEffect, useState } from "react";
import { dashboardEngine, logDashboardError, trackDashboardLoadTime } from "@/core/dashboard";
import { useOrganizationId } from "@/organizations/hooks/useOrganization";
import type {
  DashboardActionCenterItem,
  DashboardActivityEntry,
  DashboardApprovalItem,
  DashboardChannelRow,
  DashboardConnectedPlatform,
  DashboardForecastPoint,
  DashboardHealthScore,
  DashboardKpiSnapshot,
  DashboardMarketingKpi,
  DashboardMorningBriefing,
  DashboardPerformancePoint,
  DashboardRecommendation,
  DashboardRisk,
  DashboardSubscriptionSummary,
  DashboardTask,
} from "@/core/dashboard";

export function useDashboard() {
  const organizationId = useOrganizationId();
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
  const [healthScore, setHealthScore] = useState<DashboardHealthScore | null>(null);
  const [actionCenterItems, setActionCenterItems] = useState<DashboardActionCenterItem[]>([]);
  const [subscription, setSubscription] = useState<DashboardSubscriptionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const startedAt = Date.now();
    try {
      setKpis(dashboardEngine.getOperationalKpis());
      setPendingApprovals(dashboardEngine.getPendingApprovals(5));
      setActivity(dashboardEngine.getActivityFeed(8));
      setMarketingKpis(dashboardEngine.getMarketingKpis());
      setPerformanceSeries(dashboardEngine.getPerformanceSeries());
      setChannelOverview(dashboardEngine.getChannelOverview());
      setConnectedPlatforms(await dashboardEngine.getConnectedPlatforms());
      setUpcomingTasks(dashboardEngine.getUpcomingTasks());
      setRecommendations(dashboardEngine.getRecommendations());
      setBriefing(await dashboardEngine.getMorningBriefing(organizationId ?? undefined));
      setForecast(dashboardEngine.getForecast());
      setRisks(dashboardEngine.detectRisks());
      setHealthScore(await dashboardEngine.getHealthScore());
      setActionCenterItems(await dashboardEngine.getActionCenterItems(organizationId ?? undefined));
      setSubscription(dashboardEngine.getSubscriptionSummary(organizationId ?? undefined));
      trackDashboardLoadTime(Date.now() - startedAt);
    } catch (error) {
      logDashboardError("Dashboard refresh failed", error);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

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

  const snoozeActionCenterItem = useCallback(
    (id: string) => {
      dashboardEngine.snoozeActionCenterItem(id);
      setActionCenterItems(items => items.filter(i => i.id !== id));
    },
    []
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
    healthScore,
    actionCenterItems,
    subscription,
    loading,
    refresh,
    applyRecommendation,
    dismissRecommendation,
    retryConnection,
    snoozeActionCenterItem,
  };
}

export type UseDashboardResult = ReturnType<typeof useDashboard>;
