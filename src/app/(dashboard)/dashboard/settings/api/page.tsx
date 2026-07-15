"use client";

import { useState } from "react";
import { Plus, Play, Pause, Pencil, Trash2, Zap } from "lucide-react";
import { ModuleHeader, ModuleEmptyState } from "@/components/enterprise/module";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { AutomationForm } from "@/components/settings/api/AutomationForm";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useAutomations } from "@/features/settings/api/useAutomations";
import { useOrganizationUsage, useNow } from "@/features/settings/api/useApiKeys";
import type { AutomationCard } from "@/features/settings/api/normalize";

function relativeTime(iso?: string): string {
  if (!iso) return "Never run";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function UsageStrip({ organizationId }: { organizationId: string }) {
  const { usage } = useOrganizationUsage(organizationId);
  const now = useNow();
  if (!usage?.rule || now === null) return null;
  const used = usage.rule.limit - (usage.remaining ?? usage.rule.limit);
  const resetSeconds = Math.max(0, Math.round(((usage.resetAt ?? now) - now) / 1000));
  return (
    <div className="rounded-xl border border-border bg-accent/20 px-4 py-2.5 text-xs text-muted-foreground">
      You&apos;ve used <span className="font-semibold text-foreground">{used.toLocaleString()}</span> of{" "}
      <span className="font-semibold text-foreground">{usage.rule.limit.toLocaleString()}</span> API requests this minute · resets in {resetSeconds}s
    </div>
  );
}

export default function ConnectedAutomationsPage() {
  const { tenantContext, canUpdateApi, canManageApi } = useSettingsContext();
  const automations = useAutomations(tenantContext.organizationId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AutomationCard | null>(null);
  const [deleting, setDeleting] = useState<AutomationCard | null>(null);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Connected Automations"
        description="Connect Calixo to another app — when something happens here, we'll send it there."
        quickActions={
          canManageApi && (
            <Button
              icon={<Plus size={16} />}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              New Automation
            </Button>
          )
        }
      />

      <UsageStrip organizationId={tenantContext.organizationId} />

      {!automations.loading && automations.automations.length === 0 && (
        <ModuleEmptyState icon={<Zap size={28} />} title="No automations yet" description="Connect Calixo to Slack, your CRM, or any other app — when something happens here, we'll send it there." />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {automations.automations.map(automation => (
          <Card key={automation.id} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {automation.emoji} {automation.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">Sends to {automation.destinationLabel}</p>
              </div>
              <span
                className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  automation.enabled ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                }`}
              >
                {automation.enabled ? "Active" : "Paused"}
              </span>
            </div>

            <p className="text-xs text-muted-foreground">Last run: {relativeTime(automation.lastRunAt)}</p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <Button size="sm" variant="outline" icon={<Play size={13} />} onClick={() => automations.runNow(automation)} disabled={!canUpdateApi}>
                Run Now
              </Button>
              {canUpdateApi && (
                <>
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
                  <Button size="sm" variant="outline" icon={<Pause size={13} />} onClick={() => automations.setEnabled(automation.id, !automation.enabled)}>
                    {automation.enabled ? "Pause" : "Resume"}
                  </Button>
                </>
              )}
              {canManageApi && (
                <Button size="sm" variant="outline" icon={<Trash2 size={13} />} onClick={() => setDeleting(automation)}>
                  Delete
                </Button>
              )}
            </div>
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
        <SimpleDialog title="Delete this automation?" description={`"${deleting.name}" will stop sending notifications immediately.`} onClose={() => setDeleting(null)}>
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
