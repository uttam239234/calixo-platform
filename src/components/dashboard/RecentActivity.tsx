"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { SkeletonText } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Clock, Activity, User, Bot, RefreshCw, Database } from "lucide-react";
import { recentActivity } from "./mock-data";
import type { ActivityItem } from "./types";

const typeConfig = {
  user: { icon: User, className: "bg-primary/10 text-primary" },
  system: { icon: RefreshCw, className: "bg-success/10 text-success" },
  ai: { icon: Bot, className: "bg-ai/10 text-ai" },
  integration: { icon: Database, className: "bg-muted/20 text-muted-foreground" },
};

function ActivityRow({ item, index }: { item: ActivityItem; index: number }) {
  const config = typeConfig[item.type];
  const TypeIcon = config.icon;

  return (
    <div className="relative flex items-start gap-4 group">
      {/* Timeline line */}
      {index < recentActivity.length - 1 && (
        <div className="absolute left-[17px] top-10 bottom-0 w-px bg-border/60" aria-hidden="true" />
      )}
      {/* Icon */}
      <div className={`relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${config.className} transition-all duration-200 group-hover:scale-110`}>
        <TypeIcon size={15} />
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0 pb-5">
        <div className="rounded-xl border border-border/50 bg-card/50 px-4 py-3 transition-all duration-150 hover:bg-accent/50 hover:border-border/80 hover:shadow-sm">
          <p className="text-sm text-foreground">
            <span className="font-semibold">{item.user}</span>{" "}
            <span className="text-muted-foreground">{item.action}</span>{" "}
            <span className="font-medium text-primary">{item.target}</span>
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock size={11} />
            {item.timestamp}
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
  loading?: boolean;
}

export default function RecentActivity({ loading = false }: RecentActivityProps) {
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

  if (recentActivity.length === 0) {
    return (
      <Card>
        <CardHeader title="Recent Activity" description="Live feed" />
        <CardContent>
          <EmptyState
            icon={<Activity size={32} />}
            title="No recent activity"
            description="Activity from your team and integrations will appear here."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Recent Activity"
        description="Live feed"
        action={
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          </span>
        }
      />
      <CardContent>
        <div className="space-y-1">
          {recentActivity.map((item, index) => (
            <ActivityRow key={item.id} item={item} index={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}