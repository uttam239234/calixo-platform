"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { useBrandMonitoring } from "@/features/brand/BrandMonitoringProvider";

function ringColor(score: number): string {
  if (score >= 85) return "text-success";
  if (score >= 70) return "text-primary";
  if (score >= 50) return "text-warning";
  return "text-destructive";
}

export function BrandHealthScoreCard() {
  const { healthScore } = useBrandMonitoring();
  const circumference = 2 * Math.PI * 26;
  const offset = circumference * (1 - healthScore.score / 100);

  return (
    <Card>
      <CardHeader title="Reputation Health Score" description="Sentiment, share of voice, crisis risk, response speed, and competitor position" />
      <CardContent>
        <div className="flex items-center gap-5">
          <div className="relative h-16 w-16 flex-shrink-0">
            <svg viewBox="0 0 60 60" className="h-16 w-16 -rotate-90">
              <circle cx="30" cy="30" r="26" fill="none" stroke="var(--border)" strokeWidth="5" />
              <circle cx="30" cy="30" r="26" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className={ringColor(healthScore.score)} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">{healthScore.score}</div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{healthScore.label}</p>
            <div className="mt-1 space-y-1">
              {healthScore.strengths.slice(0, 2).map(s => (
                <p key={s} className="flex items-center gap-1.5 text-xs text-success">
                  <CheckCircle2 size={12} /> {s}
                </p>
              ))}
              {healthScore.risks.slice(0, 2).map(r => (
                <p key={r} className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertTriangle size={12} /> {r}
                </p>
              ))}
              {healthScore.strengths.length === 0 && healthScore.risks.length === 0 && <p className="text-xs text-muted-foreground">Steady across all signals.</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
