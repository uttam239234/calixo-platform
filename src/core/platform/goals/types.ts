/**
 * Calixo Platform - Goals & Scorecards Types
 */

export type GoalPeriod = "weekly" | "monthly" | "quarterly";
export type GoalStatus = "achieved" | "on-track" | "at-risk" | "off-track";

export interface Goal {
  id: string;
  title: string;
  metricId: string;
  unit: "currency" | "count" | "percent";
  target: number;
  periodStart: string;
  periodEnd: string;
  period: GoalPeriod;
  owner: string;
}

export interface GoalScorecardEntry {
  id: string;
  title: string;
  metricId: string;
  unit: Goal["unit"];
  target: number;
  current: number;
  previousPeriodCurrent: number;
  progress: number;
  status: GoalStatus;
  trend: "up" | "down" | "steady";
  benchmarkChange: number;
  period: GoalPeriod;
  periodEnd: string;
}
