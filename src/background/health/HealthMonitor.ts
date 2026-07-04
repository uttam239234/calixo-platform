/**
 * Calixo Platform - Platform Health Monitor
 *
 * Provides monitoring support for queue length, worker status,
 * running jobs, failed jobs, retry counts, and dead letter queues.
 * Future dashboard support.
 */

import { appLogger } from '@/logging';
import type { HealthStatus, QueueMetrics, WorkerHealth, SchedulerHealth, EventBusHealth } from '@/background/types';
import { queueEngine } from '@/background/queue/QueueEngine';
import { workerRegistry } from '@/background/workers/WorkerRegistry';
import { schedulerEngine } from '@/background/scheduler/SchedulerEngine';
import { eventBus } from '@/background/events/EventBus';

export class HealthMonitor {
  private startTime: number = Date.now();

  async getHealth(): Promise<HealthStatus> {
    const [queues, workers, scheduler, eventBusMetrics] = await Promise.all([
      this.getQueueHealth(),
      this.getWorkerHealth(),
      this.getSchedulerHealth(),
      this.getEventBusHealth(),
    ]);

    const isHealthy = this.evaluateHealth(queues, workers, scheduler, eventBusMetrics);

    return {
      isHealthy,
      queues,
      workers,
      scheduler,
      eventBus: eventBusMetrics,
      uptime: Date.now() - this.startTime,
      lastCheck: new Date().toISOString(),
    };
  }

  private async getQueueHealth(): Promise<QueueMetrics[]> {
    try {
      return await queueEngine.getMetrics();
    } catch (error) {
      appLogger.error('HealthMonitor', 'Failed to get queue metrics', error as Error);
      return [];
    }
  }

  private getWorkerHealth(): WorkerHealth[] {
    try {
      return workerRegistry.getWorkerHealth();
    } catch (error) {
      appLogger.error('HealthMonitor', 'Failed to get worker health', error as Error);
      return [];
    }
  }

  private async getSchedulerHealth(): Promise<SchedulerHealth> {
    try {
      const health = await schedulerEngine.getHealth();
      return {
        totalSchedules: health.totalSchedules,
        activeSchedules: health.activeSchedules,
        lastTick: health.lastTick,
        nextTick: health.nextTick,
      };
    } catch (error) {
      appLogger.error('HealthMonitor', 'Failed to get scheduler health', error as Error);
      return { totalSchedules: 0, activeSchedules: 0 };
    }
  }

  private async getEventBusHealth(): Promise<EventBusHealth> {
    try {
      const metrics = await eventBus.getMetrics();
      return {
        totalEvents: metrics.totalEvents,
        pendingEvents: metrics.pendingEvents,
        failedEvents: metrics.failedEvents,
        subscribers: metrics.subscribers,
      };
    } catch (error) {
      appLogger.error('HealthMonitor', 'Failed to get event bus health', error as Error);
      return { totalEvents: 0, pendingEvents: 0, failedEvents: 0, subscribers: 0 };
    }
  }

  private evaluateHealth(
    queues: QueueMetrics[],
    workers: WorkerHealth[],
    scheduler: SchedulerHealth,
    eventBus: EventBusHealth
  ): boolean {
    // Check for critical issues
    const deadLetterItems = queues.find(q => q.queueName === 'dead_letter');
    if (deadLetterItems && deadLetterItems.length > 100) {
      return false;
    }

    const failedEvents = eventBus.failedEvents;
    if (failedEvents > 100) {
      return false;
    }

    // Check if any workers are unhealthy
    const unhealthyWorkers = workers.filter(w => !w.isActive);
    if (unhealthyWorkers.length > 0) {
      return false;
    }

    return true;
  }

  getUptime(): number {
    return Date.now() - this.startTime;
  }

  getUptimeFormatted(): string {
    const uptime = this.getUptime();
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}

export const healthMonitor = new HealthMonitor();