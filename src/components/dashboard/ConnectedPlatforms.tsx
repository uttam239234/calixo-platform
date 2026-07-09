"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { SkeletonText } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Globe, RefreshCw, AlertCircle, Wifi, WifiOff, Loader2, ShieldAlert } from "lucide-react";
import type { DashboardConnectedPlatform } from "@/core/dashboard";

const statusConfig: Record<DashboardConnectedPlatform["status"], { label: string; icon: typeof Wifi; className: string }> = {
  connected: { label: "Connected", icon: Wifi, className: "text-success bg-success/10 border-success/20" },
  connecting: { label: "Connecting", icon: Loader2, className: "text-primary bg-primary/10 border-primary/20" },
  pending: { label: "Pending", icon: Loader2, className: "text-primary bg-primary/10 border-primary/20" },
  error: { label: "Error", icon: AlertCircle, className: "text-destructive bg-destructive/10 border-destructive/20" },
  disconnected: { label: "Disconnected", icon: WifiOff, className: "text-muted-foreground bg-muted/10 border-border/60" },
};

const TOKEN_WARNING_DAYS = 7;

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

function PlatformRow({ platform, onRetry }: { platform: DashboardConnectedPlatform; onRetry: (id: string) => void }) {
  const status = statusConfig[platform.status];
  const StatusIcon = status.icon;
  const [retrying, setRetrying] = useState(false);
  const expiresInDays = platform.tokenExpiresAt ? daysUntil(platform.tokenExpiresAt) : null;
  const tokenExpiringSoon = expiresInDays !== null && expiresInDays <= TOKEN_WARNING_DAYS;

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-background/60 px-4 py-3.5 transition-all duration-150 hover:bg-accent/50 hover:border-border/80">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card/80 border border-border/30 text-foreground">
          <Globe size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{platform.name}</p>
          <p className="text-xs text-muted-foreground">
            {platform.lastSyncAt ? new Date(platform.lastSyncAt).toLocaleString() : platform.errorMessage ?? "Not yet synced"}
            {platform.successRate !== undefined && ` · ${Math.round(platform.successRate)}% success`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {tokenExpiringSoon && (
          <span className="inline-flex items-center gap-1 rounded-full border border-warning/20 bg-warning/10 px-3 py-0.5 text-xs font-medium text-warning" title={`Token expires ${expiresInDays <= 0 ? "today" : `in ${expiresInDays}d`}`}>
            <ShieldAlert size={12} />
            {expiresInDays <= 0 ? "Token expired" : `Token expires in ${expiresInDays}d`}
          </span>
        )}
        <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-medium ${status.className}`}>
          <StatusIcon size={12} className={platform.status === "connecting" || platform.status === "pending" ? "animate-spin" : ""} />
          {status.label}
        </span>
        {(platform.status === "disconnected" || platform.status === "error") && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={retrying}
            onClick={async () => {
              setRetrying(true);
              await onRetry(platform.id);
              setRetrying(false);
            }}
          >
            {retrying ? "Retrying…" : "Retry"}
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
  platforms: DashboardConnectedPlatform[];
  loading?: boolean;
  onRetry: (id: string) => Promise<void>;
  onRefreshAll: () => void;
}

export default function ConnectedPlatforms({ platforms, loading = false, onRetry, onRefreshAll }: ConnectedPlatformsProps) {
  const router = useRouter();

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

  if (platforms.length === 0) {
    return (
      <Card>
        <CardHeader title="Connected Platforms" description="Integration status" />
        <CardContent>
          <EmptyState
            icon={<Globe size={32} />}
            title="Connect your marketing platforms"
            description="Google Ads, Meta Ads, and Google Analytics take about 5 minutes each to connect — once linked, their status, sync health, and spend show up here automatically."
            action={{ label: "Connect a platform", onClick: () => router.push("/dashboard/settings") }}
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
          <Button variant="outline" size="sm" icon={<RefreshCw size={14} />} onClick={onRefreshAll}>
            Refresh All
          </Button>
        }
      />
      <CardContent>
        <div className="space-y-2">
          {platforms.map((platform) => (
            <PlatformRow key={platform.id} platform={platform} onRetry={onRetry} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
