"use client";

import Link from "next/link";
import { ArrowLeft, Copy, Pause, Play, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { campaignStatusStyle } from "./CampaignRow";
import type { Campaign, Platform } from "@/features/ads/types";

export function CampaignHeader({ campaign, platform, onEdit, onAction }: {
  campaign: Campaign;
  platform: Platform;
  onEdit: () => void;
  onAction: (action: "Pause" | "Resume" | "Duplicate") => void;
}) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <Link href="/dashboard/ads/campaigns" className="mb-4 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={14} /> All campaigns
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl font-bold" style={{ backgroundColor: `${platform.color}20`, color: platform.color }}>
            {platform.shortName}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{campaign.name}</h1>
              <span className={`badge ${campaignStatusStyle[campaign.status]}`}>{campaign.status}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{platform.name} · {campaign.objective} · Owned by {campaign.owner}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => onAction("Duplicate")}>
          <Copy size={14} /> Duplicate
        </Button>
        <Button variant="outline" size="sm" onClick={() => onAction(campaign.status === "Paused" ? "Resume" : "Pause")}>
          {campaign.status === "Paused" ? <Play size={14} /> : <Pause size={14} />}
          {campaign.status === "Paused" ? "Resume" : "Pause"}
        </Button>
        <Button variant="primary" size="sm" onClick={onEdit}>
          <Pencil size={14} /> Edit campaign
        </Button>
      </div>
    </div>
  );
}