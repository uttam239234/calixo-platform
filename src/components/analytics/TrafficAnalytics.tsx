"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { trafficMetrics } from "./mock-data";

export function TrafficAnalytics() {
  return (
    <Card>
      <CardHeader title="Traffic Analytics" description="Pulse of acquisition and engagement" />
      <CardContent>
        <div className="space-y-3">
          {trafficMetrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-border/50 bg-card/50 p-4 transition-all duration-150 hover:bg-accent/50 hover:border-border/80">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <span className="text-sm font-semibold text-success">{metric.change}</span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">{metric.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}