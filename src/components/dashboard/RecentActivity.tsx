"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { SkeletonText } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Clock, Activity, User, Bot, RefreshCw, Database } from "lucide-react";
import type { DashboardActivityEntry } from "@/core/dashboard";

const ACTOR_ICON: Record<string, { icon: typeof User; className: string }> = {
  System: { icon: RefreshCw, className: "bg-success/10 text-success" },
  "AI Copilot": { icon: Bot, className: "bg-ai/10 text-ai" },
  You: { icon: User, className: "bg-primary/10 text-primary" },
};

function iconFor(actor: string) {
  return ACTOR_ICON[actor] ?? { icon: Database, className: "bg-muted/20 text-muted-foreground" };
}

function timeAgo(timestamp: string): string {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function ActivityRow({ item, isLast }: { item: DashboardActivityEntry; isLast: boolean }) {
  const { icon: TypeIcon, className } = iconFor(item.actor);

  return (
    <div className="relative flex items-start gap-4 group">
      {!isLast && <div className="absolute left-[17px] top-10 bottom-0 w-px bg-border/60" aria-hidden="true" />}
      <div className={`relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${className} transition-all duration-200 group-hover:scale-110`}>
        <TypeIcon size={15} />
      </div>
      <div className="flex-1 min-w-0 pb-5">
        <div className="rounded-xl border border-border/50 bg-card/50 px-4 py-3 transition-all duration-150 hover:bg-accent/50 hover:border-border/80 hover:shadow-sm">
          <p className="text-sm text-foreground">
            <span className="font-semibold">{item.actor}</span> <span className="text-muted-foreground">{item.action}</span> <span className="font-medium text-primary">{item.target}</span>
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock size={11} />
            {timeAgo(item.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex items-start gap-4">
      <div className="h-9 w-9 rounded-xl bg-gradient-to-r from-border/40 via-border/60 to-border/40 animate-pulse" />
      <div className="flex-1 space-y-1.5 pb-5">
        <SkeletonText className="h-4 w-3/4" />
        <SkeletonText className="h-3 w-1/4" />
      </div>
    </div>
  );
}

interface RecentActivityProps {
  items: DashboardActivityEntry[];
  loading?: boolean;
}

export default function RecentActivity({ items, loading = false }: RecentActivityProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader title="Recent Activity" description="Live feed" />
        <CardContent>
          <div className="space-y-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <ActivitySkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader title="Recent Activity" description="Live feed" />
        <CardContent>
          <EmptyState icon={<Activity size={32} />} title="No recent activity" description="Activity from workflow, assets, and dashboard changes will appear here." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Recent Activity"
        description="Live feed — workflow, assets, and dashboard changes"
        action={
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          </span>
        }
      />
      <CardContent>
        <div className="space-y-1">
          {items.map((item, index) => (
            <ActivityRow key={item.id} item={item} isLast={index === items.length - 1} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
