"use client";

/**
 * Calixo Analytics - snapshot/range/filter/insight state.
 * The only place allowed to call AnalyticsEngine — components never
 * import it directly.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { analyticsEngine, initializeAnalyticsFoundation } from "@/core/analytics";
import type { AnalyticsFilterState, AnalyticsInsight, AnalyticsRange, AnalyticsSnapshot } from "@/core/analytics";
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

export function useAnalytics() {
  const [range, setRange] = useState<AnalyticsRange>("30d");
  const [filters, setFilters] = useState<AnalyticsFilterState>({});
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot>(EMPTY_SNAPSHOT);
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    initializeAnalyticsFoundation();
    setSnapshot(analyticsEngine.getSnapshot(range, filters));
    setInsights(analyticsEngine.getInsights());
    setLoading(false);
  }, [range, filters]);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

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

  const activeFilterCount = useMemo(() => Object.values(filters).filter(Boolean).length, [filters]);

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
    applyInsight,
    dismissInsight,
    loading,
    refresh,
    options,
  };
}

export type UseAnalyticsResult = ReturnType<typeof useAnalytics>;
