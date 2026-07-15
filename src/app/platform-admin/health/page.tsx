"use client";

/**
 * Calixo Platform - Platform Health
 *
 * `healthPlatformAPI`/`healthEngine` (Enterprise Observability Platform)
 * aggregate 6 real, independently-built health services into one snapshot
 * — found with zero UI consumers anywhere in the app before this page.
 *
 * Components reflect THIS browser session's in-memory registry state — the
 * queue/execution/AI/cache/search/storage registries this snapshot reads
 * are populated by each area's own `initializeXFoundation()` call, most of
 * which run from the customer dashboard, not this console. A component
 * showing "unknown" here often just means that subsystem hasn't been
 * exercised yet in this tab, not that it's actually broken — the same
 * honest "registry presence, not a live probe" caveat `HealthEngine`
 * itself already documents for Database/Storage.
 */
import { useEffect, useState } from "react";
import { Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { healthPlatformAPI, initializeObservabilityFoundation } from "@/core/platform/observability";
import type { UnifiedHealthSnapshot, HealthState } from "@/core/platform/observability";

const STATE_BADGE: Record<HealthState, string> = {
  healthy: "badge-success",
  degraded: "badge-warning",
  unhealthy: "badge-destructive",
  unknown: "badge-warning",
};

const STATE_LABEL: Record<HealthState, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  unhealthy: "Unhealthy",
  unknown: "Unknown",
};

export default function PlatformHealthPage() {
  const [snapshot, setSnapshot] = useState<UnifiedHealthSnapshot | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    await initializeObservabilityFoundation();
    setSnapshot(await healthPlatformAPI.getSnapshot());
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      await refresh();
    })();
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted-foreground">
          A live aggregate of every real health/analytics engine this platform already runs — the Queue &amp; Workers, API Gateway, Execution Platform, AIOS, Cache, and Database/Storage
          registries. Reflects this browser session&apos;s in-memory state, not a persisted history.
        </p>
        <Button size="sm" variant="outline" onClick={refresh} disabled={loading}>
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {!snapshot ? (
        <p className="text-sm text-muted-foreground">Checking platform health…</p>
      ) : (
        <>
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-border bg-card p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Overall Platform Status</p>
              <p className="mt-0.5 flex items-center gap-2 text-lg font-bold text-foreground">
                {STATE_LABEL[snapshot.overall]}
                <span className={`badge ${STATE_BADGE[snapshot.overall]}`}>{snapshot.overall}</span>
              </p>
            </div>
            <span className="ml-auto text-xs text-muted-foreground">Checked {new Date(snapshot.checkedAt).toLocaleTimeString()}</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {snapshot.components.map(component => (
              <div key={component.name} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold capitalize text-foreground">{component.name}</p>
                  <span className={`badge ${STATE_BADGE[component.state]}`}>{STATE_LABEL[component.state]}</span>
                </div>
                {component.detail && <p className="mt-1.5 text-xs text-muted-foreground">{component.detail}</p>}
                {component.metadata && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {Object.entries(component.metadata)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" · ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
