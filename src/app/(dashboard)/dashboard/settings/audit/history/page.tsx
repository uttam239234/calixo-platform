"use client";

import { ArrowRight } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useAudit } from "@/features/settings/audit/useAudit";
import { formatDate } from "@/shared/utils/date";

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return Object.entries(value as Record<string, unknown>).map(([k, v]) => `${k}: ${formatValue(v)}`).join(", ");
  return String(value);
}

export default function AuditHistoryPage() {
  const { tenantContext } = useSettingsContext();
  const audit = useAudit(tenantContext.organizationId);

  return (
    <div className="space-y-6">
      <ModuleHeader title="Change History" description="Real before-and-after values for changes with a recorded diff." />

      {audit.loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : audit.changeHistory.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recorded changes with a before-and-after value yet.</p>
      ) : (
        <div className="space-y-3">
          {audit.changeHistory.map(item => (
            <div key={item.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-foreground">{item.description}</p>
                <p className="text-xs text-muted-foreground">
                  Changed by {item.actorLabel} · {formatDate(item.timestamp)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Before</p>
                  <p className="mt-1 font-mono text-sm text-foreground">{formatValue(item.changes?.before)}</p>
                </div>
                <ArrowRight size={16} className="flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 rounded-xl bg-primary/5 p-3">
                  <p className="text-xs text-muted-foreground">After</p>
                  <p className="mt-1 font-mono text-sm text-foreground">{formatValue(item.changes?.after)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
