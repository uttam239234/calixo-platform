/**
 * Calixo Platform - Communication Repository Implementations
 *
 * In-memory implementations. Replace with Prisma for production.
 */

import { generateId } from '@/shared/utils/string';
import { appLogger } from '@/logging';
import type {
  Notification, CreateNotificationRequest, NotificationTemplate, NotificationPreference,
  DeliveryRecord, InboxItem, InboxFilter, NotificationAuditEvent, NotificationCategory,
  NotificationChannel, NotificationStatus, NotificationPriority,
  PaginatedNotifications, PaginatedInboxItems, PaginatedTemplates, PaginatedDeliveryRecords,
} from '@/communication/types';
import type {
  NotificationRepository, TemplateRepository, PreferenceRepository,
  DeliveryRepository, InboxRepository, AuditRepository,
} from './interfaces';

export class InMemoryNotificationRepository implements NotificationRepository {
  private notifications: Map<string, Notification> = new Map();

  async getById(id: string): Promise<Notification | null> {
    return this.notifications.get(id) || null;
  }

  async getByUser(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId && !n.isDeleted);
  }

  async getByOrganization(organizationId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.organizationId === organizationId && !n.isDeleted);
  }

  async getByStatus(status: NotificationStatus): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.status === status && !n.isDeleted);
  }

  async getByCategory(category: NotificationCategory): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.category === category && !n.isDeleted);
  }

  async getBySource(source: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.source === source && !n.isDeleted);
  }

  async getUnreadByUser(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId && n.status === 'delivered' && !n.isDeleted);
  }

  async getPaginated(params: {
    userId?: string; organizationId?: string; status?: NotificationStatus;
    category?: NotificationCategory; page?: number; limit?: number;
  }): Promise<PaginatedNotifications> {
    let filtered = Array.from(this.notifications.values()).filter(n => !n.isDeleted);
    if (params.userId) filtered = filtered.filter(n => n.userId === params.userId);
    if (params.organizationId) filtered = filtered.filter(n => n.organizationId === params.organizationId);
    if (params.status) filtered = filtered.filter(n => n.status === params.status);
    if (params.category) filtered = filtered.filter(n => n.category === params.category);
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return { data: filtered.slice(start, start + limit), total, page, limit, totalPages };
  }

  async create(data: CreateNotificationRequest): Promise<Notification> {
    const now = new Date().toISOString();
    const notification: Notification = {
      id: generateId(16),
      organizationId: data.organizationId,
      workspaceId: data.workspaceId,
      userId: data.userId,
      title: data.title,
      body: data.body,
      category: data.category,
      priority: data.priority || 'normal',
      status: 'pending',
      channel: data.channel || 'in_app',
      templateId: data.templateId,
      templateData: data.templateData,
      actionUrl: data.actionUrl,
      actionLabel: data.actionLabel,
      imageUrl: data.imageUrl,
      metadata: data.metadata,
      source: data.source,
      sourceId: data.sourceId,
      correlationId: data.correlationId,
      expiresAt: data.expiresAt,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
    this.notifications.set(notification.id, notification);
    return { ...notification };
  }

  async markAsRead(id: string): Promise<Notification> {
    const n = this.notifications.get(id);
    if (!n) throw new Error('Notification not found');
    n.status = 'read';
    n.readAt = new Date().toISOString();
    n.updatedAt = n.readAt;
    return { ...n };
  }

  async markAsDelivered(id: string): Promise<Notification> {
    const n = this.notifications.get(id);
    if (!n) throw new Error('Notification not found');
    n.status = 'delivered';
    n.deliveredAt = new Date().toISOString();
    n.updatedAt = n.deliveredAt;
    return { ...n };
  }

  async markAsArchived(id: string): Promise<Notification> {
    const n = this.notifications.get(id);
    if (!n) throw new Error('Notification not found');
    n.status = 'archived';
    n.archivedAt = new Date().toISOString();
    n.updatedAt = n.archivedAt;
    return { ...n };
  }

  async markAsFailed(id: string, error?: string): Promise<Notification> {
    const n = this.notifications.get(id);
    if (!n) throw new Error('Notification not found');
    n.status = 'failed';
    if (error) n.metadata = { ...n.metadata, error };
    n.updatedAt = new Date().toISOString();
    return { ...n };
  }

  async markAsExpired(id: string): Promise<Notification> {
    const n = this.notifications.get(id);
    if (!n) throw new Error('Notification not found');
    n.status = 'expired';
    n.updatedAt = new Date().toISOString();
    return { ...n };
  }

  async delete(id: string): Promise<boolean> {
    const n = this.notifications.get(id);
    if (!n) return false;
    n.isDeleted = true;
    n.deletedAt = new Date().toISOString();
    return true;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId && n.status === 'delivered' && !n.isDeleted).length;
  }

  async getUnreadCountByCategory(userId: string): Promise<Record<NotificationCategory, number>> {
    const counts: Record<string, number> = {};
    for (const n of this.notifications.values()) {
      if (n.userId === userId && n.status === 'delivered' && !n.isDeleted) {
        counts[n.category] = (counts[n.category] || 0) + 1;
      }
    }
    return counts as Record<NotificationCategory, number>;
  }

  async deleteOlderThan(date: string): Promise<number> {
    const toDelete = Array.from(this.notifications.values())
      .filter(n => new Date(n.createdAt) < new Date(date));
    for (const n of toDelete) this.notifications.delete(n.id);
    return toDelete.length;
  }
}

