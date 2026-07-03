"use client";

import Link from "next/link";
import { Archive, Copy, Eye, MoreHorizontal, Pause, Play, Trash2 } from "lucide-react";
import type { Campaign, Platform } from "@/features/ads/types";
import { campaignStatusStyle } from "./CampaignRow";

interface Props {
  campaign: Campaign;
  platform: Platform;
  selected: boolean;
  onSelect: () => void;
  onAction: (action: string) => void;
}

export function CampaignCard({ campaign, platform, selected, onSelect, onAction }: Props) {
  return (
    <div className={`card card-padding-md transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover ${selected ? "border-primary/50" : ""}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold" style={{ backgroundColor: `${platform.color}20`, color: platform.color }}>
            {platform.shortName}
          </span>
          <div>
            <p className="text-xs text-muted-foreground">{platform.name}</p>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] ${campaignStatusStyle[campaign.status]}`}>{campaign.status}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={selected} onChange={onSelect} className="size-4 accent-primary" />
          <details className="relative">
            <summary className="list-none cursor-pointer text-muted-foreground hover:text-foreground"><MoreHorizontal size={18} /></summary>
            <div className="absolute right-0 z-30 mt-1 w-40 rounded-xl border border-border bg-card p-1.5 shadow-dropdown">
              {[["View", Eye], ["Edit", Eye], ["Duplicate", Copy], [campaign.status === "Paused" ? "Resume" : "Pause", campaign.status === "Paused" ? Play : Pause], ["Archive", Archive], ["Delete", Trash2]].map(([label, Icon]) => (
                <button
                  key={label as string}
                  onClick={() => onAction(label as string)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs hover:bg-accent ${label === "Delete" ? "text-destructive" : "text-foreground"}`}
                >
                  <Icon size={14} />{label as string}
                </button>
              ))}
            </div>
          </details>
        </div>
      </div>
      <Link href={`/dashboard/ads/campaigns/${campaign.id}`} className="mt-4 block text-base font-semibold text-foreground hover:text-primary transition-colors">
        {campaign.name}
      </Link>
      <p className="mt-1 text-xs text-muted-foreground">{campaign.objective} · {campaign.owner}</p>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <div>
          <p className="text-xs text-muted-foreground">Spend</p>
          <p className="mt-1 text-sm font-medium text-foreground tabular-nums">${campaign.spend.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Conversions</p>
          <p className="mt-1 text-sm font-medium text-foreground tabular-nums">{campaign.conversions}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">ROAS</p>
          <p className="mt-1 text-sm font-medium tabular-nums text-success">{campaign.roas.toFixed(1)}x</p>
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-ai" style={{ width: `${Math.min(100, (campaign.spend / campaign.budget) * 100)}%` }} />
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">{Math.round((campaign.spend / campaign.budget) * 100)}% of ${campaign.budget.toLocaleString()} budget</p>
    </div>
  );
}