"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, RefreshCw, RotateCw, Unplug, Info, Store, AlertTriangle } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { Button } from "@/components/ui/button";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useIntegrations, type ConnectedApp } from "@/hooks/useIntegrations";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { INSTANCE_STATUS_LABELS, FEATURE_LABELS } from "@/features/settings/integrations/constants";
import { formatRelativeTime } from "@/shared/utils/date";

export default function ConnectedAppsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenantContext, canUpdateIntegrations, canManageIntegrations } = useSettingsContext();
  const organizationId = tenantContext.organizationId;
  const integrations = useIntegrations(organizationId);
  const workspaces = useWorkspaces(organizationId);

  const [details, setDetails] = useState<ConnectedApp | null>(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState<ConnectedApp | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  // The real OAuth callback route (`/api/connectors/oauth/callback`) redirects here with
  // `connected=<provider>` or `connectError=<message>` — never a client-simulated result.
  useEffect(() => {
    const connected = searchParams.get("connected");
    const connectError = searchParams.get("connectError");
    if (!connected && !connectError) return;
    (async () => {
      if (connected) setBanner({ kind: "success", message: `Connected successfully.` });
      else if (connectError) setBanner({ kind: "error", message: connectError });
      router.replace("/dashboard/settings/integrations");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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

      {banner && (
        <div className={`mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${banner.kind === "success" ? "border-success/20 bg-success/10 text-success" : "border-destructive/20 bg-destructive/10 text-destructive"}`}>
          {banner.kind === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {banner.message}
        </div>
      )}

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
            const status = INSTANCE_STATUS_LABELS[app.instance.status];
            const isBusy = busyId === app.instance.id;
            const canConnect = app.instance.status !== "active";
            return (
              <div key={app.instance.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">{app.icon}</div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{app.instance.displayName}</p>
                      <span className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${status.className}`}>{status.label}</span>
                    </div>
                  </div>
                </div>

                <dl className="mt-4 space-y-1.5 text-sm">
                  {app.instance.connectedAccountLabel && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Account</dt>
                      <dd className="truncate font-medium text-foreground">{app.instance.connectedAccountLabel}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Last Sync</dt>
                    <dd className="font-medium text-foreground">{app.lastSync?.finishedAt ? formatRelativeTime(app.lastSync.finishedAt) : "Not yet synced"}</dd>
                  </div>
                  {app.workspaceIds.length > 0 && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Visible To</dt>
                      <dd className="truncate font-medium text-foreground">{app.workspaceIds.map(workspaceName).join(", ")}</dd>
                    </div>
                  )}
                </dl>

                <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-4">
                  <Button size="xs" variant="outline" onClick={() => setDetails(app)}>
                    <Info size={12} /> View Details
                  </Button>
                  {canManageIntegrations && canConnect && (
                    <Button
                      size="xs"
                      disabled={isBusy}
                      onClick={async () => {
                        setBusyId(app.instance.id);
                        await integrations.connect(app.instance.connectorId, app.instance.displayName);
                      }}
                    >
                      Connect
                    </Button>
                  )}
                  {canUpdateIntegrations && !canConnect && (
                    <Button
                      size="xs"
                      variant="outline"
                      disabled={isBusy}
                      onClick={async () => {
                        setBusyId(app.instance.id);
                        await integrations.refreshSync(app.instance.id, app.instance.displayName);
                        setBusyId(null);
                      }}
                    >
                      <RefreshCw size={12} /> Refresh
                    </Button>
                  )}
                  {canUpdateIntegrations && !canConnect && (
                    <Button
                      size="xs"
                      variant="outline"
                      disabled={isBusy}
                      onClick={async () => {
                        setBusyId(app.instance.id);
                        await integrations.reconnect(app.instance.id, app.instance.displayName);
                      }}
                    >
                      <RotateCw size={12} /> Reconnect
                    </Button>
                  )}
                  {canManageIntegrations && !canConnect && (
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
        <SimpleDialog title={`${details.instance.displayName} Details`} onClose={() => setDetails(null)}>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-medium text-foreground">{INSTANCE_STATUS_LABELS[details.instance.status].label}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Sync</p>
                <p className="font-medium text-foreground">{details.lastSync?.finishedAt ? formatRelativeTime(details.lastSync.finishedAt) : "Not yet synced"}</p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs text-muted-foreground">What {details.instance.displayName} can do</p>
              <ul className="space-y-1">
                {details.definition.supportedFeatures.map(feature => (
                  <li key={feature} className="text-foreground">
                    ✓ {FEATURE_LABELS[feature]}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SimpleDialog>
      )}

      {confirmDisconnect && (
        <SimpleDialog title={`Disconnect ${confirmDisconnect.instance.displayName}?`} description="Calixo will stop syncing data from this app. You can reconnect it anytime." onClose={() => setConfirmDisconnect(null)}>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDisconnect(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await integrations.disconnect(confirmDisconnect.instance.id, confirmDisconnect.instance.displayName);
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
