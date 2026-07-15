"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Webhook as WebhookIcon } from "lucide-react";
import { ModuleHeader, ModuleEmptyState } from "@/components/enterprise/module";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { AutomationForm } from "@/components/settings/api/AutomationForm";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useAutomations } from "@/features/settings/api/useAutomations";
import type { AutomationCard } from "@/features/settings/api/normalize";

export default function WebhooksPage() {
  const { tenantContext, canUpdateApi, canManageApi } = useSettingsContext();
  const automations = useAutomations(tenantContext.organizationId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AutomationCard | null>(null);
  const [deleting, setDeleting] = useState<AutomationCard | null>(null);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Webhooks"
        description="Build a rule: when this happens in Calixo, send this to another app."
        quickActions={
          canManageApi && (
            <Button
              icon={<Plus size={16} />}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              New Webhook
            </Button>
          )
        }
      />

      {!automations.loading && automations.automations.length === 0 && (
        <ModuleEmptyState icon={<WebhookIcon size={28} />} title="No webhooks yet" description="Create a rule so Calixo notifies another app the moment something happens." />
      )}

      <div className="space-y-3">
        {automations.automations.map(automation => (
          <Card key={automation.id} className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-1 flex-wrap items-center gap-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">When</p>
                <p className="text-sm font-medium text-foreground">{automation.eventLabel}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Send To</p>
                <p className="text-sm font-medium text-foreground">{automation.destinationLabel}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${automation.enabled ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                {automation.enabled ? "Active" : "Paused"}
              </span>
            </div>
            {canUpdateApi && (
              <div className="flex flex-shrink-0 gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Pencil size={13} />}
                  onClick={() => {
                    setEditing(automation);
                    setFormOpen(true);
                  }}
                >
                  Edit
                </Button>
                {canManageApi && (
                  <Button size="sm" variant="outline" icon={<Trash2 size={13} />} onClick={() => setDeleting(automation)}>
                    Delete
                  </Button>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {formOpen && (
        <AutomationForm
          organizationId={tenantContext.organizationId}
          connections={automations.connections}
          initial={editing ?? undefined}
          onSubmit={async input => {
            if (editing) await automations.update(editing.id, input);
            else await automations.create(input);
          }}
          onClose={() => setFormOpen(false)}
        />
      )}

      {deleting && (
        <SimpleDialog title="Delete this webhook?" description={`"${deleting.name}" will stop sending notifications immediately.`} onClose={() => setDeleting(null)}>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await automations.remove(deleting.id);
                setDeleting(null);
              }}
            >
              Delete
            </Button>
          </div>
        </SimpleDialog>
      )}
    </div>
  );
}
