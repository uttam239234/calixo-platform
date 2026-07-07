"use client";

/**
 * Calixo Platform - Custom KPI Builder state.
 * The only place allowed to call AnalyticsMetricRegistry directly —
 * components never import it. Live values come from `AnalyticsEngine`'s
 * generic `computeMetric()`, the same computation path every default
 * metric uses.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { generateId } from "@/shared/utils/string";
import { analyticsMetricRegistry, analyticsEngine } from "@/core/analytics";
import type { AnalyticsMetricAggregation, AnalyticsMetricDefinition, AnalyticsMetricFormat } from "@/core/analytics";
import type { AnalyticsFilterState, AnalyticsRange } from "@/core/analytics";

export function useCustomMetrics(range: AnalyticsRange, filters: AnalyticsFilterState) {
  const [metrics, setMetrics] = useState<AnalyticsMetricDefinition[]>([]);

  const refresh = useCallback(() => {
    setMetrics(analyticsMetricRegistry.list());
  }, []);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const computed = useMemo(
    () => metrics.map(metric => ({ metric, ...analyticsEngine.computeMetric(metric, range, filters) })),
    [metrics, range, filters]
  );

  const createMetric = useCallback(
    (params: { label: string; field: AnalyticsMetricDefinition["field"]; aggregation: AnalyticsMetricAggregation; format: AnalyticsMetricFormat; description?: string }) => {
      const metric: AnalyticsMetricDefinition = { id: `custom-${generateId(8)}`, custom: true, ...params };
      analyticsMetricRegistry.register(metric);
      refresh();
      return metric;
    },
    [refresh]
  );

  const removeMetric = useCallback(
    (id: string) => {
      analyticsMetricRegistry.unregister(id);
      refresh();
    },
    [refresh]
  );

  return { metrics, computed, createMetric, removeMetric, refresh };
}
