"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { SkeletonText } from "@/components/ui/Skeleton";
import { Banknote, Eye, MousePointerClick, Target, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { performance } from "@/features/ads/mock-data";

const items = [
  { label: "Total Spend", value: `$${(performance.spend / 1000).toFixed(1)}K`, change: performance.spendChange, icon: Banknote },
  { label: "Revenue", value: `$${(performance.revenue / 1000).toFixed(1)}K`, change: performance.roasChange, icon: TrendingUp },
  { label: "Impressions", value: `${(performance.impressions / 1000000).toFixed(2)}M`, change: 11.6, icon: Eye },
  { label: "Clicks", value: `${(performance.clicks / 1000).toFixed(1)}K`, change: 9.3, icon: MousePointerClick },
  { label: "Conversions", value: performance.conversions.toLocaleString(), change: performance.conversionChange, icon: Target },
  { label: "ROAS", value: `${performance.roas.toFixed(1)}x`, change: performance.roasChange, icon: TrendingUp },
];

function AnimatedValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.textContent = value;
  }, [value]);
  return <span ref={ref} className="tabular-nums">{value}</span>;
}

function KpiCardSkeleton() {
  return (
    <Card>
      <CardContent>
        <div className="space-y-3">
          <SkeletonText className="h-4 w-20" />
          <SkeletonText className="h-8 w-24" />
          <SkeletonText className="h-4 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

interface CampaignSummaryProps {
  loading?: boolean;
}

export function CampaignSummary({ loading = false }: CampaignSummaryProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      {items.map(({ label, value, change, icon: Icon }) => (
        <Card key={label} className="hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
          <CardContent>
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  <AnimatedValue value={value} />
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-ai/10 text-primary">
                <Icon size={20} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 text-sm font-semibold ${change >= 0 ? "text-success" : "text-destructive"}`}>
                {change >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                {change >= 0 ? "+" : ""}{change}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}