"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { BarChart3, ArrowUpRight } from "lucide-react";
import { useCampaigns } from "@/features/ads/CampaignProvider";

export function PerformanceSnapshot() {
  const { performance, roasInsight } = useCampaigns();
  const bars = [48, 56, 49, 65, 62, 74, 69, 82, 78, 91, 86, 100];

  return (
    <Card>
      <CardHeader
        title="Performance Snapshot"
        description="Blended return across platforms"
        action={<BarChart3 size={18} className="text-primary" />}
      />
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums">{performance.roas.toFixed(2)}x</span>
            <p className="mt-1 text-xs text-success flex items-center gap-1">
              <ArrowUpRight size={13} />
              {performance.roasChange}% this month
            </p>
          </div>
          <div className="flex h-20 items-end gap-1.5">
            {bars.map((height, index) => (
              <div
                key={index}
                className="w-2 rounded-t-sm bg-primary/60 transition-all duration-200 hover:bg-primary"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 divide-x divide-border rounded-2xl border border-border/50 bg-card/50 py-3 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="mt-1 text-sm font-semibold text-foreground tabular-nums">${(performance.revenue / 1000).toFixed(1)}K</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">CTR</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{performance.ctr}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Conv.</p>
            <p className="mt-1 text-sm font-semibold text-foreground tabular-nums">{performance.conversions.toLocaleString()}</p>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">{roasInsight}</p>
      </CardContent>
    </Card>
  );
}