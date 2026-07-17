"use client";

/**
 * Calixo Platform - AI Credits Widget
 *
 * Real data via `getAiCreditsWidgetDataAction()` — the same
 * `getWalletBreakdown()` ledger computation Billing & Plans uses, not a
 * separate fabricated number. `alwaysAvailable` in the catalog (every
 * plan includes AI credits), so this widget carries no entitlement gate.
 */

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { getAiCreditsWidgetDataAction, type AiCreditsWidgetData } from "@/features/dashboard/layoutActions";
import { logDashboardError } from "@/core/dashboard";

export default function AiCreditsWidget() {
  const [data, setData] = useState<AiCreditsWidgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getAiCreditsWidgetDataAction();
        if (!cancelled) setData(result);
      } catch (err) {
        logDashboardError("Failed to load AI credits widget data", err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-full flex-col justify-center gap-2 p-4">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="h-7 w-32 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (error) {
    return <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">Couldn&apos;t load AI Credits. Please try again later.</div>;
  }

  if (!data) {
    return <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">AI Credits unavailable</div>;
  }

  return (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Sparkles size={13} className="text-primary" />
        AI Credits
      </div>
      <div>
        <p className="text-2xl font-semibold tabular-nums text-foreground">{data.totalAvailable.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">{data.purchasedRemaining.toLocaleString()} purchased · {data.includedRemaining.toLocaleString()} included left</p>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, data.percentIncludedUsed)}%` }} />
      </div>
    </div>
  );
}
