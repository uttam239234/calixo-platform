/**
 * Calixo Platform - Universal Connector Framework: Platform Admin Diagnostics
 *
 * Read-only. A real async Server Component (no "use client", matching
 * `platform-admin/layout.tsx`'s own convention) — every number here is
 * read directly from the framework's real registries/stores, not a client
 * fetch round trip. Gated the same way every other `/platform-admin/*`
 * page already is, by the shared layout — no separate RBAC check needed
 * here.
 *
 * This is diagnostics for the FRAMEWORK, not for Settings -> Integrations
 * (that page's own diagnostics, unrelated, already exists at
 * `/platform-admin/diagnostics`).
 */
import { Plug, ShieldCheck, Gauge, Webhook, Clock, Cpu } from "lucide-react";
import { initializeConnectorFramework } from "@/core/connectors";
import { getConnectorDiagnosticsSnapshot } from "@/features/platform-admin/connectorDiagnostics.server";

const OAUTH_STATUS_BADGE: Record<string, string> = { configured: "badge-success", missing: "badge-warning", validation_failed: "badge-destructive", disabled: "badge-secondary" };
const HEALTH_BADGE: Record<string, string> = { healthy: "badge-success", warning: "badge-warning", expired_token: "badge-destructive", rate_limited: "badge-warning", permission_missing: "badge-destructive", sync_failed: "badge-destructive", disconnected: "badge-secondary", configuration_error: "badge-destructive", unknown: "badge-secondary" };

export default async function ConnectorFrameworkDiagnosticsPage() {
  await initializeConnectorFramework();
  const snapshot = await getConnectorDiagnosticsSnapshot();

  return (
    <div>
      <p className="mb-5 max-w-3xl text-sm text-muted-foreground">
        The Universal Connector Framework — reusable backend infrastructure for every real integration (Settings, AI Copilot, Analytics, Reports, Brand Monitoring, Content Studio). Not a
        user-facing feature; nothing here is editable.
      </p>

      {/* Registry */}
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Plug size={15} /> Connector Registry
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {snapshot.connectors.map(c => (
          <div key={c.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-foreground">{c.displayName}</p>
              <span className={`badge ${OAUTH_STATUS_BADGE[c.oauthStatus] ?? "badge-secondary"}`}>OAuth: {c.oauthStatus.replace(/_/g, " ")}</span>
            </div>
            <p className="mt-1 text-xs capitalize text-muted-foreground">
              {c.category} · v{c.version} · {c.status}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {c.capabilities.map(cap => (
                <span key={cap} className="rounded-full bg-surface/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                  {cap}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ShieldCheck} label="Organizations with data" value={snapshot.totals.organizationsWithData} />
        <StatCard icon={ShieldCheck} label="Active credentials" value={snapshot.totals.activeCredentials} />
        <StatCard icon={ShieldCheck} label="Expired credentials" value={snapshot.totals.expiredCredentials} />
        <StatCard icon={Clock} label="Pending OAuth authorizations" value={snapshot.pendingOAuthAuthorizations} />
      </div>

      {/* Health */}
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Gauge size={15} /> Connector Health
      </div>
      <div className="mb-6 overflow-x-auto rounded-2xl border border-border bg-card">
        {snapshot.health.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No connector instances have reported health yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Organization</th>
                <th className="p-3">Connector</th>
                <th className="p-3">Status</th>
                <th className="p-3">Message</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.health.map(h => (
                <tr key={`${h.organizationId}-${h.connectorInstanceId}`} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{h.organizationId}</td>
                  <td className="p-3">{h.provider}</td>
                  <td className="p-3">
                    <span className={`badge ${HEALTH_BADGE[h.status] ?? "badge-secondary"}`}>{h.status.replace(/_/g, " ")}</span>
                  </td>
                  <td className="p-3 text-muted-foreground">{h.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rate limits */}
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Gauge size={15} /> Rate Limits
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            {snapshot.rateLimits.length === 0 ? (
              <p className="text-sm text-muted-foreground">No rate-limit signals recorded yet — populated from real provider response headers as connectors make live calls.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {snapshot.rateLimits.map(r => (
                  <li key={r.connectorInstanceId} className="flex justify-between gap-2">
                    <span>{r.provider}</span>
                    <span className="text-muted-foreground">
                      {r.remainingRequests ?? "?"}/{r.burstLimit ?? "?"} remaining · queue {r.throttleQueueLength}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Webhooks */}
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Webhook size={15} /> Webhook Status
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            {snapshot.webhooks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No webhook registrations yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {snapshot.webhooks.map((w, i) => (
                  <li key={i} className="flex justify-between gap-2">
                    <span>{w.provider}</span>
                    <span className="text-muted-foreground">
                      {w.status} · {w.deadLetterCount} dead-lettered
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Scheduler / Jobs */}
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Clock size={15} /> Sync Queue &amp; Jobs
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            {snapshot.scheduler.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recurring schedules registered yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {snapshot.scheduler.map(s => (
                  <li key={s.name} className="flex justify-between gap-2">
                    <span>{s.name}</span>
                    <span className="text-muted-foreground">
                      {s.frequency} · next {s.nextRunAt ? new Date(s.nextRunAt).toLocaleString() : "—"} · {s.isActive ? "active" : "paused"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-[11px] leading-snug text-muted-foreground/80">
              Schedules are real and created on a live scheduler (`SchedulerEngine`). Dispatch-to-worker via `QueueEngine` is a pre-existing platform characteristic not started at boot in this
              environment — schedules genuinely go due, but nothing currently drains the queue automatically.
            </p>
          </div>
        </div>

        {/* Worker + latency */}
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Cpu size={15} /> Worker &amp; Provider Latency
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            {snapshot.workers.filter(w => w.name === "connectors").map(w => (
              <p key={w.name} className="text-sm text-muted-foreground">
                Worker &quot;{w.name}&quot;: {w.completedJobs} completed, {w.failedJobs} failed, {w.runningJobs} running.
              </p>
            ))}
            {snapshot.recentLatency.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No provider calls logged yet.</p>
            ) : (
              <ul className="mt-2 space-y-1.5 text-sm">
                {snapshot.recentLatency.map((l, i) => (
                  <li key={i} className="flex justify-between gap-2">
                    <span>
                      {l.provider}.{l.action}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {l.latencyMs}ms · {l.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Plug; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-lg font-bold tabular-nums text-foreground">{value}</p>
      </div>
    </div>
  );
}
