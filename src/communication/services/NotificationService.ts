/**
 * Calixo Platform - Notification Service
 *
 * Core notification service for creating, managing, and delivering notifications.
 * Integrates with templates, preferences, delivery engine, and event bus.
 */

import { appLogger } from '@/logging';
import { generateId } from '@/shared/utils/string';
import type {
  Notification, CreateNotificationRequest, NotificationTemplate, RenderedNotification,
  NotificationCategory, NotificationChannel, NotificationPriority, NotificationStatus,
  PaginatedNotifications,
} from '@/communication/types';
import type { NotificationRepository, TemplateRepository } from '@/communication/repositories/interfaces';
import { InMemoryNotificationRepository, InMemoryTemplateRepository } from '@/communication/repositories/implementations';
import { templateRegistry } from '@/communication/config/templates';
import { inboxService } from '@/communication/inbox';
import { auditService } from '@/communication/audit';
import { eventBus } from '@/background/events/EventBus';

export class NotificationService {
  private notifRepo: NotificationRepository;
  private templateRepo: TemplateRepository;

  constructor(
    notifRepo?: NotificationRepository,
    templateRepo?: TemplateRepository
  ) {
    this.notifRepo = notifRepo || new InMemoryNotificationRepository();
    this.templateRepo = templateRepo || new InMemoryTemplateRepository();
  }

  async initializeTemplates(): Promise<number> {
    const existing = await this.templateRepo.getAll();
    if (existing.length > 0) return existing.length;

    const now = new Date().toISOString();
    let count = 0;

    for (const def of templateRegistry.getAll()) {
      const exists = await this.templateRepo.getByKey(def.key);
      if (!exists) {
        const template: NotificationTemplate = {
          id: generateId(16),
          key: def.key,
          name: def.name,
          description: def.description,
          category: def.category,
          titleTemplate: def.titleTemplate,
          bodyTemplate: def.bodyTemplate,
          channels: def.channels,
          defaultPriority: def.defaultPriority,
          actionUrlTemplate: def.actionUrlTemplate,
          actionLabelTemplate: def.actionLabelTemplate,
          variables: def.variables,
          isSystem: true,
          isDeleted: false,
          createdAt: now,
          updatedAt: now,
        };
        await this.templateRepo.create(template);
        count++;
      }
    }

    appLogger.info('NotificationService', `Initialized ${count} notification templates`);
    return count;
  }

  async send(data: CreateNotificationRequest): Promise<Notification> {
    const notification = await this.notifRepo.create(data);

    // Publish event
    await eventBus.publish({
      type: 'notification.created',
      source: 'communication',
      status: 'pending' as const,
      data: {
        notificationId: notification.id,
        userId: notification.userId,
        category: notification.category,
        priority: notification.priority,
        channel: notification.channel,
      },
      organizationId: notification.organizationId,
      userId: notification.userId,
      correlationId: notification.correlationId,
    });

    // Add to inbox
    await inboxService.addToInbox(notification);

    // Record audit
    await auditService.recordCreated(notification);

    appLogger.debug('NotificationService', `Notification sent: ${notification.id} to user ${notification.userId}`);
    return notification;
  }

  async sendFromTemplate(params: {
    templateKey: string;
    data: Record<string, unknown>;
    userId: string;
    organizationId?: string;
    workspaceId?: string;
    channel?: NotificationChannel;
    priority?: NotificationPriority;
    source: string;
    sourceId?: string;
    correlationId?: string;
  }): Promise<Notification> {
    const template = await this.templateRepo.getByKey(params.templateKey);
    if (!template) {
      throw new Error(`Template not found: ${params.templateKey}`);
    }

    const rendered = this.renderTemplate(template, params.data);

    return this.send({
      userId: params.userId,
      organizationId: params.organizationId,
      workspaceId: params.workspaceId,
      title: rendered.title,
      body: rendered.body,
      category: template.category,
      priority: params.priority || template.defaultPriority,
      channel: params.channel || 'in_app',
      templateId: template.id,
      templateData: params.data,
      actionUrl: rendered.actionUrl,
      actionLabel: rendered.actionLabel,
      source: params.source,
      sourceId: params.sourceId,
      correlationId: params.correlationId,
    });
  }

  async sendBatch(notifications: CreateNotificationRequest[]): Promise<Notification[]> {
    const results: Notification[] = [];
    for (const n of notifications) {
      results.push(await this.send(n));
    }
    appLogger.info('NotificationService', `Sent ${results.length} batch notifications`);
    return results;
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notifRepo.markAsRead(id);
    await inboxService.markAsRead(notification.userId, id);
    await auditService.recordRead(notification);
    return notification;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const count = await inboxService.markAllAsRead(userId);
    appLogger.debug('NotificationService', `Marked ${count} notifications as read for user ${userId}`);
    return count;
  }

  async archive(id: string): Promise<Notification> {
    const notification = await this.notifRepo.markAsArchived(id);
    await inboxService.archive(notification.userId, id);
    await auditService.recordArchived(notification);
    return notification;
  }

  async archiveAll(userId: string): Promise<number> {
    return inboxService.archiveAll(userId);
  }

  async delete(id: string): Promise<boolean> {
    const notification = await this.notifRepo.getById(id);
    if (!notification) return false;
    await this.notifRepo.delete(id);
    await inboxService.removeFromInbox(notification.userId, id);
    await auditService.recordDeleted(notification);
    return true;
  }

  async getNotification(id: string): Promise<Notification | null> {
    return this.notifRepo.getById(id);
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notifRepo.getByUser(userId);
  }

  async getPaginated(params: {
    userId?: string; organizationId?: string; status?: NotificationStatus;
    category?: NotificationCategory; page?: number; limit?: number;
  }): Promise<PaginatedNotifications> {
    return this.notifRepo.getPaginated(params);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifRepo.getUnreadCount(userId);
  }

  async getUnreadCountByCategory(userId: string): Promise<Record<NotificationCategory, number>> {
    return this.notifRepo.getUnreadCountByCategory(userId);
  }

  private renderTemplate(template: NotificationTemplate, data: Record<string, unknown>): RenderedNotification {
    const render = (templateStr: string): string => {
      return templateStr.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        return String(data[key] ?? `{{${key}}}`);
      });
    };

    return {
      title: render(template.titleTemplate),
      body: render(template.bodyTemplate),
      actionUrl: template.actionUrlTemplate ? render(template.actionUrlTemplate) : undefined,
      actionLabel: template.actionLabelTemplate ? render(template.actionLabelTemplate) : undefined,
    };
  }
}

export const notificationService = new NotificationService();