export class InMemoryTemplateRepository implements TemplateRepository {
  private templates: Map<string, NotificationTemplate> = new Map();

  async getById(id: string): Promise<NotificationTemplate | null> {
    return this.templates.get(id) || null;
  }

  async getByKey(key: string): Promise<NotificationTemplate | null> {
    return Array.from(this.templates.values()).find(t => t.key === key && !t.isDeleted) || null;
  }

  async getAll(): Promise<NotificationTemplate[]> {
    return Array.from(this.templates.values()).filter(t => !t.isDeleted);
  }

  async getByCategory(category: NotificationCategory): Promise<NotificationTemplate[]> {
    return Array.from(this.templates.values()).filter(t => t.category === category && !t.isDeleted);
  }

  async getPaginated(params: { page?: number; limit?: number; category?: NotificationCategory }): Promise<PaginatedTemplates> {
    let filtered = Array.from(this.templates.values()).filter(t => !t.isDeleted);
    if (params.category) filtered = filtered.filter(t => t.category === params.category);
    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return { data: filtered.slice(start, start + limit), total, page, limit, totalPages };
  }

  async create(template: NotificationTemplate): Promise<NotificationTemplate> {
    this.templates.set(template.id, template);
    return { ...template };
  }

  async update(id: string, data: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const t = this.templates.get(id);
    if (!t) throw new Error('Template not found');
    Object.assign(t, data);
    t.updatedAt = new Date().toISOString();
    return { ...t };
  }

  async delete(id: string): Promise<boolean> {
    const t = this.templates.get(id);
    if (!t) return false;
    t.isDeleted = true;
    t.deletedAt = new Date().toISOString();
    return true;
  }

  seedTemplates(templates: NotificationTemplate[]): void {
    for (const t of templates) this.templates.set(t.id, t);
  }
}

export class InMemoryPreferenceRepository implements PreferenceRepository {
  private preferences: Map<string, NotificationPreference> = new Map();

  async getById(id: string): Promise<NotificationPreference | null> {
    return this.preferences.get(id) || null;
  }

  async getByUser(userId: string): Promise<NotificationPreference[]> {
    return Array.from(this.preferences.values()).filter(p => p.userId === userId);
  }

  async getByUserAndChannel(userId: string, channel: NotificationChannel): Promise<NotificationPreference | null> {
    return Array.from(this.preferences.values())
      .find(p => p.userId === userId && p.channel === channel) || null;
  }

  async getByOrganization(organizationId: string): Promise<NotificationPreference[]> {
    return Array.from(this.preferences.values()).filter(p => p.organizationId === organizationId);
  }

  async create(preference: NotificationPreference): Promise<NotificationPreference> {
    this.preferences.set(preference.id, preference);
    return { ...preference };
  }

  async update(id: string, data: Partial<NotificationPreference>): Promise<NotificationPreference> {
    const p = this.preferences.get(id);
    if (!p) throw new Error('Preference not found');
    Object.assign(p, data);
    p.updatedAt = new Date().toISOString();
    return { ...p };
  }

