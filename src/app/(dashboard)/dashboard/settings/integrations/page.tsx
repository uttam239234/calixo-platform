"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, RefreshCw, RotateCw, Unplug, Info, Store } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { Button } from "@/components/ui/button";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useIntegrations, type ConnectedApp } from "@/hooks/useIntegrations";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { CONNECTION_STATUS_LABELS, CAPABILITY_LABELS } from "@/features/settings/integrations/constants";
import { formatRelativeTime } from "@/shared/utils/date";

export default function ConnectedAppsPage() {
  const router = useRouter();
  const { tenantContext, canUpdateIntegrations, canManageIntegrations } = useSettingsContext();
  const organizationId = tenantContext.organizationId;
  const integrations = useIntegrations(organizationId);
  const workspaces = useWorkspaces(organizationId);

  const [details, setDetails] = useState<ConnectedApp | null>(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState<ConnectedApp | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const workspaceName = (id: string) => workspaces.cards.find(c => c.workspace.id === id)?.workspace.name ?? id;

  return (
    <div>
      <ModuleHeader
        title="Connected Apps"
        description="The apps your organization has connected, and their status."
        quickActions={
          <Button variant="outline" onClick={() => router.push("/dashboard/settings/integrations/marketplace")}>
            <Store size={16} />
            Browse Marketplace
          </Button>
        }
      />

      {integrations.loading ? (
        <p className="text-sm text-muted-foreground">Loading your connected apps…</p>
      ) : integrations.apps.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No apps connected yet.{" "}
          <button className="text-primary hover:underline" onClick={() => router.push("/dashboard/settings/integrations/marketplace")}>
            Browse the App Marketplace
          </button>{" "}
          to connect your first one.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.apps.map(app => {
            const status = CONNECTION_STATUS_LABELS[app.connection.status];
            const isBusy = busyId === app.connection.id;
            return (
              <div key={app.connection.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">{app.icon}</div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{app.connection.name}</p>
                      <span className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${status.className}`}>{status.label}</span>
                    </div>
                  </div>
                </div>

                <dl className="mt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Account</dt>
                    <dd className="font-medium text-foreground">1 account connected</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Last Sync</dt>
                    <dd className="font-medium text-foreground">{app.connection.lastSyncAt ? formatRelativeTime(app.connection.lastSyncAt) : "Not yet synced"}</dd>
                  </div>
                  {app.workspaceIds.length > 0 && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Visible To</dt>
                      <dd className="truncate font-medium text-foreground">{app.workspaceIds.map(workspaceName).join(", ")}</dd>
                    </div>
                  )}
                </dl>

                <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-4">
                  {app.website && (
                    <Button size="xs" variant="outline" onClick={() => window.open(app.website, "_blank", "noopener,noreferrer")}>
                      <ExternalLink size={12} /> Open
                    </Button>
                  )}
                  <Button size="xs" variant="outline" onClick={() => setDetails(app)}>
                    <Info size={12} /> View Details
                  </Button>
                  {canUpdateIntegrations && (
                    <Button
                      size="xs"
                      variant="outline"
                      disabled={isBusy}
                      onClick={async () => {
                        setBusyId(app.connection.id);
                        await integrations.refreshSync(app.connection, app.connection.name);
                        setBusyId(null);
                      }}
                    >
                      <RefreshCw size={12} /> Refresh
                    </Button>
                  )}
                  {canUpdateIntegrations && (
                    <Button
                      size="xs"
                      variant="outline"
                      disabled={isBusy}
                      onClick={async () => {
                        setBusyId(app.connection.id);
                        await integrations.changeAccount(app.connection.id, app.connection.providerId, app.connection.name);
                        setBusyId(null);
                      }}
                    >
                      <RotateCw size={12} /> Change Account
                    </Button>
                  )}
                  {canManageIntegrations && (
                    <Button size="xs" variant="outline" onClick={() => setConfirmDisconnect(app)}>
                      <Unplug size={12} /> Disconnect
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {details && (
        <SimpleDialog title={`${details.connection.name} Details`} onClose={() => setDetails(null)}>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-medium text-foreground">{CONNECTION_STATUS_LABELS[details.connection.status].label}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Sync</p>
                <p className="font-medium text-foreground">{details.connection.lastSyncAt ? formatRelativeTime(details.connection.lastSyncAt) : "Not yet synced"}</p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs text-muted-foreground">What {details.connection.name} can do</p>
              <ul className="space-y-1">
                {details.connection.capabilities.map(capability => (
                  <li key={capability} className="text-foreground">
                    ✓ {CAPABILITY_LABELS[capability]}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SimpleDialog>
      )}

      {confirmDisconnect && (
        <SimpleDialog title={`Disconnect ${confirmDisconnect.connection.name}?`} description="Calixo will stop syncing data from this app. You can reconnect it anytime." onClose={() => setConfirmDisconnect(null)}>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDisconnect(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await integrations.disconnect(confirmDisconnect.connection.id, confirmDisconnect.connection.name);
                setConfirmDisconnect(null);
              }}
            >
              Disconnect
            </Button>
          </div>
        </SimpleDialog>
      )}
    </div>
  );
}
