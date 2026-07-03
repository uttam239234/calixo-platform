"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { Campaign } from "@/features/ads/types";

export function CampaignBudget({ campaign }: { campaign: Campaign }) {
  const pct = Math.min(100, Math.round(campaign.spend / campaign.budget * 100));

  return (
    <Card>
      <CardHeader title="Budget" description="Total allocation" />
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total allocation</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular-nums">${campaign.budget.toLocaleString()}</p>
          </div>
          <span className="text-sm font-medium text-primary">{pct}% spent</span>
        </div>
        <div className="mt-4 h-2 rounded-full bg-border">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-ai transition-all duration-1000 ease-out" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-border/50 bg-card/50 p-3">
            <span className="text-muted-foreground">Spent</span>
            <p className="mt-1 font-medium text-foreground tabular-nums">${campaign.spend.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/50 p-3">
            <span className="text-muted-foreground">Remaining</span>
            <p className="mt-1 font-medium text-foreground tabular-nums">${Math.max(0, campaign.budget - campaign.spend).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}