"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { SkeletonText } from "@/components/ui/Skeleton";
import { ArrowUp, ArrowDown, Minus, Target } from "lucide-react";
import type { GoalScorecardEntry } from "@/core/platform/goals";

const statusConfig: Record<GoalScorecardEntry["status"], { label: string; className: string; bar: string }> = {
  achieved: { label: "Achieved", className: "text-success bg-success/10 border-success/20", bar: "bg-success" },
  "on-track": { label: "On Track", className: "text-primary bg-primary/10 border-primary/20", bar: "bg-primary" },
  "at-risk": { label: "At Risk", className: "text-warning bg-warning/10 border-warning/20", bar: "bg-warning" },
  "off-track": { label: "Off Track", className: "text-destructive bg-destructive/10 border-destructive/20", bar: "bg-destructive" },
};

function formatValue(value: number, unit: GoalScorecardEntry["unit"]): string {
  if (unit === "currency") return value >= 1000 ? `$${(value / 1000).toFixed(1)}K` : `$${Math.round(value)}`;
  if (unit === "percent") return `${value.toFixed(1)}%`;
  return `${Math.round(value)}`;
}

function GoalRow({ goal }: { goal: GoalScorecardEntry }) {
  const status = statusConfig[goal.status];
  const TrendIcon = goal.trend === "up" ? ArrowUp : goal.trend === "down" ? ArrowDown : Minus;
  const trendColor = goal.trend === "steady" ? "text-muted-foreground" : goal.benchmarkChange >= 0 === (goal.trend === "up") ? "text-success" : "text-destructive";

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{goal.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatValue(goal.current, goal.unit)} of {formatValue(goal.target, goal.unit)} target
          </p>
        </div>
        <span className={`inline-flex flex-shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${status.className}`}>{status.label}</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border/40">
        <div className={`h-full rounded-full ${status.bar} transition-all duration-500`} style={{ width: `${Math.min(goal.progress * 100, 100)}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{Math.round(goal.progress * 100)}% of target</span>
        <span className={`inline-flex items-center gap-1 font-medium ${trendColor}`}>
          <TrendIcon size={11} />
          {goal.benchmarkChange >= 0 ? "+" : ""}
          {goal.benchmarkChange.toFixed(1)}% vs prior period
        </span>
      </div>
    </div>
  );
}

function GoalSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3">
      <SkeletonText className="h-4 w-1/2" />
      <SkeletonText className="h-2 w-full" />
      <SkeletonText className="h-3 w-1/3" />
    </div>
  );
}

interface GoalsScorecardProps {
  goals: GoalScorecardEntry[];
  loading?: boolean;
}

export default function GoalsScorecard({ goals, loading = false }: GoalsScorecardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader title="Goals & Scorecard" description="Targets, progress, and benchmark comparison" />
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <GoalSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Goals & Scorecard" description="Targets, progress, and benchmark comparison — computed from live data" action={<Target size={16} className="text-primary" />} />
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {goals.map((goal) => (
            <GoalRow key={goal.id} goal={goal} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
