"use client";

import { Check, X } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useIntegrations } from "@/hooks/useIntegrations";
import { ALL_CAPABILITIES, CAPABILITY_LABELS } from "@/features/settings/integrations/constants";

export default function IntegrationPermissionsPage() {
  const { tenantContext } = useSettingsContext();
  const organizationId = tenantContext.organizationId;
  const integrations = useIntegrations(organizationId);

  return (
    <div>
      <ModuleHeader title="Permissions" description="What each connected app can do, in plain language." />

      {integrations.loading ? (
        <p className="text-sm text-muted-foreground">Loading permissions…</p>
      ) : integrations.apps.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Connect an app to see what it can do.</p>
      ) : (
        <div className="space-y-4">
          {integrations.apps.map(app => (
            <div key={app.connection.id} className="rounded-2xl border border-border bg-card p-5">
              <p className="mb-4 flex items-center gap-2 text-base">
                <span className="text-xl">{app.icon}</span>
                <span className="font-semibold text-foreground">{app.connection.name}</span>
                <span className="text-muted-foreground">can:</span>
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {ALL_CAPABILITIES.map(capability => {
                  const allowed = app.connection.capabilities.includes(capability);
                  return (
                    <li key={capability} className="flex items-center gap-2.5 text-sm">
                      {allowed ? <Check size={16} className="flex-shrink-0 text-success" /> : <X size={16} className="flex-shrink-0 text-muted-foreground" />}
                      <span className={allowed ? "text-foreground" : "text-muted-foreground"}>{CAPABILITY_LABELS[capability]}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
