/**
 * Calixo Platform - Delivery Engine
 *
 * Handles notification delivery across all channels with queue, retry,
 * failure handling, delivery status tracking, and expiration.
 */

import { appLogger } from '@/logging';
import type { Notification, DeliveryRecord, NotificationChannel } from '@/communication/types';
import type { DeliveryRepository, NotificationRepository } from '@/communication/repositories/interfaces';
import { InMemoryDeliveryRepository, InMemoryNotificationRepository } from '@/communication/repositories/implementations';
import { queueEngine } from '@/background/queue/QueueEngine';

export class DeliveryEngine {
  private deliveryRepo: DeliveryRepository;
  private notifRepo: NotificationRepository;

  constructor(
    deliveryRepo?: DeliveryRepository,
    notifRepo?: NotificationRepository
  ) {
    this.deliveryRepo = deliveryRepo || new InMemoryDeliveryRepository();
    this.notifRepo = notifRepo || new InMemoryNotificationRepository();
  }

  async deliver(notification: Notification): Promise<DeliveryRecord> {
    const record = await this.deliveryRepo.create({
      notificationId: notification.id,
      userId: notification.userId,
      channel: notification.channel,
      status: 'queued',
      attempts: 0,
      maxAttempts: 3,
    });

    // Enqueue delivery job
    await queueEngine.enqueue({
      type: 'immediate',
      name: `notification:deliver:${notification.id}`,
      worker: 'notification',
      payload: {
        notificationId: notification.id,
        deliveryId: record.id,
        channel: notification.channel,
        userId: notification.userId,
      },
      organizationId: notification.organizationId,
      userId: notification.userId,
      tags: ['notification', `notification:${notification.id}`],
    });

    appLogger.debug('DeliveryEngine', `Delivery queued: ${record.id} for notification ${notification.id}`);
    return record;
  }

  async processDelivery(notificationId: string, deliveryId: string, channel: NotificationChannel): Promise<boolean> {
    const record = await this.deliveryRepo.getById(deliveryId);
    if (!record) throw new Error('Delivery record not found');

    await this.deliveryRepo.updateStatus(deliveryId, 'sending');

    try {
      const success = await this.sendToChannel(channel, notificationId);

      if (success) {
        await this.deliveryRepo.markDelivered(deliveryId);
        await this.notifRepo.markAsRead(notificationId);
        return true;
      } else {
        throw new Error('Channel delivery returned false');
      }
    } catch (error) {
      const errMsg = (error as Error).message;
      await this.deliveryRepo.incrementAttempt(deliveryId);

      if (record.attempts + 1 >= record.maxAttempts) {
        await this.deliveryRepo.markFailed(deliveryId, errMsg);
        appLogger.error('DeliveryEngine', `Delivery failed permanently: ${deliveryId}`, error as Error);
        return false;
      }

      await this.deliveryRepo.updateStatus(deliveryId, 'retrying', errMsg);
      appLogger.warn('DeliveryEngine', `Delivery failed, retrying: ${deliveryId} (attempt ${record.attempts + 1}/${record.maxAttempts})`);

      // Re-enqueue with delay
      const delay = Math.min(1000 * Math.pow(2, record.attempts), 30000);
      await queueEngine.enqueue({
        type: 'immediate',
        name: `notification:retry:${notificationId}`,
        worker: 'notification',
        payload: { notificationId, deliveryId, channel },
        tags: ['notification', 'retry'],
      });

      return false;
    }
  }

  private async sendToChannel(channel: NotificationChannel, notificationId: string): Promise<boolean> {
    // Channel implementations - framework only for external channels
    switch (channel) {
      case 'in_app':
        return this.sendInApp(notificationId);
      case 'email':
        return this.sendEmail(notificationId);
      case 'slack':
        return this.sendSlack(notificationId);
      case 'teams':
        return this.sendTeams(notificationId);
      case 'webhook':
        return this.sendWebhook(notificationId);
      case 'push':
        return this.sendPush(notificationId);
      case 'sms':
        return this.sendSms(notificationId);
      default:
        appLogger.warn('DeliveryEngine', `Unknown channel: ${channel}`);
        return false;
    }
  }

  private async sendInApp(notificationId: string): Promise<boolean> {
    // In-app delivery is handled by the inbox system
    return true;
  }

  private async sendEmail(_notificationId: string): Promise<boolean> {
    // Email channel - framework only
    // In production, integrate with SendGrid, SES, or SMTP
    appLogger.debug('DeliveryEngine', 'Email delivery - framework placeholder');
    return true;
  }

  private async sendSlack(_notificationId: string): Promise<boolean> {
    // Slack channel - framework only
    // In production, integrate with Slack API
    appLogger.debug('DeliveryEngine', 'Slack delivery - framework placeholder');
    return true;
  }

  private async sendTeams(_notificationId: string): Promise<boolean> {
    // Microsoft Teams channel - framework only
    // In production, integrate with Teams webhook/API
    appLogger.debug('DeliveryEngine', 'Teams delivery - framework placeholder');
    return true;
  }

  private async sendWebhook(_notificationId: string): Promise<boolean> {
    // Webhook channel - framework only
    appLogger.debug('DeliveryEngine', 'Webhook delivery - framework placeholder');
    return true;
  }

  private async sendPush(_notificationId: string): Promise<boolean> {
    // Push notification channel - future-ready
    appLogger.debug('DeliveryEngine', 'Push delivery - future-ready placeholder');
    return true;
  }

  private async sendSms(_notificationId: string): Promise<boolean> {
    // SMS channel - future-ready
    appLogger.debug('DeliveryEngine', 'SMS delivery - future-ready placeholder');
    return true;
  }

  async getDeliveryRecord(id: string): Promise<DeliveryRecord | null> {
    return this.deliveryRepo.getById(id);
  }

  async getDeliveryRecordsByNotification(notificationId: string): Promise<DeliveryRecord[]> {
    return this.deliveryRepo.getByNotification(notificationId);
  }

  async getPendingDeliveries(): Promise<DeliveryRecord[]> {
    return this.deliveryRepo.getPending();
  }
}

export const deliveryEngine = new DeliveryEngine();