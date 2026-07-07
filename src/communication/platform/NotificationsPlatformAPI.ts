/**
 * Calixo Platform - Notifications Platform API
 *
 * The sanctioned way another module reads/writes notification & inbox
 * data — wraps `notificationService`/`inboxService` so Dashboard no longer
 * needs to import them directly (flagged as direct engine/service
 * coupling by the Enterprise Architecture Audit). `getInboxItems()`
 * carries the full item shape Dashboard's notification feed needs;
 * `getNotificationSummary()` is the lighter-weight `NotificationSummary`
 * contract for consumers that only need a headline count.
 */
import { notificationService } from "../services";
import { inboxService } from "../inbox";
import type { InboxItem } from "../types";
import type { NotificationSummary } from "@/core/platform/contracts";

export class NotificationsPlatformAPI {
  async getInboxItems(userId: string, limit = 8): Promise<InboxItem[]> {
    const items = await inboxService.getInbox(userId);
    return items.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return inboxService.getUnreadCount(userId);
  }

  async markRead(userId: string, notificationId: string): Promise<void> {
    await inboxService.markAsRead(userId, notificationId);
  }

  async markAllRead(userId: string): Promise<number> {
    return inboxService.markAllAsRead(userId);
  }

  async getNotificationSummary(userId: string, limit = 5): Promise<NotificationSummary> {
    const [unreadCount, recent] = await Promise.all([this.getUnreadCount(userId), this.getInboxItems(userId, limit)]);
    return { unreadCount, recent: recent.map(i => ({ id: i.notificationId, title: i.title, createdAt: i.createdAt })) };
  }

  async send(input: Parameters<typeof notificationService.send>[0]) {
    return notificationService.send(input);
  }
}

export const notificationsPlatformAPI = new NotificationsPlatformAPI();
