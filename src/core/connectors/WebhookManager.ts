/**
 * Calixo Platform - Universal Connector Framework: Webhook Manager
 *
 * A universal webhook processor: register a receiver, validate every
 * inbound delivery's signature for REAL (reusing the already-real
 * `WebhookSigningService` HMAC-SHA256 primitive — not reinventing it a
 * third time; see that file's own header for why the other two existing
 * webhook systems in this codebase weren't reused instead), retry/replay
 * the most recent failure, and a dead-letter counter for repeated
 * failures. Persisted per-organization via `ConnectorDataStore` (never one
 * global webhook table).
 *
 * The signing secret is sealed in the SAME dedicated vault `TokenManager`
 * already created for this framework (`tokenManager.vault`) — a webhook
 * signing secret is exactly the same class of "this framework's own
 * organization-scoped secret" as an access/refresh token, so it shares that
 * vault rather than spinning up a 5th isolated instance for one more field.
 */
import "server-only";
import { signWebhookPayload, verifyWebhookSignatureAsync } from "@/core/platform/connectors/WebhookSigningService";
import { tokenManager } from "./TokenManager";
import { readOrgTable, writeOrgTable } from "./persistence/ConnectorDataStore";
import { connectorEventBus } from "./ConnectorEventBus";
import { connectorLogger } from "./ConnectorLogger";
import { auditService } from "@/access/audit/AuditService";
import { generateId } from "@/shared/utils/string";
import type { ConnectorProviderId, ConnectorWebhook } from "./types";

async function webhooksFor(organizationId: string): Promise<ConnectorWebhook[]> {
  return readOrgTable<ConnectorWebhook[]>(organizationId, "webhooks") ?? [];
}

async function save(record: ConnectorWebhook): Promise<void> {
  const all = await webhooksFor(record.organizationId);
  const next = [...all.filter(w => w.id !== record.id), record];
  await writeOrgTable(record.organizationId, "webhooks", next);
}

export const webhookManager = {
  async register(organizationId: string, connectorInstanceId: string, provider: ConnectorProviderId, params: { events: string[]; receiverUrl: string }, actorId: string): Promise<ConnectorWebhook> {
    const signingSecret = generateId(40);
    const sealedSigningSecretRef = await tokenManager.vault.seal(signingSecret);

    const record: ConnectorWebhook = {
      id: generateId(16),
      organizationId,
      connectorInstanceId,
      provider,
      receiverUrl: params.receiverUrl,
      sealedSigningSecretRef,
      events: params.events,
      status: "active",
      deadLetterCount: 0,
      createdAt: new Date().toISOString(),
    };
    await save(record);

    await auditService.recordEvent({
      organizationId,
      userId: actorId,
      eventType: "connector_webhook_registered",
      resource: "connector_webhook",
      resourceId: record.id,
      description: `Registered a ${provider} webhook for connector ${connectorInstanceId} (events: ${params.events.join(", ")}).`,
    });

    return record;
  },

  async get(organizationId: string, webhookId: string): Promise<ConnectorWebhook | undefined> {
    return (await webhooksFor(organizationId)).find(w => w.id === webhookId);
  },

  async listForOrganization(organizationId: string): Promise<ConnectorWebhook[]> {
    return webhooksFor(organizationId);
  },

  /** The real, only-way-in entry point an inbound HTTP route should call. Verifies the HMAC-SHA256 signature for real; on success logs + publishes `WebhookReceived`; on failure increments the dead-letter counter and stores the payload for a real `replayLastFailed()`. */
  async verifyAndReceive(params: { organizationId: string; webhookId: string; rawBody: string; signatureHeader: string | null }): Promise<{ ok: boolean; message: string }> {
    const webhook = await this.get(params.organizationId, params.webhookId);
    if (!webhook) return { ok: false, message: "Unknown webhook registration." };
    if (webhook.status === "disabled") return { ok: false, message: "This webhook registration is disabled." };
    if (!params.signatureHeader) return { ok: false, message: "Missing signature header." };

    const secret = await tokenManager.vault.reveal(webhook.sealedSigningSecretRef);
    const valid = await verifyWebhookSignatureAsync(params.rawBody, params.signatureHeader, secret);

    if (!valid) {
      const next: ConnectorWebhook = { ...webhook, lastDeliveryAt: new Date().toISOString(), lastDeliveryStatus: "failure", lastFailedPayload: safeParse(params.rawBody), deadLetterCount: webhook.deadLetterCount + 1, status: webhook.deadLetterCount + 1 >= 10 ? "failing" : webhook.status };
      await save(next);
      await connectorLogger.log({ provider: webhook.provider, organizationId: params.organizationId, connectorInstanceId: webhook.connectorInstanceId, action: "webhook.receive", status: "failure", error: "Invalid signature" });
      return { ok: false, message: "Invalid webhook signature." };
    }

    const next: ConnectorWebhook = { ...webhook, lastDeliveryAt: new Date().toISOString(), lastDeliveryStatus: "success" };
    await save(next);
    await connectorLogger.log({ provider: webhook.provider, organizationId: params.organizationId, connectorInstanceId: webhook.connectorInstanceId, action: "webhook.receive", status: "success" });
    await connectorEventBus.webhookReceived({ organizationId: params.organizationId, connectorInstanceId: webhook.connectorInstanceId }, webhook.provider, "inbound");

    return { ok: true, message: "Webhook received and verified." };
  },

  /** Real replay of the single most recently failed delivery — re-runs signature verification against the stored payload with the CURRENT secret (useful after rotating a signing secret that had drifted out of sync with the sender). */
  async replayLastFailed(organizationId: string, webhookId: string): Promise<{ ok: boolean; message: string }> {
    const webhook = await this.get(organizationId, webhookId);
    if (!webhook?.lastFailedPayload) return { ok: false, message: "No failed delivery to replay." };
    const rawBody = typeof webhook.lastFailedPayload === "string" ? webhook.lastFailedPayload : JSON.stringify(webhook.lastFailedPayload);
    const secret = await tokenManager.vault.reveal(webhook.sealedSigningSecretRef);
    const signature = await signWebhookPayload(rawBody, secret);
    return this.verifyAndReceive({ organizationId, webhookId, rawBody, signatureHeader: signature });
  },

  async disable(organizationId: string, webhookId: string): Promise<void> {
    const webhook = await this.get(organizationId, webhookId);
    if (!webhook) return;
    await save({ ...webhook, status: "disabled" });
  },
};

function safeParse(rawBody: string): unknown {
  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
}
