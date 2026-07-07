"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { AnalyticsTrafficMetric } from "@/core/analytics";

interface TrafficAnalyticsProps {
  metrics: AnalyticsTrafficMetric[];
}

const toneClass: Record<AnalyticsTrafficMetric["tone"], string> = {
  positive: "text-success",
  negative: "text-destructive",
  neutral: "text-muted-foreground",
};

export function TrafficAnalytics({ metrics }: TrafficAnalyticsProps) {
  return (
    <Card>
      <CardHeader title="Traffic Analytics" description="Pulse of acquisition and engagement" />
      <CardContent>
        <div className="space-y-3">
          {metrics.map((metric) => (
            <div key={metric.id} className="rounded-2xl border border-border/50 bg-card/50 p-4 transition-all duration-150 hover:bg-accent/50 hover:border-border/80">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <span className={cn("text-sm font-semibold", toneClass[metric.tone])}>{metric.change}</span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">{metric.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}