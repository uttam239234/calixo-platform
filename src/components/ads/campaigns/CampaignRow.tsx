"use client";

import Link from "next/link";
import { Archive, Copy, Eye, MoreHorizontal, Pause, Play, Trash2 } from "lucide-react";
import type { Campaign } from "@/features/ads/types";
import type { Platform } from "@/features/ads/types";

export const campaignStatusStyle: Record<string, string> = {
  Draft: "badge-secondary",
  Review: "badge-warning",
  Scheduled: "badge-primary",
  Running: "badge-success",
  Paused: "badge-warning",
  Completed: "badge-primary",
  Archived: "badge-secondary",
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

interface Props {
  campaign: Campaign;
  platform: Platform;
  selected: boolean;
  onSelect: () => void;
  onAction: (action: string) => void;
}

export function CampaignRow({ campaign, platform, selected, onSelect, onAction }: Props) {
  return (
    <tr className={`group transition hover:bg-accent/30 ${selected ? "bg-primary/5" : ""}`}>
      <td className="px-4 py-4">
        <input type="checkbox" checked={selected} onChange={onSelect} className="size-4 accent-primary" aria-label={`Select ${campaign.name}`} />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold" style={{ backgroundColor: `${platform.color}20`, color: platform.color }}>
            {platform.shortName}
          </span>
          <div>
            <Link href={`/dashboard/ads/campaigns/${campaign.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
              {campaign.name}
            </Link>
            <p className="mt-0.5 text-xs text-muted-foreground">{platform.name} · {campaign.owner}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-muted-foreground">{campaign.objective}</td>
      <td className="px-4 py-4"><span className={`badge ${campaignStatusStyle[campaign.status]}`}>{campaign.status}</span></td>
      <td className="px-4 py-4 tabular-nums text-foreground">{money.format(campaign.spend)}</td>
      <td className="px-4 py-4 tabular-nums text-foreground">{campaign.conversions}</td>
      <td className="px-4 py-4 tabular-nums text-foreground">{campaign.ctr.toFixed(2)}%</td>
      <td className="px-4 py-4 font-medium tabular-nums text-success">{campaign.roas.toFixed(1)}x</td>
      <td className="px-4 py-4">
        <details className="relative">
          <summary className="list-none cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            <MoreHorizontal size={17} />
          </summary>
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
      </td>
    </tr>
  );
}