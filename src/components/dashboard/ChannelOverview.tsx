"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { SkeletonText } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Globe } from "lucide-react";
import type { DashboardChannelRow } from "@/core/dashboard";

const statusColors: Record<string, string> = {
  Healthy: "bg-success/10 text-success border-success/20",
  Monitoring: "bg-warning/10 text-warning border-warning/20",
  Optimizing: "bg-destructive/10 text-destructive border-destructive/20",
};

function ChannelRow({ channel }: { channel: DashboardChannelRow }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/50 px-4 py-3.5 transition-all duration-150 hover:bg-accent/50 hover:border-border/80 hover:shadow-sm">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
        <p className="text-sm font-semibold tabular-nums text-foreground">{channel.revenue}</p>
        <p className="text-[11px] text-muted-foreground">Revenue</p>
      </div>
      <div className="hidden lg:block text-right min-w-[60px]">
        <p className="text-sm font-semibold tabular-nums text-foreground">{channel.roas}</p>
        <p className="text-[11px] text-muted-foreground">ROAS</p>
      </div>
      <div className="hidden lg:block text-right min-w-[60px]">
        <p className="text-sm font-semibold tabular-nums text-foreground">{channel.cpa}</p>
        <p className="text-[11px] text-muted-foreground">CPA</p>
      </div>
      <div>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusColors[channel.status]}`}>{channel.status}</span>
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
  rows: DashboardChannelRow[];
  loading?: boolean;
}

export default function ChannelOverview({ rows, loading = false }: ChannelOverviewProps) {
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
      <CardHeader title="Channel Overview" description="Cross-channel performance — last 30 days" />
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState icon={<Globe size={32} />} title="No channel data" description="Channel performance will appear here once campaigns are running." />
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              <div className="flex-1">Channel</div>
              <div className="hidden sm:block text-right min-w-[80px]">Spend</div>
              <div className="hidden md:block text-right min-w-[80px]">Revenue</div>
              <div className="hidden lg:block text-right min-w-[60px]">ROAS</div>
              <div className="hidden lg:block text-right min-w-[60px]">CPA</div>
              <div>Status</div>
            </div>
            {rows.map((channel) => (
              <ChannelRow key={channel.id} channel={channel} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
