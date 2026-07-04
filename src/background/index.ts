/**
 * Calixo Platform - Enterprise Background Processing Platform
 *
 * Central export for the entire Background Processing Platform.
 * This is the asynchronous execution engine for the entire platform.
 *
 * Architecture: Event-driven background processing supporting:
 * - Job Queue (priority, delayed, scheduled, recurring, retry, dead letter)
 * - Workers (auto-registration framework)
 * - Event Bus (publish/subscribe event-driven architecture)
 * - Scheduler (cron, daily, weekly, monthly, timezone-aware)
 * - Workflow Engine (triggers, conditions, actions, execution)
 * - Webhook Framework (incoming/outgoing with signature validation)
 * - Platform Health Monitoring
 */

// ============================================================================
// Types
// ============================================================================
export * from './types';

// ============================================================================
// Configuration
// ============================================================================
export * from './config/events';

// ============================================================================
// Repositories
// ============================================================================
export * from './repositories/interfaces';
export * from './repositories/implementations';

// ============================================================================
// Queue
// ============================================================================
export * from './queue/QueueEngine';

// ============================================================================
// Workers
// ============================================================================
export * from './workers/WorkerRegistry';

// ============================================================================
// Events
// ============================================================================
export * from './events/EventBus';

// ============================================================================
// Scheduler
// ============================================================================
export * from './scheduler/SchedulerEngine';

// ============================================================================
// Workflow
// ============================================================================
export * from './workflow/WorkflowEngine';

// ============================================================================
// Webhooks
// ============================================================================
export * from './webhooks/WebhookFramework';

// ============================================================================
// Health
// ============================================================================
export * from './health/HealthMonitor';

// ============================================================================
// Initialization
// ============================================================================

import { appLogger } from '@/logging';
import { queueEngine } from '@/background/queue/QueueEngine';
import { eventBus } from '@/background/events/EventBus';
import { schedulerEngine } from '@/background/scheduler/SchedulerEngine';
import { workerRegistry } from '@/background/workers/WorkerRegistry';
import type { WorkerDefinition, WorkerHandler } from '@/background/types';

/**
 * Initialize the background processing platform.
 * Starts the queue engine, event bus, and scheduler.
 */
export async function initializeBackgroundPlatform(): Promise<void> {
  appLogger.info('BackgroundPlatform', 'Initializing Enterprise Background Processing Platform...');

  // Register default workers
  registerDefaultWorkers();

  // Start queue processing
  queueEngine.setMaxConcurrent(10);
  queueEngine.setPollInterval(1000);
  await queueEngine.start();
  appLogger.info('BackgroundPlatform', 'Queue engine started');

  // Start event bus
  await eventBus.start();
  appLogger.info('BackgroundPlatform', 'Event bus started');

  // Start scheduler
  await schedulerEngine.start();
  appLogger.info('BackgroundPlatform', 'Scheduler started');

  appLogger.info('BackgroundPlatform', 'Enterprise Background Processing Platform initialized successfully');
}

/**
 * Register default workers for the platform.
 * Future workers should register themselves automatically.
 */
