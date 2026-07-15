"use client";

/**
 * Calixo Platform - API & Webhooks - the shared WHEN/DO automation form
 *
 * Used by both Connected Automations ("+ New Automation" / Edit) and
 * Webhooks (the WHEN/DO builder) — one real form, two entry points.
 *
 * The destination URL is always a real, required field regardless of which
 * "Send To" option is picked — selecting a connected app only supplies a
 * friendly label (real data from the Integration Platform), it does not
 * fabricate a working delivery path. A genuine outbound webhook still needs
 * a real receiving URL (e.g. a Slack Incoming Webhook or Zapier catch
 * hook), the same way it would on any other platform.
 */
import { useMemo, useState } from "react";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { workspacePlatformAPI } from "@/core/platform/workspaces";
import type { ConnectorSummary } from "@/core/platform/contracts";
import type { WebhookEvent } from "@/integrations/types";
import { AUTOMATION_EVENTS, eventLabel, type AutomationCard } from "@/features/settings/api/normalize";
import type { AutomationInput } from "@/features/settings/api/useAutomations";

const CUSTOM_DESTINATION = "__custom__";

interface AutomationFormProps {
  organizationId: string;
  connections: ConnectorSummary[];
  initial?: AutomationCard;
  onSubmit: (input: AutomationInput) => Promise<void>;
  onClose: () => void;
}

export function AutomationForm({ organizationId, connections, initial, onSubmit, onClose }: AutomationFormProps) {
  const workspaces = useMemo(() => workspacePlatformAPI.list({ organizationId }), [organizationId]);

  const initialConnection = connections.find(c => c.name === initial?.destinationLabel);
  const [name, setName] = useState(initial?.name ?? "");
  const [event, setEvent] = useState<WebhookEvent>(initial?.event ?? AUTOMATION_EVENTS[0]);
  const [destinationChoice, setDestinationChoice] = useState(initialConnection ? initialConnection.id : CUSTOM_DESTINATION);
  const [customLabel, setCustomLabel] = useState(initialConnection ? "" : (initial?.destinationLabel ?? ""));
  const [url, setUrl] = useState(initial?.url ?? "");
  const [workspaceId, setWorkspaceId] = useState(initial?.workspaceId ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const destinationLabel = destinationChoice === CUSTOM_DESTINATION ? customLabel.trim() : (connections.find(c => c.id === destinationChoice)?.name ?? customLabel.trim());

  async function handleSubmit() {
    if (!url.trim()) {
      setError("A destination URL is required.");
      return;
    }
    if (!destinationLabel) {
      setError("Give this destination a name.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit({
        name: name.trim() || `${eventLabel(event)} → ${destinationLabel}`,
        event,
        url: url.trim(),
        destinationLabel,
        workspaceId: workspaceId || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong saving this automation.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SimpleDialog title={initial ? "Edit Automation" : "New Automation"} description="When this happens, send this." onClose={onClose}>
      <div className="space-y-4">
        <Input label="Name (optional)" placeholder="e.g. Notify Slack when a lead comes in" value={name} onChange={e => setName(e.target.value)} />

        <div>
          <label className="label">WHEN</label>
          <select className="input" value={event} onChange={e => setEvent(e.target.value as WebhookEvent)}>
            {AUTOMATION_EVENTS.map(evt => (
              <option key={evt} value={evt}>
                {eventLabel(evt)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">DO — Send To</label>
          <select
            className="input"
            value={destinationChoice}
            onChange={e => {
              setDestinationChoice(e.target.value);
              setError("");
            }}
          >
            {connections.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value={CUSTOM_DESTINATION}>Custom / other app</option>
          </select>
          {destinationChoice === CUSTOM_DESTINATION && (
            <Input className="mt-2" placeholder="Destination name (e.g. My CRM)" value={customLabel} onChange={e => setCustomLabel(e.target.value)} />
          )}
        </div>

        <Input
          label="Destination URL"
          placeholder="https://hooks.slack.com/services/..."
          value={url}
          onChange={e => {
            setUrl(e.target.value);
            setError("");
          }}
          helperText="Where Calixo sends the notification — e.g. a Slack Incoming Webhook or Zapier catch hook URL."
        />

        {workspaces.length > 0 && (
          <div>
            <label className="label">Workspace (optional)</label>
            <select className="input" value={workspaceId} onChange={e => setWorkspaceId(e.target.value)}>
              <option value="">Whole organization</option>
              {workspaces.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <p className="text-xs font-medium text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            {initial ? "Save Changes" : "Create"}
          </Button>
        </div>
      </div>
    </SimpleDialog>
  );
}
