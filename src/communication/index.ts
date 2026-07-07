/**
 * Calixo Platform - Enterprise Communication & Notification Platform
 *
 * Central export for the entire Communication Platform.
 * This is the communication backbone for every Calixo module.
 *
 * Architecture: Enterprise communication supporting:
 * - Notification Center (inbox, unread counter, read history, archived)
 * - Notification Channels (in-app, email, Slack, Teams, webhook, push, SMS)
 * - Notification Templates (reusable template architecture)
 * - Notification Preferences (per-user, quiet hours, digest, channels)
 * - Delivery Engine (queue, retry, failure handling, delivery status)
 * - Communication Hub (notifications, mentions, approvals, tasks, alerts)
 * - Real-time Framework (WebSocket/SSE abstraction)
 * - Audit Tracking (full lifecycle audit trail)
 * - Event Bus Integration (subscribes to all platform events)
 */

export * from './types';
export * from './config';
export * from './repositories';
export * from './services';
export * from './delivery';
export * from './inbox';
export * from './audit';
export { NotificationsPlatformAPI, notificationsPlatformAPI } from './platform/NotificationsPlatformAPI';

import { appLogger } from '@/logging';
import { notificationService } from '@/communication/services';
import { eventBus } from '@/background/events/EventBus';

/**
 * Initialize the communication platform.
 * Seeds notification templates and subscribes to platform events.
 */
export async function initializeCommunicationPlatform(): Promise<void> {
  appLogger.info('CommunicationPlatform', 'Initializing Enterprise Communication Platform...');

  // Initialize notification templates
  const templateCount = await notificationService.initializeTemplates();
  appLogger.info('CommunicationPlatform', `Initialized ${templateCount} notification templates`);

  // Subscribe to platform events
  subscribeToPlatformEvents();

  appLogger.info('CommunicationPlatform', 'Enterprise Communication Platform initialized successfully');
}

/**
 * Subscribe to platform events to automatically send notifications.
 * Every module's events are captured here.
 */
function subscribeToPlatformEvents(): void {
  // Campaign Events
  eventBus.registerHandler('campaign_notifier', async (event) => {
    if (event.type === 'campaign.created') {
      await notificationService.sendFromTemplate({
        templateKey: 'campaign.created',
        data: event.data as Record<string, unknown>,
        userId: event.userId || '',
        organizationId: event.organizationId,
        source: 'campaigns',
        sourceId: event.data.campaignId as string,
        correlationId: event.correlationId,
      });
    }
    if (event.type === 'campaign.published') {
      await notificationService.sendFromTemplate({
        templateKey: 'campaign.published',
        data: event.data as Record<string, unknown>,
        userId: event.userId || '',
        organizationId: event.organizationId,
        source: 'campaigns',
        sourceId: event.data.campaignId as string,
        correlationId: event.correlationId,
      });
    }
  });

  // Report Events
  eventBus.registerHandler('report_notifier', async (event) => {
    if (event.type === 'report.generated') {
      await notificationService.sendFromTemplate({
        templateKey: 'report.ready',
        data: event.data as Record<string, unknown>,
        userId: event.userId || '',
        organizationId: event.organizationId,
        source: 'reports',
        sourceId: event.data.reportId as string,
        correlationId: event.correlationId,
      });
    }
  });

  // AI Events
  eventBus.registerHandler('ai_notifier', async (event) => {
    if (event.type === 'ai.conversation.completed') {
      await notificationService.sendFromTemplate({
        templateKey: 'ai.completed',
        data: event.data as Record<string, unknown>,
        userId: event.userId || '',
        organizationId: event.organizationId,
        source: 'ai',
        sourceId: event.data.conversationId as string,
        correlationId: event.correlationId,
      });
    }
    if (event.type === 'ai.insight.generated') {
      await notificationService.sendFromTemplate({
        templateKey: 'ai.insight',
        data: event.data as Record<string, unknown>,
        userId: event.userId || '',
        organizationId: event.organizationId,
        source: 'ai',
        correlationId: event.correlationId,
      });
    }
  });

  // Integration Events
  eventBus.registerHandler('integration_notifier', async (event) => {
    if (event.type === 'integration.connected') {
      await notificationService.sendFromTemplate({
        templateKey: 'integration.connected',
        data: event.data as Record<string, unknown>,
        userId: event.userId || '',
        organizationId: event.organizationId,
        source: 'integrations',
        sourceId: event.data.integrationId as string,
        correlationId: event.correlationId,
      });
    }
    if (event.type === 'integration.error') {
      await notificationService.sendFromTemplate({
        templateKey: 'integration.failed',
        data: event.data as Record<string, unknown>,
        userId: event.userId || '',
        organizationId: event.organizationId,
        source: 'integrations',
        sourceId: event.data.integrationId as string,
        correlationId: event.correlationId,
      });
    }
  });

  // User Events
  eventBus.registerHandler('user_notifier', async (event) => {
    if (event.type === 'user.invited') {
      await notificationService.sendFromTemplate({
        templateKey: 'user.invited',
        data: event.data as Record<string, unknown>,
        userId: event.userId || '',
        organizationId: event.organizationId,
        source: 'users',
        sourceId: event.data.invitationId as string,
        correlationId: event.correlationId,
      });
    }
    if (event.type === 'role.assigned') {
      await notificationService.sendFromTemplate({
        templateKey: 'role.assigned',
        data: event.data as Record<string, unknown>,
        userId: event.userId || '',
        organizationId: event.organizationId,
        source: 'roles',
        correlationId: event.correlationId,
      });
    }
  });

  // Workspace Events
  eventBus.registerHandler('workspace_notifier', async (event) => {
    if (event.type === 'workspace.created') {
      await notificationService.sendFromTemplate({
        templateKey: 'workspace.created',
        data: event.data as Record<string, unknown>,
        userId: event.userId || '',
        organizationId: event.organizationId,
        source: 'workspaces',
        sourceId: event.data.workspaceId as string,
        correlationId: event.correlationId,
      });
    }
  });

  appLogger.info('CommunicationPlatform', 'Subscribed to platform events');
}