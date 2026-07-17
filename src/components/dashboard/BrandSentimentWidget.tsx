"use client";

/**
 * Calixo Platform - Brand Sentiment Widget
 *
 * Real data via `getBrandSentimentWidgetDataAction()` — `reputationPlatformAPI.getOverview()`
 * over the real generated mention set, the same computation Brand
 * Monitoring's own health score uses. The action itself re-checks
 * `entitlementService.canAccessModule(actor, "brand")` server-side and
 * returns `null` if denied — this widget only ever renders at all when
 * the layout controller's `filterWidget` already agreed it should (Trial
 * orgs, which don't include the "brand" module, never even reach this
 * component), so the `null` branch below is defense-in-depth, not the
 * primary gate.
 */

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { getBrandSentimentWidgetDataAction, type BrandSentimentWidgetData } from "@/features/dashboard/layoutActions";
import { logDashboardError } from "@/core/dashboard";

export default function BrandSentimentWidget() {
  const [data, setData] = useState<BrandSentimentWidgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getBrandSentimentWidgetDataAction();
        if (!cancelled) setData(result);
      } catch (err) {
        logDashboardError("Failed to load brand sentiment widget data", err);
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
    return <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">Couldn&apos;t load Brand Sentiment. Please try again later.</div>;
  }

  if (!data) {
    return <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">Brand Sentiment unavailable — upgrade to unlock Brand Monitoring</div>;
  }

  return (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Heart size={13} className="text-primary" />
        Brand Sentiment
      </div>
      <div>
        <p className="text-2xl font-semibold tabular-nums text-foreground">{data.avgSentimentScore.toFixed(0)}/100</p>
        <p className="text-xs text-muted-foreground">{data.positivePct}% positive across {data.totalMentions.toLocaleString()} mentions</p>
      </div>
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-success" style={{ width: `${data.positivePct}%` }} />
        <div className="h-full bg-muted-foreground/40" style={{ width: `${data.neutralPct}%` }} />
        <div className="h-full bg-destructive" style={{ width: `${data.negativePct}%` }} />
      </div>
    </div>
  );
}
