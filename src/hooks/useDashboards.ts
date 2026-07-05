"use client";

/**
 * Calixo Reports Center - dashboard list state.
 * The only place allowed to call DashboardRegistry.
 */

import { useCallback, useEffect, useState } from "react";
import { dashboardRegistry } from "@/core/reports";
import type { ReportDashboard } from "@/core/reports";

export function useDashboards() {
  const [dashboards, setDashboards] = useState<ReportDashboard[]>([]);

  const refresh = useCallback(() => {
    setDashboards(dashboardRegistry.list());
  }, []);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const search = useCallback((query: string): ReportDashboard[] => {
    return query.trim() ? dashboardRegistry.discover(query) : dashboardRegistry.list();
  }, []);

  const lookup = useCallback((id: string) => dashboardRegistry.lookup(id), []);

  return { dashboards, search, lookup, refresh };
}
