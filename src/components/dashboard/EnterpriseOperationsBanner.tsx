"use client";

import { Activity, AlertTriangle, Globe, CreditCard } from "lucide-react";
import type { DashboardHealthScore, DashboardActionCenterItem, DashboardConnectedPlatform, DashboardSubscriptionSummary } from "@/core/dashboard";

interface EnterpriseOperationsBannerProps {
  health: DashboardHealthScore | null;
  actionItems: DashboardActionCenterItem[];
  connectedPlatforms: DashboardConnectedPlatform[];
  subscription: DashboardSubscriptionSummary | null;
}

/**
 * Admin-only operations cockpit strip — deliberately reuses the same
 * `getHealthScore()`/`getActionCenterItems()` data already computed for
 * `HealthScoreCard`/`ActionCenter` rather than a third independent
 * platform/queue/connector/usage computation.
 */
export default function EnterpriseOperationsBanner({ health, actionItems, connectedPlatforms, subscription }: EnterpriseOperationsBannerProps) {
  if (!health) return null;

  const incidents = actionItems.filter(i => i.kind === "incident").length;
  const connectorIssues = connectedPlatforms.filter(p => p.status === "error" || p.status === "disconnected").length;
  const connectorsHealthy = connectedPlatforms.length - connectorIssues;
  const aiCreditPct = subscription && subscription.aiCredits.limit > 0 ? Math.round((subscription.aiCredits.used / subscription.aiCredits.limit) * 100) : null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-4 rounded-xl border border-border/60 bg-card/60 px-4 py-2.5 text-xs">
      <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold uppercase tracking-wide text-primary">Admin</span>
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <Activity size={13} className="text-primary" />
        Platform Health <span className="font-semibold text-foreground">{health.score}</span>
      </span>
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <Globe size={13} className={connectorIssues > 0 ? "text-destructive" : "text-success"} />
        Connectors <span className="font-semibold text-foreground">{connectorsHealthy}/{connectedPlatforms.length} healthy</span>
      </span>
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <AlertTriangle size={13} className={incidents > 0 ? "text-warning" : "text-success"} />
        Active Incidents <span className="font-semibold text-foreground">{incidents}</span>
      </span>
      {aiCreditPct !== null && (
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <CreditCard size={13} className={aiCreditPct >= 85 ? "text-destructive" : "text-success"} />
          AI Credit Usage <span className="font-semibold text-foreground">{aiCreditPct}%</span>
        </span>
      )}
    </div>
  );
}
