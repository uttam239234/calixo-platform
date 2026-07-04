/**
 * Calixo Platform - Worker Registry
 *
 * Auto-registration worker framework. Workers register themselves
 * and the registry manages lifecycle, concurrency, and dispatching.
 */

import { appLogger } from '@/logging';
import type { Job, WorkerDefinition, WorkerHandler, WorkerResult, WorkerHealth } from '@/background/types';

export class WorkerRegistry {
  private workers: Map<string, WorkerDefinition> = new Map();
  private handlers: Map<string, WorkerHandler> = new Map();
  private health: Map<string, WorkerHealth> = new Map();

  register(definition: WorkerDefinition, handler: WorkerHandler): void {
    if (this.workers.has(definition.name)) {
      appLogger.warn('WorkerRegistry', `Worker ${definition.name} already registered, skipping`);
      return;
    }

    this.workers.set(definition.name, definition);
    this.handlers.set(definition.name, handler);
    this.health.set(definition.name, {
      name: definition.name,
      isActive: true,
      runningJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      lastHeartbeat: new Date().toISOString(),
    });

    appLogger.info('WorkerRegistry', `Worker registered: ${definition.name} (handles: ${definition.handles.join(', ')})`);
  }

  unregister(name: string): void {
    this.workers.delete(name);
    this.handlers.delete(name);
    this.health.delete(name);
    appLogger.info('WorkerRegistry', `Worker unregistered: ${name}`);
  }

  getWorker(name: string): WorkerDefinition | undefined {
    return this.workers.get(name);
  }

  getHandler(name: string): WorkerHandler | undefined {
    return this.handlers.get(name);
  }

  getAllWorkers(): WorkerDefinition[] {
    return Array.from(this.workers.values());
  }

  getActiveWorkers(): WorkerDefinition[] {
    return Array.from(this.workers.values()).filter(w => w.isActive);
  }

  getWorkerHealth(): WorkerHealth[] {
    return Array.from(this.health.values());
  }

  getWorkerHealthByName(name: string): WorkerHealth | undefined {
    return this.health.get(name);
  }

  async dispatch(job: Job): Promise<WorkerResult> {
    const handler = this.handlers.get(job.worker);
    if (!handler) {
      return {
        success: false,
        error: {
          message: `No handler registered for worker: ${job.worker}`,
          category: 'permanent',
          timestamp: new Date().toISOString(),
        },
      };
    }

    const health = this.health.get(job.worker);
    if (health) {
      health.runningJobs++;
      health.lastHeartbeat = new Date().toISOString();
    }

    try {
      const result = await handler(job);
      if (health) {
        health.runningJobs--;
        if (result.success) {
          health.completedJobs++;
        } else {
          health.failedJobs++;
        }
      }
      return result;
    } catch (error) {
      if (health) {
        health.runningJobs--;
        health.failedJobs++;
      }
      return {
        success: false,
        error: {
          message: (error as Error).message,
          category: 'transient',
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  canHandle(workerName: string, jobType: string): boolean {
    const worker = this.workers.get(workerName);
    if (!worker) return false;
    return worker.handles.includes(jobType) || worker.handles.includes('*');
  }

  findWorkerForJob(job: Job): string | undefined {
    for (const [name, worker] of this.workers) {
      if (worker.handles.includes(job.type) || worker.handles.includes('*')) {
        return name;
      }
    }
    return undefined;
  }

  getWorkerCount(): number {
    return this.workers.size;
  }

  heartbeat(name: string): void {
    const health = this.health.get(name);
    if (health) {
      health.lastHeartbeat = new Date().toISOString();
    }
  }
}

export const workerRegistry = new WorkerRegistry();