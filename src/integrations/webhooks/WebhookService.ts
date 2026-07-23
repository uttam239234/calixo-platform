/**
 * Calixo Platform - Webhook Framework
 * 
 * Manages webhook registrations and delivery for integration providers.
 */

import { appLogger } from '@/logging';
import { NotFoundError } from '@/errors';
import { generateId } from '@/shared/utils/string';
import type { WebhookService, WebhookConfig, WebhookDelivery, WebhookEvent, ConnectionId } from '@/integrations/types';

const DEFAULT_RETRY = { maxRetries: 3, initialDelayMs: 1000, maxDelayMs: 30000, backoffMultiplier: 2 };

export class IntegrationWebhookService implements WebhookService {
  private webhooks: Map<string, WebhookConfig> = new Map();
  private connectionWebhooks: Map<ConnectionId, string[]> = new Map();
  private deliveries: Map<string, WebhookDelivery> = new Map();

  async register(connectionId: ConnectionId, config: Omit<WebhookConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<WebhookConfig> {
    const now = new Date().toISOString();
    const webhook: WebhookConfig = {
      ...config,
      id: generateId(16),
      connectionId,
      createdAt: now,
      updatedAt: now,
      retryConfig: config.retryConfig || DEFAULT_RETRY,
    };

    this.webhooks.set(webhook.id, webhook);
    
    if (!this.connectionWebhooks.has(connectionId)) {
      this.connectionWebhooks.set(connectionId, []);
    }
    this.connectionWebhooks.get(connectionId)!.push(webhook.id);

    appLogger.info('WebhookService', `Webhook registered for connection ${connectionId}`);
    return { ...webhook };
  }

  async unregister(webhookId: string): Promise<void> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) {
      throw new NotFoundError('Webhook');
    }

    this.webhooks.delete(webhookId);
    
    const hooks = this.connectionWebhooks.get(webhook.connectionId);
    if (hooks) {
      const idx = hooks.indexOf(webhookId);
      if (idx >= 0) hooks.splice(idx, 1);
    }

    appLogger.info('WebhookService', `Webhook unregistered: ${webhookId}`);
  }

  async getWebhooks(connectionId: ConnectionId): Promise<WebhookConfig[]> {
    const ids = this.connectionWebhooks.get(connectionId) || [];
    return ids
      .map(id => this.webhooks.get(id))
      .filter((w): w is WebhookConfig => !!w)
      .map(w => ({ ...w }));
  }

  async getWebhook(id: string): Promise<WebhookConfig | null> {
    const webhook = this.webhooks.get(id);
    return webhook ? { ...webhook } : null;
  }

  async updateWebhook(id: string, config: Partial<WebhookConfig>): Promise<WebhookConfig> {
    const webhook = this.webhooks.get(id);
    if (!webhook) {
      throw new NotFoundError('Webhook');
    }

    Object.assign(webhook, config);
    webhook.updatedAt = new Date().toISOString();
    this.webhooks.set(id, webhook);

    appLogger.info('WebhookService', `Webhook updated: ${id}`);
    return { ...webhook };
  }

  async handleDelivery(webhookId: string, event: WebhookEvent, payload: unknown): Promise<WebhookDelivery> {
    const delivery: WebhookDelivery = {
      id: generateId(16),
      webhookId,
      event,
      payload,
      status: 'pending',
      attemptCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.deliveries.set(delivery.id, delivery);
    
    // Simulate delivery
    delivery.status = 'delivered';
    delivery.attemptCount = 1;
    delivery.responseStatusCode = 200;

    appLogger.info('WebhookService', `Webhook delivery: ${delivery.id} - ${event}`);
    return { ...delivery };
  }

  async getDeliveries(webhookId: string): Promise<WebhookDelivery[]> {
    return Array.from(this.deliveries.values())
      .filter(d => d.webhookId === webhookId)
      .map(d => ({ ...d }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async redeliver(deliveryId: string): Promise<WebhookDelivery> {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery) {
      throw new NotFoundError('Delivery');
    }

    delivery.attemptCount++;
    delivery.status = 'delivered';
    delivery.responseStatusCode = 200;

    appLogger.info('WebhookService', `Webhook redelivered: ${deliveryId}`);
    return { ...delivery };
  }
}

export const integrationWebhookService = new IntegrationWebhookService();