  async setEnabled(id: string, enabled: boolean): Promise<NotificationPreference> {
    return this.update(id, { enabled });
  }

  async setDigestFrequency(id: string, frequency: string): Promise<NotificationPreference> {
    return this.update(id, { digestFrequency: frequency as NotificationPreference['digestFrequency'] });
  }

  async setQuietHours(id: string, quietHours: NotificationPreference['quietHours']): Promise<NotificationPreference> {
    return this.update(id, { quietHours });
  }

  async delete(id: string): Promise<boolean> {
    return this.preferences.delete(id);
  }
}

export class InMemoryDeliveryRepository implements DeliveryRepository {
  private records: Map<string, DeliveryRecord> = new Map();

  async getById(id: string): Promise<DeliveryRecord | null> {
    return this.records.get(id) || null;
  }

  async getByNotification(notificationId: string): Promise<DeliveryRecord[]> {
    return Array.from(this.records.values()).filter(r => r.notificationId === notificationId);
  }

  async getByUser(userId: string): Promise<DeliveryRecord[]> {
    return Array.from(this.records.values()).filter(r => r.userId === userId);
  }

  async getByStatus(status: DeliveryRecord['status']): Promise<DeliveryRecord[]> {
    return Array.from(this.records.values()).filter(r => r.status === status);
  }

  async getPending(): Promise<DeliveryRecord[]> {
    return Array.from(this.records.values())
      .filter(r => r.status === 'queued' || r.status === 'retrying');
  }

  async getPaginated(params: {
    userId?: string; status?: DeliveryRecord['status']; channel?: NotificationChannel;
    page?: number; limit?: number;
  }): Promise<PaginatedDeliveryRecords> {
    let filtered = Array.from(this.records.values());
    if (params.userId) filtered = filtered.filter(r => r.userId === params.userId);
    if (params.status) filtered = filtered.filter(r => r.status === params.status);
    if (params.channel) filtered = filtered.filter(r => r.channel === params.channel);
    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return { data: filtered.slice(start, start + limit), total, page, limit, totalPages };
  }

  async create(data: Omit<DeliveryRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeliveryRecord> {
    const now = new Date().toISOString();
    const record: DeliveryRecord = { id: generateId(16), ...data, createdAt: now, updatedAt: now };
    this.records.set(record.id, record);
    return { ...record };
  }

  async updateStatus(id: string, status: DeliveryRecord['status'], error?: string): Promise<DeliveryRecord> {
    const r = this.records.get(id);
    if (!r) throw new Error('Delivery record not found');
    r.status = status;
    if (error) r.error = error;
    r.updatedAt = new Date().toISOString();
    return { ...r };
  }

  async incrementAttempt(id: string): Promise<DeliveryRecord> {
    const r = this.records.get(id);
    if (!r) throw new Error('Delivery record not found');
    r.attempts++;
    r.lastAttemptAt = new Date().toISOString();
    r.updatedAt = r.lastAttemptAt;
    return { ...r };
  }

  async markDelivered(id: string): Promise<DeliveryRecord> {
    const r = this.records.get(id);
    if (!r) throw new Error('Delivery record not found');
    r.status = 'delivered';
    r.deliveredAt = new Date().toISOString();
    r.updatedAt = r.deliveredAt;
    return { ...r };
  }

  async markFailed(id: string, error: string): Promise<DeliveryRecord> {
    const r = this.records.get(id);
    if (!r) throw new Error('Delivery record not found');
    r.status = 'failed';
    r.error = error;
    r.updatedAt = new Date().toISOString();
    return { ...r };
  }

  async delete(id: string): Promise<boolean> {
    return this.records.delete(id);
  }
}

export class InMemoryInboxRepository implements InboxRepository {
  private inbox: Map<string, InboxItem> = new Map();

