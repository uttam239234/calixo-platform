"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { AnalyticsCampaignRow } from "@/core/analytics";

interface CampaignPerformanceProps {
  rows: AnalyticsCampaignRow[];
  activeCampaign?: string;
  onSelectCampaign?: (campaign: string) => void;
}

export function CampaignPerformance({ rows: campaignPerformance, activeCampaign, onSelectCampaign }: CampaignPerformanceProps) {
  return (
    <Card>
      <CardHeader title="Campaign Performance" description={onSelectCampaign ? "High-yield initiatives and conversion efficiency — click a card to cross-filter" : "High-yield initiatives and conversion efficiency"} />
      <CardContent>
        <div className="space-y-4">
          {campaignPerformance.map((campaign) => (
            <div
              key={campaign.name}
              onClick={() => onSelectCampaign?.(campaign.name)}
              className={`rounded-2xl border border-border/50 bg-card/50 p-4 transition-all duration-150 hover:bg-accent/50 hover:border-border/80 ${onSelectCampaign ? "cursor-pointer" : ""} ${activeCampaign === campaign.name ? "border-primary/50 bg-primary/5" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{campaign.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{campaign.conversions} conversions • {campaign.revenue}</p>
                </div>
                <span className="badge badge-primary">ROI {campaign.roi}</span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Clicks</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground tabular-nums">{campaign.clicks.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">CTR</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{campaign.ctr}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">CPC</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{campaign.cpc}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Spend</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{campaign.spend}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}