/**
 * Calixo Platform - Inbox Service (Communication Hub)
 *
 * Centralized inbox supporting notifications, mentions, approvals, tasks,
 * system alerts, AI alerts, and integration alerts.
 */

import { appLogger } from '@/logging';
import { generateId } from '@/shared/utils/string';
import type {
  InboxItem, InboxFilter, Notification, CommunicationHubSummary,
  NotificationCategory, NotificationPriority, PaginatedInboxItems,
} from '@/communication/types';
import type { InboxRepository } from '@/communication/repositories/interfaces';
import { InMemoryInboxRepository } from '@/communication/repositories/implementations';

export class InboxService {
  private inboxRepo: InboxRepository;

  constructor(inboxRepo?: InboxRepository) {
    this.inboxRepo = inboxRepo || new InMemoryInboxRepository();
  }

  async addToInbox(notification: Notification): Promise<void> {
    const item: InboxItem = {
      id: generateId(16),
      notificationId: notification.id,
      userId: notification.userId,
      organizationId: notification.organizationId,
      workspaceId: notification.workspaceId,
      title: notification.title,
      body: notification.body,
      category: notification.category,
      priority: notification.priority,
      status: notification.status,
      actionUrl: notification.actionUrl,
      actionLabel: notification.actionLabel,
      imageUrl: notification.imageUrl,
      source: notification.source,
      sourceId: notification.sourceId,
      correlationId: notification.correlationId,
      isRead: false,
      isArchived: false,
      deliveredAt: notification.deliveredAt,
      createdAt: notification.createdAt,
    };

    await this.inboxRepo.addToInbox(item);
  }

  async getInbox(userId: string): Promise<InboxItem[]> {
    return this.inboxRepo.getByUser(userId);
  }

  async getFilteredInbox(userId: string, filter: InboxFilter): Promise<PaginatedInboxItems> {
    return this.inboxRepo.getFiltered(userId, filter);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.inboxRepo.getUnreadCount(userId);
  }

  async getUnreadByCategory(userId: string): Promise<Record<NotificationCategory, number>> {
    return this.inboxRepo.getUnreadByCategory(userId);
  }

  async getUnreadByPriority(userId: string): Promise<Record<NotificationPriority, number>> {
    return this.inboxRepo.getUnreadByPriority(userId);
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await this.inboxRepo.markAsRead(userId, notificationId);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const count = await this.inboxRepo.markAllAsRead(userId);
    appLogger.debug('InboxService', `Marked all as read for user ${userId}: ${count} items`);
    return count;
  }

  async archive(userId: string, notificationId: string): Promise<void> {
    await this.inboxRepo.archive(userId, notificationId);
  }

  async archiveAll(userId: string): Promise<number> {
    const count = await this.inboxRepo.archiveAll(userId);
    appLogger.debug('InboxService', `Archived all for user ${userId}: ${count} items`);
    return count;
  }

  async removeFromInbox(userId: string, notificationId: string): Promise<boolean> {
    return this.inboxRepo.removeFromInbox(userId, notificationId);
  }

  async getSummary(userId: string): Promise<CommunicationHubSummary> {
    const [unread, byCategory, byPriority, items] = await Promise.all([
      this.getUnreadCount(userId),
      this.getUnreadByCategory(userId),
      this.getUnreadByPriority(userId),
      this.getInbox(userId),
    ]);

    const recentItems = items.slice(0, 10);

    return {
      totalUnread: unread,
      unreadByCategory: byCategory,
      unreadByPriority: byPriority,
      recentNotifications: recentItems,
      mentions: byCategory.ai || 0,
      approvals: byCategory.warning || 0,
      tasks: items.filter(i => i.source === 'system' && !i.isRead).length,
      systemAlerts: byCategory.system || 0,
      aiAlerts: byCategory.ai || 0,
      integrationAlerts: items.filter(i => i.source === 'integrations' && !i.isRead).length,
    };
  }
}

export const inboxService = new InboxService();