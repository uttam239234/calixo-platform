/**
 * Calixo Platform - Communication Repository Interfaces
 */

import type {
  Notification, CreateNotificationRequest, NotificationTemplate, NotificationPreference,
  DeliveryRecord, InboxItem, InboxFilter, NotificationAuditEvent, NotificationCategory,
  NotificationChannel, NotificationStatus, NotificationPriority,
  PaginatedNotifications, PaginatedInboxItems, PaginatedTemplates, PaginatedDeliveryRecords,
} from '@/communication/types';

export interface NotificationRepository {
  getById(id: string): Promise<Notification | null>;
  getByUser(userId: string): Promise<Notification[]>;
  getByOrganization(organizationId: string): Promise<Notification[]>;
  getByStatus(status: NotificationStatus): Promise<Notification[]>;
  getByCategory(category: NotificationCategory): Promise<Notification[]>;
  getBySource(source: string): Promise<Notification[]>;
  getUnreadByUser(userId: string): Promise<Notification[]>;
  getPaginated(params: {
    userId?: string; organizationId?: string; status?: NotificationStatus;
    category?: NotificationCategory; page?: number; limit?: number;
  }): Promise<PaginatedNotifications>;
  create(data: CreateNotificationRequest): Promise<Notification>;
  markAsRead(id: string): Promise<Notification>;
  markAsDelivered(id: string): Promise<Notification>;
  markAsArchived(id: string): Promise<Notification>;
  markAsFailed(id: string, error?: string): Promise<Notification>;
  markAsExpired(id: string): Promise<Notification>;
  delete(id: string): Promise<boolean>;
  getUnreadCount(userId: string): Promise<number>;
  getUnreadCountByCategory(userId: string): Promise<Record<NotificationCategory, number>>;
  deleteOlderThan(date: string): Promise<number>;
}

export interface TemplateRepository {
  getById(id: string): Promise<NotificationTemplate | null>;
  getByKey(key: string): Promise<NotificationTemplate | null>;
  getAll(): Promise<NotificationTemplate[]>;
  getByCategory(category: NotificationCategory): Promise<NotificationTemplate[]>;
  getPaginated(params: { page?: number; limit?: number; category?: NotificationCategory }): Promise<PaginatedTemplates>;
  create(template: NotificationTemplate): Promise<NotificationTemplate>;
  update(id: string, data: Partial<NotificationTemplate>): Promise<NotificationTemplate>;
  delete(id: string): Promise<boolean>;
}

export interface PreferenceRepository {
  getById(id: string): Promise<NotificationPreference | null>;
  getByUser(userId: string): Promise<NotificationPreference[]>;
  getByUserAndChannel(userId: string, channel: NotificationChannel): Promise<NotificationPreference | null>;
  getByOrganization(organizationId: string): Promise<NotificationPreference[]>;
  create(preference: NotificationPreference): Promise<NotificationPreference>;
  update(id: string, data: Partial<NotificationPreference>): Promise<NotificationPreference>;
  setEnabled(id: string, enabled: boolean): Promise<NotificationPreference>;
  setDigestFrequency(id: string, frequency: string): Promise<NotificationPreference>;
  setQuietHours(id: string, quietHours: NotificationPreference['quietHours']): Promise<NotificationPreference>;
  delete(id: string): Promise<boolean>;
}

export interface DeliveryRepository {
  getById(id: string): Promise<DeliveryRecord | null>;
  getByNotification(notificationId: string): Promise<DeliveryRecord[]>;
  getByUser(userId: string): Promise<DeliveryRecord[]>;
  getByStatus(status: DeliveryRecord['status']): Promise<DeliveryRecord[]>;
  getPending(): Promise<DeliveryRecord[]>;
  getPaginated(params: {
    userId?: string; status?: DeliveryRecord['status']; channel?: NotificationChannel;
    page?: number; limit?: number;
  }): Promise<PaginatedDeliveryRecords>;
  create(record: Omit<DeliveryRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeliveryRecord>;
  updateStatus(id: string, status: DeliveryRecord['status'], error?: string): Promise<DeliveryRecord>;
  incrementAttempt(id: string): Promise<DeliveryRecord>;
  markDelivered(id: string): Promise<DeliveryRecord>;
  markFailed(id: string, error: string): Promise<DeliveryRecord>;
  delete(id: string): Promise<boolean>;
}

export interface InboxRepository {
  getByUser(userId: string): Promise<InboxItem[]>;
  getFiltered(userId: string, filter: InboxFilter): Promise<PaginatedInboxItems>;
  getUnreadCount(userId: string): Promise<number>;
  getUnreadByCategory(userId: string): Promise<Record<NotificationCategory, number>>;
  getUnreadByPriority(userId: string): Promise<Record<NotificationPriority, number>>;
  markAsRead(userId: string, notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<number>;
  archive(userId: string, notificationId: string): Promise<void>;
  archiveAll(userId: string): Promise<number>;
  addToInbox(item: InboxItem): Promise<void>;
  removeFromInbox(userId: string, notificationId: string): Promise<boolean>;
}

export interface AuditRepository {
  getByNotification(notificationId: string): Promise<NotificationAuditEvent[]>;
  getByUser(userId: string): Promise<NotificationAuditEvent[]>;
  getByAction(action: string): Promise<NotificationAuditEvent[]>;
  create(event: Omit<NotificationAuditEvent, 'id' | 'timestamp'>): Promise<NotificationAuditEvent>;
  deleteOlderThan(date: string): Promise<number>;
}