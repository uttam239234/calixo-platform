/**
 * Calixo Platform - Webhook Framework
 *
 * Supports incoming and outgoing webhooks with signature validation,
 * retry logic, and queue integration.
 */

import type { Webhook, IncomingWebhookPayload, WebhookResponse } from '@/background/types';
import type { WebhookRepository } from '@/background/repositories/interfaces';
import { InMemoryWebhookRepository } from '@/background/repositories/implementations';
import { queueEngine } from '@/background/queue/QueueEngine';

export class WebhookFramework {
  private webhookRepo: WebhookRepository;

  constructor(webhookRepo?: WebhookRepository) {
    this.webhookRepo = webhookRepo || new InMemoryWebhookRepository();
  }

  async registerOutgoing(data: {
    name: string;
    description?: string;
    url: string;
    secret?: string;
    events: string[];
    headers?: Record<string, string>;
    organizationId?: string;
    workspaceId?: string;
  }): Promise<Webhook> {
    return this.webhookRepo.create({
      name: data.name,
      description: data.description,
      direction: 'outgoing',
      url: data.url,
      secret: data.secret,
      events: data.events,
      headers: data.headers,
      organizationId: data.organizationId,
      workspaceId: data.workspaceId,
      isActive: true,
    });
  }

  async registerIncoming(data: {
    name: string;
    description?: string;
    secret?: string;
    events: string[];
    organizationId?: string;
    workspaceId?: string;
  }): Promise<Webhook> {
    return this.webhookRepo.create({
      name: data.name,
      description: data.description,
      direction: 'incoming',
      secret: data.secret,
      events: data.events,
      organizationId: data.organizationId,
      workspaceId: data.workspaceId,
      isActive: true,
    });
  }

  async handleIncoming(webhookId: string, payload: IncomingWebhookPayload): Promise<{ eventId: string }> {
    const webhook = await this.webhookRepo.getById(webhookId);
    if (!webhook || !webhook.isActive) throw new Error('Webhook not found or inactive');

    // Validate signature if secret is set
    if (webhook.secret) {
      this.validateSignature(payload, webhook.secret);
    }

    // Create a job to process the webhook payload
    const job = await queueEngine.enqueue({
      type: 'immediate',
      name: `webhook:incoming:${webhook.name}`,
      worker: 'webhook',
      payload: {
        webhookId: webhook.id,
        headers: payload.headers,
        body: payload.body,
        query: payload.query,
        method: payload.method,
        ip: payload.ip,
      },
      organizationId: webhook.organizationId,
      workspaceId: webhook.workspaceId,
      tags: ['webhook', `webhook:${webhook.id}`],
    });

    return { eventId: job.id };
  }

  async dispatchOutgoing(eventType: string, data: Record<string, unknown>, context?: {
    organizationId?: string;
    workspaceId?: string;
  }): Promise<void> {
    const webhooks = await this.webhookRepo.getByEvent(eventType);

    for (const webhook of webhooks) {
      await queueEngine.enqueue({
        type: 'immediate',
        name: `webhook:outgoing:${webhook.name}:${eventType}`,
        worker: 'webhook',
        payload: {
          webhookId: webhook.id,
          url: webhook.url,
          secret: webhook.secret,
          headers: webhook.headers,
          eventType,
          data,
        },
        organizationId: context?.organizationId || webhook.organizationId,
        workspaceId: context?.workspaceId,
        tags: ['webhook', `webhook:${webhook.id}`, `event:${eventType}`],
      });
    }
  }

  async updateWebhook(id: string, data: Partial<Webhook>): Promise<Webhook> {
    return this.webhookRepo.update(id, data);
  }

  async activateWebhook(id: string): Promise<Webhook> {
    return this.webhookRepo.activate(id);
  }

  async deactivateWebhook(id: string): Promise<Webhook> {
    return this.webhookRepo.deactivate(id);
  }

  async deleteWebhook(id: string): Promise<boolean> {
    return this.webhookRepo.delete(id);
  }

  async getWebhook(id: string): Promise<Webhook | null> {
    return this.webhookRepo.getById(id);
  }

  async getWebhooksByOrganization(organizationId: string): Promise<Webhook[]> {
    return this.webhookRepo.getByOrganization(organizationId);
  }

  async recordResponse(webhookId: string, response: WebhookResponse): Promise<Webhook> {
    return this.webhookRepo.updateLastTriggered(webhookId, response);
  }

  private validateSignature(payload: IncomingWebhookPayload, _secret: string): void {
    // Signature validation placeholder
    // In production, implement HMAC-SHA256 signature verification
    const signature = payload.headers['x-webhook-signature'];
    if (!signature) {
      throw new Error('Missing webhook signature');
    }
  }
}

export const webhookFramework = new WebhookFramework();