function registerDefaultWorkers(): void {
  const defaultWorkers: Array<{ definition: WorkerDefinition; handler: WorkerHandler }> = [
    {
      definition: {
        name: 'analytics',
        description: 'Processes analytics data and generates insights',
        module: 'analytics',
        version: '1.0.0',
        concurrency: 5,
        maxRetries: 3,
        timeout: 30000,
        handles: ['analytics.sync', 'analytics.export', 'analytics.report'],
        isActive: true,
      },
      handler: async (job) => {
        appLogger.debug('AnalyticsWorker', `Processing analytics job: ${job.name}`);
        return { success: true, data: { processed: true } };
      },
    },
    {
      definition: {
        name: 'ads',
        description: 'Manages ad campaign operations across platforms',
        module: 'ads',
        version: '1.0.0',
        concurrency: 5,
        maxRetries: 3,
        timeout: 60000,
        handles: ['ads.sync', 'ads.publish', 'ads.update', 'ads.analyze'],
        isActive: true,
      },
      handler: async (job) => {
        appLogger.debug('AdsWorker', `Processing ads job: ${job.name}`);
        return { success: true, data: { processed: true } };
      },
    },
    {
      definition: {
        name: 'social',
        description: 'Handles social media publishing and scheduling',
        module: 'social',
        version: '1.0.0',
        concurrency: 5,
        maxRetries: 3,
        timeout: 60000,
        handles: ['social.publish', 'social.schedule', 'social.sync'],
        isActive: true,
      },
      handler: async (job) => {
        appLogger.debug('SocialWorker', `Processing social job: ${job.name}`);
        return { success: true, data: { processed: true } };
      },
    },
    {
      definition: {
        name: 'content',
        description: 'Generates and processes content',
        module: 'content',
        version: '1.0.0',
        concurrency: 3,
        maxRetries: 2,
        timeout: 120000,
        handles: ['content.generate', 'content.process', 'content.analyze'],
        isActive: true,
      },
      handler: async (job) => {
        appLogger.debug('ContentWorker', `Processing content job: ${job.name}`);
        return { success: true, data: { processed: true } };
      },
    },
    {
      definition: {
        name: 'ai',
        description: 'Processes AI generation and training tasks',
        module: 'ai',
        version: '1.0.0',
        concurrency: 3,
        maxRetries: 2,
        timeout: 300000,
        handles: ['ai.generate', 'ai.train', 'ai.analyze', 'ai.insight'],
        isActive: true,
      },
      handler: async (job) => {
        appLogger.debug('AIWorker', `Processing AI job: ${job.name}`);
        return { success: true, data: { processed: true } };
      },
    },
    {
      definition: {
        name: 'notification',
        description: 'Sends notifications via email, push, and in-app',
        module: 'notifications',
        version: '1.0.0',
        concurrency: 10,
        maxRetries: 3,
        timeout: 30000,
        handles: ['notification.send', 'notification.batch', 'notification.digest'],
        isActive: true,
      },
      handler: async (job) => {
        appLogger.debug('NotificationWorker', `Processing notification job: ${job.name}`);
        return { success: true, data: { processed: true } };
      },
    },
    {
      definition: {
        name: 'report',
        description: 'Generates and exports reports',
        module: 'reports',
        version: '1.0.0',
        concurrency: 3,
        maxRetries: 3,
        timeout: 120000,
        handles: ['report.generate', 'report.export', 'report.schedule'],
        isActive: true,
      },
      handler: async (job) => {
        appLogger.debug('ReportWorker', `Processing report job: ${job.name}`);
        return { success: true, data: { processed: true } };
      },
    },
    {
      definition: {
        name: 'integration',
        description: 'Syncs data with external integrations',
        module: 'integrations',
        version: '1.0.0',
        concurrency: 5,
        maxRetries: 5,
        timeout: 120000,
        handles: ['integration.sync', 'integration.import', 'integration.export'],
        isActive: true,
      },
      handler: async (job) => {
        appLogger.debug('IntegrationWorker', `Processing integration job: ${job.name}`);
        return { success: true, data: { processed: true } };
      },
    },
    {
      definition: {
        name: 'webhook',
        description: 'Processes incoming and outgoing webhooks',
        module: 'webhooks',
        version: '1.0.0',
        concurrency: 10,
        maxRetries: 5,
        timeout: 30000,
        handles: ['webhook.deliver', 'webhook.process', 'webhook.retry'],
        isActive: true,
      },
      handler: async (job) => {
        appLogger.debug('WebhookWorker', `Processing webhook job: ${job.name}`);
        return { success: true, data: { processed: true } };
      },
    },
    {
      definition: {
        name: 'workflow',
        description: 'Executes workflow actions and retries',
        module: 'workflow',
        version: '1.0.0',
        concurrency: 5,
        maxRetries: 3,
        timeout: 60000,
        handles: ['workflow.execute', 'workflow.retry', 'workflow.action'],
        isActive: true,
      },
      handler: async (job) => {
        appLogger.debug('WorkflowWorker', `Processing workflow job: ${job.name}`);
        return { success: true, data: { processed: true } };
      },
    },
  ];

  for (const { definition, handler } of defaultWorkers) {
    workerRegistry.register(definition, handler);
  }

  appLogger.info('BackgroundPlatform', `Registered ${defaultWorkers.length} default workers`);
}

/**
 * Gracefully shutdown the background processing platform.
 */
export async function shutdownBackgroundPlatform(): Promise<void> {
  appLogger.info('BackgroundPlatform', 'Shutting down Enterprise Background Processing Platform...');

  schedulerEngine.stop();
  eventBus.stop();
  queueEngine.stop();

  appLogger.info('BackgroundPlatform', 'Enterprise Background Processing Platform shutdown complete');
}