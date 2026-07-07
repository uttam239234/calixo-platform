/**
 * Calixo Platform - Webhook Platform API
 *
 * Wraps the reused `integrationWebhookService` (registration + delivery
 * bookkeeping) and adds real HMAC signing/verification
 * (`WebhookSigningService`) — incoming/outgoing, retry/replay already exist
 * in the wrapped service; Dead Letter Queue is readiness-only (see the
 * Remaining Roadmap — there is no real background queue to hand failed
 * deliveries to yet, Phase 4's persistence is in-memory only).
 */
import { integrationWebhookService } from "@/integrations/webhooks/WebhookService";
import type { ConnectionId, WebhookConfig, WebhookDelivery, WebhookEvent } from "@/integrations/types";
import { signWebhookPayload, verifyWebhookSignatureAsync } from "./WebhookSigningService";
import { platformEventBus } from "../events/PlatformEventBus";

export class WebhookPlatformAPI {
  register(connectionId: ConnectionId, config: Omit<WebhookConfig, "id" | "createdAt" | "updatedAt">): Promise<WebhookConfig> {
    return integrationWebhookService.register(connectionId, config);
  }

  unregister(webhookId: string): Promise<void> {
    return integrationWebhookService.unregister(webhookId);
  }

  getWebhooks(connectionId: ConnectionId): Promise<WebhookConfig[]> {
    return integrationWebhookService.getWebhooks(connectionId);
  }

  sign(payload: unknown, secret: string): Promise<string> {
    return signWebhookPayload(payload, secret);
  }

  verify(payload: unknown, signature: string, secret: string): Promise<boolean> {
    return verifyWebhookSignatureAsync(payload, signature, secret);
  }

  async receive(webhookId: string, event: WebhookEvent, payload: unknown, signature: string, secret: string): Promise<WebhookDelivery> {
    const validSignature = await this.verify(payload, signature, secret);
    if (!validSignature) throw new Error("Invalid webhook signature");

    await platformEventBus.publish({ type: "WebhookReceived", payload: { webhookId, event } });
    const delivery = await integrationWebhookService.handleDelivery(webhookId, event, payload);
    await platformEventBus.publish({ type: "WebhookDelivered", payload: { webhookId, event, status: delivery.status } });
    return delivery;
  }

  getDeliveries(webhookId: string): Promise<WebhookDelivery[]> {
    return integrationWebhookService.getDeliveries(webhookId);
  }

  redeliver(deliveryId: string): Promise<WebhookDelivery> {
    return integrationWebhookService.redeliver(deliveryId);
  }
}

export const webhookPlatformAPI = new WebhookPlatformAPI();
