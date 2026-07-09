"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { SkeletonText } from "@/components/ui/Skeleton";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import type { DashboardHealthScore } from "@/core/dashboard";

function ringColor(score: number): string {
  if (score >= 85) return "text-success";
  if (score >= 70) return "text-primary";
  if (score >= 50) return "text-warning";
  return "text-destructive";
}

interface HealthScoreCardProps {
  health: DashboardHealthScore | null;
  loading?: boolean;
}

export default function HealthScoreCard({ health, loading = false }: HealthScoreCardProps) {
  if (loading || !health) {
    return (
      <Card>
        <CardHeader title="Health Score" description="Weighted organization health" />
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-border/40 via-border/60 to-border/40 animate-pulse" />
            <div className="flex-1 space-y-2">
              <SkeletonText className="h-4 w-32" />
              <SkeletonText className="h-4 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const circumference = 2 * Math.PI * 26;
  const offset = circumference * (1 - health.score / 100);

  return (
    <Card>
      <CardHeader title="Health Score" description="Weighted across revenue, connectors, goals, and workflow" />
      <CardContent>
        <div className="flex items-center gap-5">
          <div className="relative h-16 w-16 flex-shrink-0">
            <svg viewBox="0 0 60 60" className="h-16 w-16 -rotate-90">
              <circle cx="30" cy="30" r="26" fill="none" stroke="var(--border)" strokeWidth="5" />
              <circle
                cx="30"
                cy="30"
                r="26"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={ringColor(health.score)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">{health.score}</div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{health.label}</p>
            <div className="mt-1 space-y-1">
              {health.strengths.slice(0, 2).map(s => (
                <p key={s} className="flex items-center gap-1.5 text-xs text-success">
                  <CheckCircle2 size={12} /> {s}
                </p>
              ))}
              {health.risks.slice(0, 2).map(r => (
                <p key={r} className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertTriangle size={12} /> {r}
                </p>
              ))}
              {health.strengths.length === 0 && health.risks.length === 0 && <p className="text-xs text-muted-foreground">Steady across all signals.</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
