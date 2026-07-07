"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { SkeletonText } from "@/components/ui/Skeleton";
import { CircleDollarSign, Users, TrendingDown, TrendingUp, Percent, BarChart3, ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DashboardMarketingKpi } from "@/core/dashboard";

const iconMap: Record<string, LucideIcon> = {
  revenue: CircleDollarSign,
  spend: TrendingDown,
  roas: BarChart3,
  cpa: TrendingDown,
  "conversion-rate": Percent,
  leads: Users,
  sales: TrendingUp,
  growth: TrendingUp,
};

const trendIconMap: Record<string, LucideIcon> = {
  up: ArrowUp,
  down: ArrowDown,
  steady: Minus,
};

function AnimatedNumber({ value, duration = 800 }: { value: string; duration?: number }) {
  const displayRef = useRef<HTMLSpanElement>(null);
  const initialValue = value;

  useEffect(() => {
    let cancelled = false;

    const match = value.match(/^([$,]?)([\d,.]+)([KMBx%pts]*)$/);
    if (!match || !match[2]) {
      return;
    }

    const prefix = match[1] || "";
    const numStr = match[2];
    const suffix = match[3] || "";
    const targetNum = parseFloat(numStr.replace(/,/g, ""));

    if (isNaN(targetNum)) {
      return;
    }

    const startTime = performance.now();

    function animate(currentTime: number) {
      if (cancelled || !displayRef.current) return;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = targetNum * eased;

      if (Number.isInteger(targetNum)) {
        displayRef.current.textContent = `${prefix}${Math.round(current)}${suffix}`;
      } else {
        const decimals = numStr.split(".")[1]?.length || 0;
        displayRef.current.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        displayRef.current.textContent = value;
      }
    }

    requestAnimationFrame(animate);

    return () => {
      cancelled = true;
    };
  }, [value, duration]);

  return <span ref={displayRef} className="tabular-nums">{initialValue}</span>;
}

function KpiCard({ item }: { item: DashboardMarketingKpi }) {
  const Icon: LucideIcon = iconMap[item.id] ?? TrendingUp;
  const TrendIcon: LucideIcon = trendIconMap[item.trend] ?? Minus;
  const trendColor = item.tone === "positive" ? "text-success" : item.tone === "negative" ? "text-destructive" : "text-muted-foreground";

  return (
    <Card className="transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              <AnimatedNumber value={item.value} />
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-[#8B5CF6]/10 text-primary">
            <Icon size={22} />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-sm font-semibold ${trendColor}`}>
            <TrendIcon size={14} />
            {item.change}
          </span>
          <span className="text-xs text-muted-foreground">{item.comparison}</span>
        </div>

        <div className="mt-3 h-8 w-full">
          <svg viewBox="0 0 100 32" className="h-full w-full overflow-visible">
            <defs>
              <linearGradient id={`sparklineGrad-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.01" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#sparklineGrad-${item.id})`}
              d={`M${item.sparkline.map((v, i) => {
                const x = (i / Math.max(item.sparkline.length - 1, 1)) * 100;
                const max = Math.max(...item.sparkline);
                const min = Math.min(...item.sparkline);
                const range = max - min || 1;
                const y = 32 - ((v - min) / range) * 24 - 4;
                return `${i === 0 ? "" : "L"}${x},${y}`;
              }).join(" ")} L100,32 L0,32 Z`}
            />
            <polyline
              fill="none"
              stroke="var(--primary)"
              strokeWidth="1.5"
              strokeOpacity="0.6"
              points={item.sparkline.map((v, i) => {
                const x = (i / Math.max(item.sparkline.length - 1, 1)) * 100;
                const max = Math.max(...item.sparkline);
                const min = Math.min(...item.sparkline);
                const range = max - min || 1;
                const y = 32 - ((v - min) / range) * 24 - 4;
                return `${x},${y}`;
              }).join(" ")}
            />
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

function KpiCardSkeleton() {
  return (
    <Card>
      <CardContent>
        <div className="space-y-3">
          <SkeletonText className="h-4 w-24" />
          <SkeletonText className="h-8 w-28" />
          <SkeletonText className="h-4 w-36" />
          <div className="h-8 w-full rounded-xl bg-gradient-to-r from-border/40 via-border/60 to-border/40 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

interface KpiGridProps {
  items: DashboardMarketingKpi[];
  loading?: boolean;
}

export default function KpiGrid({ items, loading = false }: KpiGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <KpiCard key={item.id} item={item} />
      ))}
    </div>
  );
}
