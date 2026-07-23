"use client";

/**
 * Calixo Platform - AI Health
 *
 * Real, persisted metrics (`.data/aios/ai_request_log.json`, written by
 * every module's Server Action after each real OpenAI/Anthropic/Gemini
 * call) — not a live in-memory snapshot like `/platform-admin/health`.
 * Survives a server restart; reflects every organization's real AI usage
 * across Copilot, Content Studio, Reports, Analytics, and Brand Monitoring.
 */
import { useEffect, useState } from "react";
import { Activity, RefreshCw, AlertTriangle, Zap, Clock, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAIHealthAction, type AIHealthPageData } from "@/features/platform-admin/aiHealthActions";

export default function AIHealthPage() {
  const [data, setData] = useState<AIHealthPageData | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setData(await getAIHealthAction());
    } finally {
      setLoading(false);
    }
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
          Real usage across every AI-connected module — Copilot, Content Studio, Reports, Analytics, and Brand Monitoring — logged to disk after each real provider call. Last 7 days.
        </p>
        <Button size="sm" variant="outline" onClick={refresh} disabled={loading}>
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {!data ? (
        <p className="text-sm text-muted-foreground">Loading AI health…</p>
      ) : (
        <>
          <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><Gauge size={13} /> Success Rate</div>
              <p className="mt-2 text-2xl font-bold text-foreground">{data.summary.totalRequests > 0 ? `${data.summary.successRate.toFixed(1)}%` : "—"}</p>
              <p className="mt-1 text-xs text-muted-foreground">{data.summary.totalRequests} requests</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><Clock size={13} /> Avg Latency</div>
              <p className="mt-2 text-2xl font-bold text-foreground">{data.summary.averageLatencyMs.toLocaleString()}ms</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><Zap size={13} /> Credits Consumed</div>
              <p className="mt-2 text-2xl font-bold text-foreground">{data.summary.totalCreditsUsed.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><AlertTriangle size={13} /> Fallback Activations</div>
              <p className="mt-2 text-2xl font-bold text-foreground">{data.summary.fallbackActivations}</p>
              <p className="mt-1 text-xs text-muted-foreground">requests that didn&apos;t use OpenAI (priority 1)</p>
            </div>
          </div>

          <div className="mb-5 rounded-2xl border border-border bg-card p-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground"><Activity size={15} /> Provider Router Status</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {data.providerStatus.map(p => (
                <div key={p.provider} className="flex items-center justify-between rounded-xl border border-border/70 bg-background/60 p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">Priority {p.priority}</p>
                  </div>
                  <span className={`badge ${p.available ? "badge-success" : "badge-secondary"}`}>{p.available ? "Available" : "Not configured"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-5 rounded-2xl border border-border bg-card p-5">
            <p className="mb-3 text-sm font-semibold text-foreground">By Provider (last 7 days)</p>
            {Object.keys(data.summary.byProvider).length === 0 ? (
              <p className="text-sm text-muted-foreground">No AI requests recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(data.summary.byProvider).map(([provider, stats]) => (
                  <div key={provider} className="flex items-center justify-between rounded-xl border border-border/70 bg-background/60 p-3 text-sm">
                    <span className="font-medium capitalize text-foreground">{provider}</span>
                    <span className="text-muted-foreground">{stats.count} requests · {stats.successCount}/{stats.count} succeeded · {stats.averageLatencyMs}ms avg · {stats.credits} credits</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="mb-3 text-sm font-semibold text-foreground">Recent Failures</p>
            {data.summary.recentFailures.length === 0 ? (
              <p className="text-sm text-muted-foreground">No failures recorded.</p>
            ) : (
              <div className="space-y-2">
                {data.summary.recentFailures.map(f => (
                  <div key={f.id} className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>{f.module} · {f.provider}/{f.model}</span>
                      <span>{new Date(f.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="mt-1 text-destructive">{f.error ?? "Unknown error"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
