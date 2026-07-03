"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { CheckCircle2, AlertCircle, Loader2, ArrowUpRight } from "lucide-react";
import { platforms } from "@/features/ads/mock-data";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });

const statusConfig: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; className: string }> = {
  Connected: { icon: CheckCircle2, className: "text-success" },
  Syncing: { icon: Loader2, className: "text-primary" },
  "Attention required": { icon: AlertCircle, className: "text-destructive" },
};

export function PlatformOverview() {
  return (
    <Card>
      <CardHeader
        title="Platform Overview"
        description="All accounts · July 2026"
      />
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {platforms.map((platform) => {
            const StatusIcon = statusConfig[platform.status]?.icon ?? CheckCircle2;
            const statusClass = statusConfig[platform.status]?.className ?? "text-muted-foreground";

            return (
              <div
                key={platform.id}
                className="rounded-2xl border border-border/50 bg-card/50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30 group"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold"
                    style={{ backgroundColor: `${platform.color}20`, color: platform.color }}
                  >
                    {platform.shortName}
                  </div>
                  <StatusIcon size={16} className={statusClass} />
                </div>
                <p className="mt-4 text-sm font-semibold text-foreground">{platform.name}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular-nums">{money.format(platform.spend)}</p>
                <div className="mt-4 flex items-end justify-between text-xs text-muted-foreground">
                  <div>
                    <span>{platform.campaignCount} campaigns</span>
                    <br />
                    <span className="font-semibold text-foreground">{platform.roas.toFixed(1)}x ROAS</span>
                  </div>
                  <span className="flex items-center gap-1 text-success">
                    <ArrowUpRight size={13} />
                    {platform.ctr.toFixed(2)}% CTR
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}