  async getByUser(userId: string): Promise<InboxItem[]> {
    return Array.from(this.inbox.values())
      .filter(i => i.userId === userId && !i.isArchived)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getFiltered(userId: string, filter: InboxFilter): Promise<PaginatedInboxItems> {
    let items = Array.from(this.inbox.values()).filter(i => i.userId === userId);
    if (filter.categories) items = items.filter(i => filter.categories!.includes(i.category));
    if (filter.priorities) items = items.filter(i => filter.priorities!.includes(i.priority));
    if (filter.isRead !== undefined) items = items.filter(i => i.isRead === filter.isRead);
    if (filter.isArchived !== undefined) items = items.filter(i => i.isArchived === filter.isArchived);
    if (filter.search) {
      const s = filter.search.toLowerCase();
      items = items.filter(i => i.title.toLowerCase().includes(s) || i.body.toLowerCase().includes(s));
    }
    if (filter.source) items = items.filter(i => i.source === filter.source);
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return { data: items.slice(start, start + limit), total, page, limit, totalPages };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return Array.from(this.inbox.values())
      .filter(i => i.userId === userId && !i.isRead && !i.isArchived).length;
  }

  async getUnreadByCategory(userId: string): Promise<Record<NotificationCategory, number>> {
    const counts: Record<string, number> = {};
    for (const i of this.inbox.values()) {
      if (i.userId === userId && !i.isRead && !i.isArchived) {
        counts[i.category] = (counts[i.category] || 0) + 1;
      }
    }
    return counts as Record<NotificationCategory, number>;
  }

  async getUnreadByPriority(userId: string): Promise<Record<NotificationPriority, number>> {
    const counts: Record<string, number> = {};
    for (const i of this.inbox.values()) {
      if (i.userId === userId && !i.isRead && !i.isArchived) {
        counts[i.priority] = (counts[i.priority] || 0) + 1;
      }
    }
    return counts as Record<NotificationPriority, number>;
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const item = Array.from(this.inbox.values())
      .find(i => i.userId === userId && i.notificationId === notificationId);
    if (item) {
      item.isRead = true;
      item.readAt = new Date().toISOString();
    }
  }

  async markAllAsRead(userId: string): Promise<number> {
    let count = 0;
    for (const item of this.inbox.values()) {
      if (item.userId === userId && !item.isRead) {
        item.isRead = true;
        item.readAt = new Date().toISOString();
        count++;
      }
    }
    return count;
  }

  async archive(userId: string, notificationId: string): Promise<void> {
    const item = Array.from(this.inbox.values())
      .find(i => i.userId === userId && i.notificationId === notificationId);
    if (item) {
      item.isArchived = true;
      item.archivedAt = new Date().toISOString();
    }
  }

  async archiveAll(userId: string): Promise<number> {
    let count = 0;
    for (const item of this.inbox.values()) {
      if (item.userId === userId && !item.isArchived) {
        item.isArchived = true;
        item.archivedAt = new Date().toISOString();
        count++;
      }
    }
    return count;
  }

  async addToInbox(item: InboxItem): Promise<void> {
    this.inbox.set(item.id, item);
  }

  async removeFromInbox(userId: string, notificationId: string): Promise<boolean> {
    const item = Array.from(this.inbox.values())
      .find(i => i.userId === userId && i.notificationId === notificationId);
    if (!item) return false;
    return this.inbox.delete(item.id);
  }
}

export class InMemoryAuditRepository implements AuditRepository {
  private events: Map<string, NotificationAuditEvent> = new Map();

  async getByNotification(notificationId: string): Promise<NotificationAuditEvent[]> {
    return Array.from(this.events.values())
      .filter(e => e.notificationId === notificationId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getByUser(userId: string): Promise<NotificationAuditEvent[]> {
    return Array.from(this.events.values())
      .filter(e => e.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getByAction(action: string): Promise<NotificationAuditEvent[]> {
    return Array.from(this.events.values())
      .filter(e => e.action === action)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async create(data: Omit<NotificationAuditEvent, 'id' | 'timestamp'>): Promise<NotificationAuditEvent> {
    const event: NotificationAuditEvent = { id: generateId(16), ...data, timestamp: new Date().toISOString() };
    this.events.set(event.id, event);
    return { ...event };
  }

  async deleteOlderThan(date: string): Promise<number> {
    const toDelete = Array.from(this.events.values()).filter(e => new Date(e.timestamp) < new Date(date));
    for (const e of toDelete) this.events.delete(e.id);
    return toDelete.length;
  }
}