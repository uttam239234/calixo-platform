/**
 * Calixo Platform - Enterprise Communication & Notification Types
 *
 * Core types for the communication backbone of Calixo.
 * Supports in-app, email, Slack, Teams, webhook, push, and SMS channels.
 */

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationCategory =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'critical'
  | 'system'
  | 'marketing'
  | 'ai'
  | 'security';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type NotificationStatus =
  | 'pending'
  | 'delivered'
  | 'read'
  | 'archived'
  | 'deleted'
  | 'failed'
  | 'expired';

export type NotificationChannel =
  | 'in_app'
  | 'email'
  | 'slack'
  | 'teams'
  | 'webhook'
  | 'push'
  | 'sms';

export interface Notification {
  id: string;
  organizationId?: string;
  workspaceId?: string;
  userId: string;
  title: string;
  body: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  status: NotificationStatus;
  channel: NotificationChannel;
  templateId?: string;
  templateData?: Record<string, unknown>;
  actionUrl?: string;
  actionLabel?: string;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
  source: string;
  sourceId?: string;
  correlationId?: string;
  readAt?: string;
  deliveredAt?: string;
  archivedAt?: string;
  expiresAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationRequest {
  organizationId?: string;
  workspaceId?: string;
  userId: string;
  title: string;
  body: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  channel?: NotificationChannel;
  templateId?: string;
  templateData?: Record<string, unknown>;
  actionUrl?: string;
  actionLabel?: string;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
  source: string;
  sourceId?: string;
  correlationId?: string;
  expiresAt?: string;
}

// ============================================================================
// Notification Template Types
// ============================================================================

export interface NotificationTemplate {
  id: string;
  key: string;
  name: string;
  description?: string;
  category: NotificationCategory;
  titleTemplate: string;
  bodyTemplate: string;
  channels: NotificationChannel[];
  defaultPriority: NotificationPriority;
  actionUrlTemplate?: string;
  actionLabelTemplate?: string;
  variables: string[];
  isSystem: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateRenderRequest {
  templateId: string;
  data: Record<string, unknown>;
  userId: string;
  organizationId?: string;
  workspaceId?: string;
}

export interface RenderedNotification {
  title: string;
  body: string;
  actionUrl?: string;
  actionLabel?: string;
}

// ============================================================================
// Notification Preference Types
// ============================================================================

export interface NotificationPreference {
  id: string;
  userId: string;
  organizationId?: string;
  channel: NotificationChannel;
  enabled: boolean;
  categories: NotificationCategoryPreference[];
  quietHours?: QuietHours;
  digestFrequency: DigestFrequency;
  priorityRules: PriorityRule[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationCategoryPreference {
  category: NotificationCategory;
  enabled: boolean;
  channels: NotificationChannel[];
  minPriority: NotificationPriority;
}

export interface QuietHours {
  enabled: boolean;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  timezone: string;
  allowUrgent: boolean;
}

export type DigestFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'never';

export interface PriorityRule {
  priority: NotificationPriority;
  channels: NotificationChannel[];
  sound?: boolean;
  vibration?: boolean;
  showBanner?: boolean;
}

// ============================================================================
// Delivery Types
// ============================================================================

export type DeliveryStatus =
  | 'queued'
  | 'sending'
  | 'delivered'
  | 'failed'
  | 'retrying'
  | 'cancelled'
  | 'expired';

export interface DeliveryRecord {
  id: string;
  notificationId: string;
  userId: string;
  channel: NotificationChannel;
  status: DeliveryStatus;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: string;
  nextAttemptAt?: string;
  error?: string;
  deliveredAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Inbox Types
// ============================================================================

export interface InboxItem {
  id: string;
  notificationId: string;
  userId: string;
  organizationId?: string;
  workspaceId?: string;
  title: string;
  body: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  status: NotificationStatus;
  actionUrl?: string;
  actionLabel?: string;
  imageUrl?: string;
  source: string;
  sourceId?: string;
  correlationId?: string;
  isRead: boolean;
  isArchived: boolean;
  readAt?: string;
  deliveredAt?: string;
  archivedAt?: string;
  createdAt: string;
}

export interface InboxFilter {
  categories?: NotificationCategory[];
  priorities?: NotificationPriority[];
  status?: NotificationStatus;
  isRead?: boolean;
  isArchived?: boolean;
  search?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Channel Types
// ============================================================================

export interface ChannelConfig {
  channel: NotificationChannel;
  name: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface EmailChannelConfig extends ChannelConfig {
  config: {
    fromAddress: string;
    fromName: string;
    replyTo?: string;
    smtpHost?: string;
    smtpPort?: number;
    apiKey?: string;
  };
}

export interface SlackChannelConfig extends ChannelConfig {
  config: {
    webhookUrl?: string;
    botToken?: string;
    signingSecret?: string;
    defaultChannel: string;
  };
}

export interface TeamsChannelConfig extends ChannelConfig {
  config: {
    webhookUrl?: string;
    appId?: string;
    appPassword?: string;
    defaultChannel: string;
  };
}

// ============================================================================
// Real-time Types
// ============================================================================

export type RealtimeEventType =
  | 'notification.new'
  | 'notification.read'
  | 'notification.archived'
  | 'notification.deleted'
  | 'unread.count'
  | 'inbox.updated';

export interface RealtimeEvent {
  type: RealtimeEventType;
  userId: string;
  organizationId?: string;
  data: Record<string, unknown>;
  timestamp: string;
}

// ============================================================================
// Audit Types
// ============================================================================

export type NotificationAuditAction =
  | 'notification.created'
  | 'notification.delivered'
  | 'notification.read'
  | 'notification.archived'
  | 'notification.deleted'
  | 'notification.failed'
  | 'notification.retried'
  | 'notification.expired';

export interface NotificationAuditEvent {
  id: string;
  notificationId: string;
  userId: string;
  organizationId?: string;
  action: NotificationAuditAction;
  channel: NotificationChannel;
  status: NotificationStatus;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// ============================================================================
// Communication Hub Types
// ============================================================================

export interface CommunicationHubSummary {
  totalUnread: number;
  unreadByCategory: Record<NotificationCategory, number>;
  unreadByPriority: Record<NotificationPriority, number>;
  recentNotifications: InboxItem[];
  mentions: number;
  approvals: number;
  tasks: number;
  systemAlerts: number;
  aiAlerts: number;
  integrationAlerts: number;
}

// ============================================================================
// Paginated Responses
// ============================================================================

export interface PaginatedNotifications {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedInboxItems {
  data: InboxItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedTemplates {
  data: NotificationTemplate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedDeliveryRecords {
  data: DeliveryRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}