"use client";

/**
 * Calixo Analytics - snapshot/range/filter/insight state.
 * The only place allowed to call AnalyticsEngine — components never
 * import it directly.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { analyticsEngine, analyticsPlatformAPI, initializeAnalyticsFoundation, logAnalyticsError, trackAnalyticsTiming, ANALYTICS_ORGANIZATION_ID } from "@/core/analytics";
import type { AnalyticsActionCenterItem, AnalyticsFilterState, AnalyticsHealthScore, AnalyticsInsight, AnalyticsRange, AnalyticsSnapshot } from "@/core/analytics";
import { CAMPAIGNS, CHANNELS, DEVICES, AUDIENCES, REGIONS } from "@/core/analytics/mock/generateAnalyticsFacts";

const EMPTY_SNAPSHOT: AnalyticsSnapshot = {
  summaryMetrics: [],
  revenueSeries: [],
  trafficMetrics: [],
  channelPerformance: [],
  campaignPerformance: [],
  conversionFunnel: [],
  audienceInsights: [],
  geoPerformance: [],
  regionCount: 0,
};

export function useAnalytics(organizationId: string = ANALYTICS_ORGANIZATION_ID) {
  const [range, setRange] = useState<AnalyticsRange>("30d");
  const [filters, setFilters] = useState<AnalyticsFilterState>({});
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot>(EMPTY_SNAPSHOT);
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [healthScore, setHealthScore] = useState<AnalyticsHealthScore | null>(null);
  const [actionCenterItems, setActionCenterItems] = useState<AnalyticsActionCenterItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    const startedAt = Date.now();
    try {
      initializeAnalyticsFoundation();
      setSnapshot(analyticsEngine.getSnapshot(range, filters));
      setInsights(analyticsEngine.getInsights());
      setHealthScore(analyticsPlatformAPI.getHealthScore(range, filters));
      setActionCenterItems(analyticsPlatformAPI.getActionCenterItems(range, filters, organizationId));
      trackAnalyticsTiming("dashboard_load_ms", Date.now() - startedAt);
    } catch (error) {
      logAnalyticsError("Analytics refresh failed", error);
    } finally {
      setLoading(false);
    }
  }, [range, filters, organizationId]);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  /** Changing a filter re-triggers `refresh()` (it's in that callback's deps), so filter latency is the same `analytics.timing.dashboard_load_ms` measurement as a full load — there's no separate recompute path to measure. */
  const setFilter = useCallback(<K extends keyof AnalyticsFilterState>(key: K, value: AnalyticsFilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  }, []);

  const clearFilters = useCallback(() => setFilters({}), []);

  const applyInsight = useCallback((id: string) => {
    analyticsEngine.applyInsight(id);
    setInsights(analyticsEngine.getInsights());
  }, []);

  const dismissInsight = useCallback((id: string) => {
    analyticsEngine.dismissInsight(id);
    setInsights(analyticsEngine.getInsights());
  }, []);

  /** Diffs two independently-specified periods — see `AnalyticsPlatformAPI.comparePeriods()`. Doesn't depend on this hook's own `range`/`filters` state, so callers pass whatever two periods they want compared. */
  const comparePeriods = useCallback(
    (periodA: Parameters<typeof analyticsPlatformAPI.comparePeriods>[0], periodB: Parameters<typeof analyticsPlatformAPI.comparePeriods>[1]) => analyticsPlatformAPI.comparePeriods(periodA, periodB),
    []
  );

  /** `customRange` is a date-range concept surfaced in the header's range picker, not one of the Filters panel's chips — excluded here so its badge count matches what that panel actually shows. */
  const activeFilterCount = useMemo(() => Object.entries(filters).filter(([key, value]) => key !== "customRange" && Boolean(value)).length, [filters]);

  const options = useMemo(
    () => ({
      channels: CHANNELS,
      campaigns: CAMPAIGNS.map(c => c.name),
      regions: REGIONS.map(r => r.region),
      devices: DEVICES,
      audiences: AUDIENCES,
    }),
    []
  );

  return {
    range,
    setRange,
    filters,
    setFilter,
    clearFilters,
    activeFilterCount,
    snapshot,
    insights,
    healthScore,
    actionCenterItems,
    applyInsight,
    dismissInsight,
    comparePeriods,
    loading,
    refresh,
    options,
  };
}

export type UseAnalyticsResult = ReturnType<typeof useAnalytics>;
