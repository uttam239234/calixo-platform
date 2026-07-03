"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { SkeletonText } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Globe, RefreshCw, AlertCircle, Wifi, WifiOff, Loader2 } from "lucide-react";
import { connectedPlatforms } from "./mock-data";
import type { ConnectedPlatform } from "./types";

const platformColors: Record<string, string> = {
  google: "text-blue-500",
  meta: "text-blue-600",
  linkedin: "text-blue-700",
  instagram: "text-pink-500",
  youtube: "text-red-500",
};

const statusConfig = {
  connected: { label: "Connected", icon: Wifi, className: "text-success bg-success/10 border-success/20" },
  syncing: { label: "Syncing", icon: Loader2, className: "text-primary bg-primary/10 border-primary/20" },
  error: { label: "Error", icon: AlertCircle, className: "text-destructive bg-destructive/10 border-destructive/20" },
  disconnected: { label: "Disconnected", icon: WifiOff, className: "text-muted-foreground bg-muted/10 border-border/60" },
};

function PlatformRow({ platform }: { platform: ConnectedPlatform }) {
  const status = statusConfig[platform.status];
  const StatusIcon = status.icon;
  const color = platformColors[platform.platform] ?? "text-foreground";

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-background/60 px-4 py-3.5 transition-all duration-150 hover:bg-accent/50 hover:border-border/80">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-card/80 border border-border/30 ${color}`}>
          <Globe size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{platform.name}</p>
          <p className="text-xs text-muted-foreground">{platform.lastSync}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-medium ${status.className}`}>
          <StatusIcon size={12} className={platform.status === "syncing" ? "animate-spin" : ""} />
          {status.label}
        </span>
        {platform.status === "error" && (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

function PlatformSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-background/60 px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-border/40 via-border/60 to-border/40 animate-pulse" />
        <div className="space-y-1.5">
          <SkeletonText className="h-4 w-24" />
          <SkeletonText className="h-3 w-16" />
        </div>
      </div>
      <SkeletonText className="h-5 w-20" />
    </div>
  );
}

interface ConnectedPlatformsProps {
  loading?: boolean;
}

export default function ConnectedPlatforms({ loading = false }: ConnectedPlatformsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader title="Connected Platforms" description="Integration status" />
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <PlatformSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (connectedPlatforms.length === 0) {
    return (
      <Card>
        <CardHeader title="Connected Platforms" description="Integration status" />
        <CardContent>
          <EmptyState
            icon={<Globe size={32} />}
            title="No platforms connected"
            description="Connect your marketing platforms to see their status here."
            action={{ label: "Connect Platform", onClick: () => {} }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Connected Platforms"
        description="Integration status"
        action={
          <Button variant="outline" size="sm" icon={<RefreshCw size={14} />}>
            Refresh All
          </Button>
        }
      />
      <CardContent>
        <div className="space-y-2">
          {connectedPlatforms.map((platform) => (
            <PlatformRow key={platform.id} platform={platform} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}