"use client";

/**
 * Calixo Dashboard - operational KPIs / pending approvals / activity state.
 * The only place allowed to call DashboardEngine (and, through it,
 * WorkflowEngine) for the Dashboard landing page — components never
 * import either directly.
 */

import { useCallback, useEffect, useState } from "react";
import { dashboardEngine } from "@/core/dashboard";
import type { DashboardActivityEntry, DashboardApprovalItem, DashboardKpiSnapshot } from "@/core/dashboard";

export function useDashboard() {
  const [kpis, setKpis] = useState<DashboardKpiSnapshot[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<DashboardApprovalItem[]>([]);
  const [activity, setActivity] = useState<DashboardActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setKpis(dashboardEngine.getOperationalKpis());
    setPendingApprovals(dashboardEngine.getPendingApprovals(5));
    setActivity(dashboardEngine.getApprovalActivity(8));
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  return { kpis, pendingApprovals, activity, loading, refresh };
}

export type UseDashboardResult = ReturnType<typeof useDashboard>;
