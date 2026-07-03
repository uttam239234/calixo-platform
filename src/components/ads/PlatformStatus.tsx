"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { CheckCircle2, Clock3, RefreshCw, TriangleAlert } from "lucide-react";
import { platforms } from "@/features/ads/mock-data";

export function PlatformStatus() {
  return (
    <Card>
      <CardHeader
        title="Platform Status"
        description="Connection health"
        action={<span className="text-xs font-medium text-success">4 of 5 healthy</span>}
      />
      <CardContent>
        <div className="space-y-2">
          {platforms.map((platform) => {
            const StatusIcon = platform.status === "Connected"
              ? CheckCircle2
              : platform.status === "Syncing"
              ? RefreshCw
              : TriangleAlert;

            return (
              <div
                key={platform.id}
                className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-3 transition-all duration-150 hover:bg-accent/50 hover:border-border/80"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
                  style={{ backgroundColor: `${platform.color}20`, color: platform.color }}
                >
                  {platform.shortName}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{platform.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 size={11} />
                    {platform.lastSync} · {platform.campaignCount} campaigns
                  </p>
                </div>
                <StatusIcon
                  size={16}
                  className={
                    platform.status === "Connected"
                      ? "text-success"
                      : platform.status === "Syncing"
                      ? "animate-spin text-primary"
                      : "text-warning"
                  }
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}