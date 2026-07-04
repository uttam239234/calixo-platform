/**
 * Calixo Platform - Notification Audit Service
 *
 * Tracks notification lifecycle events: created, delivered, read, archived,
 * deleted, failed, retried, expired.
 */

import { appLogger } from '@/logging';
import type { Notification, NotificationAuditEvent, NotificationAuditAction, NotificationChannel } from '@/communication/types';
import type { AuditRepository } from '@/communication/repositories/interfaces';
import { InMemoryAuditRepository } from '@/communication/repositories/implementations';

export class AuditService {
  private auditRepo: AuditRepository;

  constructor(auditRepo?: AuditRepository) {
    this.auditRepo = auditRepo || new InMemoryAuditRepository();
  }

  async recordCreated(notification: Notification): Promise<NotificationAuditEvent> {
    return this.auditRepo.create({
      notificationId: notification.id,
      userId: notification.userId,
      organizationId: notification.organizationId,
      action: 'notification.created',
      channel: notification.channel,
      status: notification.status,
      metadata: { title: notification.title, category: notification.category, priority: notification.priority },
    });
  }

  async recordDelivered(notification: Notification): Promise<NotificationAuditEvent> {
    return this.auditRepo.create({
      notificationId: notification.id,
      userId: notification.userId,
      organizationId: notification.organizationId,
      action: 'notification.delivered',
      channel: notification.channel,
      status: 'delivered',
    });
  }

  async recordRead(notification: Notification): Promise<NotificationAuditEvent> {
    return this.auditRepo.create({
      notificationId: notification.id,
      userId: notification.userId,
      organizationId: notification.organizationId,
      action: 'notification.read',
      channel: notification.channel,
      status: 'read',
    });
  }

  async recordArchived(notification: Notification): Promise<NotificationAuditEvent> {
    return this.auditRepo.create({
      notificationId: notification.id,
      userId: notification.userId,
      organizationId: notification.organizationId,
      action: 'notification.archived',
      channel: notification.channel,
      status: 'archived',
    });
  }

  async recordDeleted(notification: Notification): Promise<NotificationAuditEvent> {
    return this.auditRepo.create({
      notificationId: notification.id,
      userId: notification.userId,
      organizationId: notification.organizationId,
      action: 'notification.deleted',
      channel: notification.channel,
      status: 'deleted',
    });
  }

  async recordFailed(notification: Notification, error?: string): Promise<NotificationAuditEvent> {
    return this.auditRepo.create({
      notificationId: notification.id,
      userId: notification.userId,
      organizationId: notification.organizationId,
      action: 'notification.failed',
      channel: notification.channel,
      status: 'failed',
      metadata: { error },
    });
  }

  async recordRetried(notification: Notification, attempt: number): Promise<NotificationAuditEvent> {
    return this.auditRepo.create({
      notificationId: notification.id,
      userId: notification.userId,
      organizationId: notification.organizationId,
      action: 'notification.retried',
      channel: notification.channel,
      status: 'pending',
      metadata: { attempt },
    });
  }

  async recordExpired(notification: Notification): Promise<NotificationAuditEvent> {
    return this.auditRepo.create({
      notificationId: notification.id,
      userId: notification.userId,
      organizationId: notification.organizationId,
      action: 'notification.expired',
      channel: notification.channel,
      status: 'expired',
    });
  }

  async getAuditTrail(notificationId: string): Promise<NotificationAuditEvent[]> {
    return this.auditRepo.getByNotification(notificationId);
  }

  async getUserAuditTrail(userId: string): Promise<NotificationAuditEvent[]> {
    return this.auditRepo.getByUser(userId);
  }
}

export const auditService = new AuditService();