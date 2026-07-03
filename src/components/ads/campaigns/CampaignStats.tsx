"use client";

import { CircleDollarSign, MousePointerClick, Target, TrendingUp } from "lucide-react";
import type { Campaign } from "@/features/ads/types";

const fmt = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toLocaleString();

export function CampaignStats({ campaigns }: { campaigns: Campaign[] }) {
  const spend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const revenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const conversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const clicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);

  const items = [
    { label: "Managed spend", value: `$${fmt(spend)}`, icon: CircleDollarSign },
    { label: "Revenue", value: `$${fmt(revenue)}`, icon: TrendingUp },
    { label: "Conversions", value: conversions.toLocaleString(), icon: Target },
    { label: "Clicks", value: `${fmt(clicks)}`, icon: MousePointerClick },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, icon: Icon }) => (
        <div key={label} className="card card-padding-sm hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{label}</span>
            <Icon size={16} className="text-primary" />
          </div>
          <p className="mt-2 text-xl font-bold tracking-tight text-foreground tabular-nums">{value}</p>
        </div>
      ))}
    </div>
  );
}