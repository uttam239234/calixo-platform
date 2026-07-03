"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { SkeletonText } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { BellRing, AlertTriangle, AlertCircle, Info, CheckCircle2, X } from "lucide-react";
import { notifications } from "./mock-data";
import type { NotificationItem } from "./types";

const severityConfig = {
  critical: { icon: AlertTriangle, className: "bg-destructive/10 text-destructive border-destructive/20" },
  warning: { icon: AlertCircle, className: "bg-warning/10 text-warning border-warning/20" },
  info: { icon: Info, className: "bg-primary/10 text-primary border-primary/20" },
  success: { icon: CheckCircle2, className: "bg-success/10 text-success border-success/20" },
};

function NotificationRow({ item }: { item: NotificationItem }) {
  const config = severityConfig[item.severity];
  const SevIcon = config.icon;

  return (
    <div className={`rounded-lg border ${item.read ? "border-border bg-background" : "border-primary/20 bg-primary/5"} p-3 transition-colors hover:bg-accent/50`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${config.className}`}>
            <SevIcon size={14} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className={`text-sm ${item.read ? "text-foreground" : "font-semibold text-foreground"}`}>
                {item.title}
              </p>
              {!item.read && <span className="h-2 w-2 rounded-full bg-primary" />}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{item.description}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">{item.timestamp}</span>
              {item.action && (
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] font-medium text-primary">
                  {item.action}
                </Button>
              )}
            </div>
          </div>
        </div>
        <button type="button" className="flex-shrink-0 text-muted-foreground hover:text-foreground" aria-label="Dismiss">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        <div className="flex-1 space-y-1.5">
          <SkeletonText className="h-4 w-3/4" />
          <SkeletonText className="h-3 w-full" />
          <SkeletonText className="h-3 w-1/4" />
        </div>
      </div>
    </div>
  );
}

interface NotificationsProps {
  loading?: boolean;
}

export default function Notifications({ loading = false }: NotificationsProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <Card>
        <CardHeader title="Notifications" description="Alerts & updates" />
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader title="Notifications" description="Alerts & updates" />
        <CardContent>
          <EmptyState
            icon={<BellRing size={32} />}
            title="All caught up"
            description="No new notifications. You're up to date."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Notifications"
        description="Alerts & updates"
        action={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-destructive px-2 py-0.5 text-[11px] font-bold text-white">
                {unreadCount}
              </span>
            )}
            <Button variant="ghost" size="sm" className="text-xs">
              Mark all read
            </Button>
          </div>
        }
      />
      <CardContent>
        <div className="space-y-2">
          {notifications.map((item) => (
            <NotificationRow key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}