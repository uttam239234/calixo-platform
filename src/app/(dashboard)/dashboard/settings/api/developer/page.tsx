"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, Code2, FileJson, RotateCw, ScrollText, PlayCircle, ShieldAlert } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useAutomations } from "@/features/settings/api/useAutomations";
import { useDeveloperConsole, type TryItPath } from "@/features/settings/api/useDeveloperConsole";
import type { WebhookDelivery } from "@/integrations/types";

function Panel({ icon, title, description, children }: { icon: ReactNode; title: string; description: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Card padding="none">
      <button type="button" onClick={() => setOpen(v => !v)} className="flex w-full items-center gap-3 px-5 py-4 text-left">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-accent/50 text-muted-foreground">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <ChevronDown size={16} className={`flex-shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-border/60 px-5 py-4">{children}</div>}
    </Card>
  );
}

function DeliveryRow({ delivery, busy, onRedeliver }: { delivery: WebhookDelivery; busy: boolean; onRedeliver: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-accent/30 px-3 py-2 text-xs">
      <div className="min-w-0">
        <p className="text-foreground">
          {delivery.event} · {delivery.status} {delivery.responseStatusCode ? `(${delivery.responseStatusCode})` : ""}
        </p>
        <p className="text-muted-foreground">{new Date(delivery.createdAt).toLocaleString()} · attempt {delivery.attemptCount}</p>
      </div>
      <Button size="sm" variant="outline" icon={<RotateCw size={12} />} loading={busy} onClick={onRedeliver}>
        Retry
      </Button>
    </div>
  );
}

export default function DeveloperModePage() {
  const { tenantContext } = useSettingsContext();
  const automations = useAutomations(tenantContext.organizationId);
  const dev = useDeveloperConsole(tenantContext.organizationId);
  const [expanded, setExpanded] = useState(false);
  const [selectedWebhookId, setSelectedWebhookId] = useState<string>("");
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [payloadPreview, setPayloadPreview] = useState<{ payload: unknown; signature: string } | null>(null);

  const selectedWebhook = automations.webhooks.find(w => w.id === selectedWebhookId);

  async function loadDeliveries(webhookId: string) {
    setSelectedWebhookId(webhookId);
    setDeliveries(webhookId ? await dev.retryHistory(webhookId) : []);
  }

  return (
    <div className="space-y-6">
      <ModuleHeader title="Developer Mode" description="Advanced tools for technical users — hidden by default." />

      {!expanded ? (
        <Card className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/50 text-muted-foreground">
              <Code2 size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">This section is for developers</p>
              <p className="text-xs text-muted-foreground">Documentation, payload previews, retry history, and request logs.</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setExpanded(true)}>
            Show Developer Mode
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          <Panel icon={<FileJson size={16} />} title="API Documentation" description="Every real endpoint the Gateway routes.">
            <div className="space-y-1.5">
              {dev.contracts.map(contract => (
                <div key={contract.id} className="rounded-lg bg-accent/30 px-3 py-2 text-xs">
                  <span className="font-mono font-semibold text-foreground">{contract.method}</span> <span className="font-mono text-foreground">/{contract.version}{contract.path}</span>
                  <p className="mt-0.5 text-muted-foreground">{contract.description}</p>
                </div>
              ))}
            </div>
            <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-accent/30 p-3 text-[11px] text-foreground">{JSON.stringify(dev.openApiSpec(), null, 2)}</pre>
          </Panel>

          <Panel icon={<ShieldAlert size={16} />} title="Webhook Payload Preview" description="A real, signed sample payload for one of your webhooks.">
            <select className="input" value={selectedWebhookId} onChange={e => loadDeliveries(e.target.value)}>
              <option value="">Choose a webhook…</option>
              {automations.webhooks.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name ?? w.url}
                </option>
              ))}
            </select>
            {selectedWebhook && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={async () => {
                  const sample = { event: selectedWebhook.events[0], triggeredAt: new Date().toISOString() };
                  setPayloadPreview(await dev.previewPayload(selectedWebhook, sample));
                }}
              >
                Generate Preview
              </Button>
            )}
            {payloadPreview && <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-accent/30 p-3 text-[11px] text-foreground">{JSON.stringify(payloadPreview, null, 2)}</pre>}
          </Panel>

          <Panel icon={<RotateCw size={16} />} title="Retry History" description="Every delivery attempt for a webhook, with a real retry button.">
            <select className="input" value={selectedWebhookId} onChange={e => loadDeliveries(e.target.value)}>
              <option value="">Choose a webhook…</option>
              {automations.webhooks.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name ?? w.url}
                </option>
              ))}
            </select>
            <div className="mt-2 space-y-1.5">
              {deliveries.length === 0 ? (
                <p className="text-xs text-muted-foreground">No deliveries yet for this webhook.</p>
              ) : (
                deliveries.map(delivery => (
                  <DeliveryRow
                    key={delivery.id}
                    delivery={delivery}
                    busy={dev.redeliverBusyId === delivery.id}
                    onRedeliver={async () => {
                      await dev.redeliver(delivery.id);
                      await loadDeliveries(selectedWebhookId);
                    }}
                  />
                ))
              )}
            </div>
            {dev.redeliverError && <p className="mt-2 text-xs text-destructive">{dev.redeliverError}</p>}
          </Panel>

          <Panel icon={<ScrollText size={16} />} title="Request Logs" description="Real requests the API Gateway has processed for your organization.">
            {dev.requestLogs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No requests recorded yet — try a request below to see one appear here.</p>
            ) : (
              <div className="space-y-1.5">
                {dev.requestLogs.map((record, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-accent/30 px-3 py-2 text-xs">
                    <span className="font-mono text-foreground">{record.contractId}</span>
                    <span className="text-muted-foreground">
                      {record.statusCode} · {record.latencyMs}ms · {new Date(record.recordedAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel icon={<PlayCircle size={16} />} title="Example Responses" description="Try a real, live request against the API Gateway.">
            <div className="flex gap-1.5">
              {(["/health", "/openapi.json"] as TryItPath[]).map(path => (
                <Button key={path} size="sm" variant="outline" loading={dev.tryItLoading} onClick={() => dev.tryIt(path)}>
                  Try GET {path}
                </Button>
              ))}
            </div>
            {dev.tryItError && <p className="mt-3 text-xs text-destructive">{dev.tryItError}</p>}
            {dev.tryItResult && <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-accent/30 p-3 text-[11px] text-foreground">{JSON.stringify(dev.tryItResult, null, 2)}</pre>}
          </Panel>
        </div>
      )}
    </div>
  );
}
