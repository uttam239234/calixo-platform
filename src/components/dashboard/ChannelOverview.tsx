"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { SkeletonText } from "@/components/ui/Skeleton";
import { ArrowUp, ArrowDown, Minus, Globe } from "lucide-react";
import { channelData } from "./mock-data";
import type { ChannelData as ChannelDataItem } from "./types";

const platformColors: Record<string, string> = {
  google: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  meta: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  linkedin: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  instagram: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
  youtube: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

const trendIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  up: ArrowUp,
  down: ArrowDown,
  steady: Minus,
};

const trendColors: Record<string, string> = {
  up: "text-success",
  down: "text-destructive",
  steady: "text-muted-foreground",
};

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  paused: "bg-warning/10 text-warning border-warning/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

function ChannelRow({ channel }: { channel: ChannelDataItem }) {
  const TrendIcon = trendIcons[channel.trend] ?? Minus;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/50 px-4 py-3.5 transition-all duration-150 hover:bg-accent/50 hover:border-border/80 hover:shadow-sm">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${platformColors[channel.platform] ?? "bg-muted/20 text-muted-foreground"}`}>
          <Globe size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{channel.name}</p>
        </div>
      </div>
      <div className="hidden sm:block text-right min-w-[80px]">
        <p className="text-sm font-semibold tabular-nums text-foreground">{channel.spend}</p>
        <p className="text-[11px] text-muted-foreground">Spend</p>
      </div>
      <div className="hidden md:block text-right min-w-[80px]">
        <p className="text-sm font-semibold tabular-nums text-foreground">{channel.clicks}</p>
        <p className="text-[11px] text-muted-foreground">Clicks</p>
      </div>
      <div className="hidden lg:block text-right min-w-[60px]">
        <p className="text-sm font-semibold tabular-nums text-foreground">{channel.ctr}</p>
        <p className="text-[11px] text-muted-foreground">CTR</p>
      </div>
      <div className="min-w-[40px] flex justify-center">
        <TrendIcon size={16} className={trendColors[channel.trend]} />
      </div>
      <div>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${statusColors[channel.status]}`}>
          {channel.status}
        </span>
      </div>
    </div>
  );
}

function ChannelSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/50 px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-border/40 via-border/60 to-border/40 animate-pulse" />
        <SkeletonText className="h-4 w-24" />
      </div>
      <SkeletonText className="h-4 w-16" />
      <SkeletonText className="h-4 w-16" />
      <SkeletonText className="h-4 w-12" />
    </div>
  );
}

interface ChannelOverviewProps {
  loading?: boolean;
}

export default function ChannelOverview({ loading = false }: ChannelOverviewProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader title="Channel Overview" description="Cross-channel performance" />
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <ChannelSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Channel Overview"
        description="Cross-channel performance"
      />
      <CardContent>
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            <div className="flex-1">Channel</div>
            <div className="hidden sm:block text-right min-w-[80px]">Spend</div>
            <div className="hidden md:block text-right min-w-[80px]">Clicks</div>
            <div className="hidden lg:block text-right min-w-[60px]">CTR</div>
            <div className="min-w-[40px] text-center">Trend</div>
            <div>Status</div>
          </div>
          {channelData.map((channel) => (
            <ChannelRow key={channel.id} channel={channel} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}