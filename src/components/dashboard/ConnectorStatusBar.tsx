"use client";

import type { DashboardConnectedPlatform } from "@/core/dashboard";

const DOT_CLASS: Record<DashboardConnectedPlatform["status"], string> = {
  connected: "bg-success",
  connecting: "bg-primary animate-pulse",
  pending: "bg-primary animate-pulse",
  error: "bg-destructive",
  disconnected: "bg-muted-foreground/40",
};

interface ConnectorStatusBarProps {
  platforms: DashboardConnectedPlatform[];
}

/** A glanceable connector-health strip for the dashboard header — same `dashboard.connectedPlatforms` data the Connected Platforms widget already loads, no new fetch. */
export default function ConnectorStatusBar({ platforms }: ConnectorStatusBarProps) {
  if (platforms.length === 0) return null;

  return (
    <div className="flex items-center gap-2.5 rounded-full border border-border/60 bg-card/60 px-3 py-1.5" title="Connector status">
      {platforms.map(platform => (
        <span key={platform.id} className="flex items-center gap-1.5" title={`${platform.name}: ${platform.status}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${DOT_CLASS[platform.status]}`} />
          <span className="hidden text-xs text-muted-foreground sm:inline">{platform.name}</span>
        </span>
      ))}
    </div>
  );
}
