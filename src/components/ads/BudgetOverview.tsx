"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { WalletCards, TrendingUp } from "lucide-react";
import { useCampaigns } from "@/features/ads/CampaignProvider";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });

export function BudgetOverview() {
  const { budget } = useCampaigns();
  const used = Math.round((budget.spent / budget.total) * 100);

  return (
    <Card>
      <CardHeader
        title="Budget Overview"
        description={budget.period}
        action={<WalletCards size={18} className="text-primary" />}
      />
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums">{currency.format(budget.spent)}</span>
            <span className="text-sm text-muted-foreground"> / {currency.format(budget.total)}</span>
          </div>
          <span className="text-sm font-medium text-primary">{used}% used</span>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-ai transition-all duration-1000 ease-out"
            style={{ width: `${used}%` }}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border/50 bg-card/50 p-3">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="mt-1 font-semibold text-foreground tabular-nums">{currency.format(budget.remaining)}</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/50 p-3">
            <p className="text-xs text-muted-foreground">Projected</p>
            <p className="mt-1 font-semibold text-foreground tabular-nums">{currency.format(budget.projected)}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <TrendingUp size={12} className="text-success" />
          <span>On track to stay within budget</span>
        </div>
      </CardContent>
    </Card>
  );
}