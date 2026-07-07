/**
 * Calixo Platform - Goal Engine
 *
 * Goals are user-defined targets; every other field on a scorecard entry
 * (current, progress, status, trend, benchmark) is computed at query time
 * from the Analytics Platform API's real numeric output and the
 * WorkflowEngine's real KPIs — never hand-authored, and never reaching
 * into AnalyticsEngine directly. Follows the same "adapter, not duplicate"
 * shape as DashboardEngine itself.
 */

import { analyticsPlatformAPI } from "@/core/analytics/platform/AnalyticsPlatformAPI";
import { WorkflowEngine } from "@/core/workflow/WorkflowEngine";
import type { Goal, GoalScorecardEntry, GoalStatus } from "./types";

const DEFAULT_GOALS: Goal[] = [
  { id: "goal-revenue", title: "Monthly Revenue", metricId: "revenue", unit: "currency", target: 120_000, period: "monthly", periodStart: monthStart(), periodEnd: monthEnd(), owner: "system" },
  { id: "goal-leads", title: "New Leads", metricId: "leads", unit: "count", target: 1_600, period: "monthly", periodStart: monthStart(), periodEnd: monthEnd(), owner: "system" },
  { id: "goal-conversion-rate", title: "Conversion Rate", metricId: "conversion-rate", unit: "percent", target: 8, period: "monthly", periodStart: monthStart(), periodEnd: monthEnd(), owner: "system" },
  { id: "goal-approval-sla", title: "Approval Turnaround", metricId: "avg-approval-days", unit: "count", target: 2, period: "monthly", periodStart: monthStart(), periodEnd: monthEnd(), owner: "system" },
];

function monthStart(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

function monthEnd(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString();
}

function elapsedFraction(periodStart: string, periodEnd: string): number {
  const start = new Date(periodStart).getTime();
  const end = new Date(periodEnd).getTime();
  const now = Date.now();
  if (now <= start) return 0;
  if (now >= end) return 1;
  return (now - start) / (end - start);
}

function statusFor(progress: number, elapsed: number, lowerIsBetter: boolean): GoalStatus {
  if (lowerIsBetter) {
    if (progress >= 1) return "achieved";
    const pace = progress; // how close current is to target already (>=1 good)
    if (pace >= 0.85) return "on-track";
    return pace >= 0.6 ? "at-risk" : "off-track";
  }
  if (progress >= 1) return "achieved";
  const expected = Math.max(elapsed, 0.05);
  const pace = progress / expected;
  if (pace >= 0.9) return "on-track";
  return pace >= 0.6 ? "at-risk" : "off-track";
}

export class GoalEngine {
  constructor(private goals: Goal[] = DEFAULT_GOALS, private workflowEngine: typeof WorkflowEngine = WorkflowEngine) {}

  getGoals(): Goal[] {
    return [...this.goals];
  }

  getScorecard(): GoalScorecardEntry[] {
    const raw = analyticsPlatformAPI.getRawSummary("30d");
    const kpis = this.workflowEngine.getKPIs();
    const elapsed = elapsedFraction(monthStart(), monthEnd());

    return this.goals.map(goal => {
      let current = 0;
      let previousPeriodCurrent = 0;
      let lowerIsBetter = false;

      switch (goal.metricId) {
        case "revenue":
          current = raw.revenue;
          previousPeriodCurrent = raw.prevRevenue;
          break;
        case "leads":
          current = raw.leads;
          previousPeriodCurrent = raw.prevLeads;
          break;
        case "conversion-rate":
          current = raw.conversionRate;
          previousPeriodCurrent = raw.prevConversionRate;
          break;
        case "avg-approval-days":
          current = kpis.avgApprovalDays;
          previousPeriodCurrent = kpis.avgApprovalDays;
          lowerIsBetter = true;
          break;
        default:
          current = 0;
      }

      const progressRatio = lowerIsBetter
        ? (goal.target > 0 ? goal.target / Math.max(current, 0.01) : 1)
        : (goal.target > 0 ? current / goal.target : 0);
      const progress = Math.max(0, Math.min(progressRatio, 1.5));
      const benchmarkChange = previousPeriodCurrent > 0 ? ((current - previousPeriodCurrent) / previousPeriodCurrent) * 100 : 0;
      const trend = Math.abs(benchmarkChange) < 0.5 ? "steady" : benchmarkChange > 0 ? "up" : "down";
      const status = statusFor(progress, elapsed, lowerIsBetter);

      return {
        id: goal.id,
        title: goal.title,
        metricId: goal.metricId,
        unit: goal.unit,
        target: goal.target,
        current,
        previousPeriodCurrent,
        progress,
        status,
        trend: lowerIsBetter ? (trend === "up" ? "down" : trend === "down" ? "up" : "steady") : trend,
        benchmarkChange,
        period: goal.period,
        periodEnd: goal.periodEnd,
      };
    });
  }
}

export const goalEngine = new GoalEngine();
