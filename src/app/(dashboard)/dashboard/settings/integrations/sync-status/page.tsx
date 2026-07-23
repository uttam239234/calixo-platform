"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { Button } from "@/components/ui/button";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useIntegrations } from "@/hooks/useIntegrations";
import { presentHealth, explainHealth } from "@/features/settings/integrations/constants";
import { formatRelativeTime } from "@/shared/utils/date";

export default function SyncStatusPage() {
  const { tenantContext, canUpdateIntegrations } = useSettingsContext();
  const organizationId = tenantContext.organizationId;
  const integrations = useIntegrations(organizationId);
  const [busyId, setBusyId] = useState<string | null>(null);

  return (
    <div>
      <ModuleHeader title="Sync Status" description="Whether each app's data is syncing, and one-click reconnect." />

      {integrations.loading ? (
        <p className="text-sm text-muted-foreground">Checking sync status…</p>
      ) : integrations.apps.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Connect an app to see its sync status.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.apps.map(app => {
            const status = app.health ? presentHealth(app.health.status) : { emoji: "🟡" as const, label: "Attention Needed" as const };
            const explanation = app.health ? explainHealth(app.health.status, app.instance.displayName) : `We're checking ${app.instance.displayName}'s status.`;
            const needsReconnect = status.label === "Reconnect Required";
            const isBusy = busyId === app.instance.id;

            return (
              <div key={app.instance.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">{app.icon}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{app.instance.displayName}</p>
                    <p className="text-sm">
                      {status.emoji} {status.label}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">{explanation}</p>

                <dl className="mt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Last Sync</dt>
                    <dd className="font-medium text-foreground">{app.lastSync?.finishedAt ? formatRelativeTime(app.lastSync.finishedAt) : "Not yet synced"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Sync Frequency</dt>
                    <dd className="font-medium text-foreground">Manual (use Refresh)</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Data Received</dt>
                    <dd className="font-medium text-foreground">{(app.lastSync?.recordsProcessed ?? 0).toLocaleString()} records</dd>
                  </div>
                </dl>

                {needsReconnect && canUpdateIntegrations && (
                  <Button
                    size="sm"
                    className="mt-4 w-full"
                    disabled={isBusy}
                    onClick={async () => {
                      setBusyId(app.instance.id);
                      await integrations.reconnect(app.instance.id, app.instance.displayName);
                    }}
                  >
                    <RotateCw size={14} /> {isBusy ? "Reconnecting…" : "Reconnect"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
