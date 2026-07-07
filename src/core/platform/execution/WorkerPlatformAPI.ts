/**
 * Calixo Platform - Worker Platform API
 *
 * Thin facade over `background`'s real `WorkerRegistry` (auto-registration,
 * concurrency, health, dispatch — already genuine).
 */
import { workerRegistry } from "@/background/workers/WorkerRegistry";
import type { WorkerDefinition, WorkerHandler, WorkerHealth } from "@/background/types";

export class WorkerPlatformAPI {
  register(definition: WorkerDefinition, handler: WorkerHandler): void {
    workerRegistry.register(definition, handler);
  }

  unregister(name: string): void {
    workerRegistry.unregister(name);
  }

  list(): WorkerDefinition[] {
    return workerRegistry.getAllWorkers();
  }

  listActive(): WorkerDefinition[] {
    return workerRegistry.getActiveWorkers();
  }

  getHealth(): WorkerHealth[] {
    return workerRegistry.getWorkerHealth();
  }

  heartbeat(name: string): void {
    workerRegistry.heartbeat(name);
  }

  count(): number {
    return workerRegistry.getWorkerCount();
  }
}

export const workerPlatformAPI = new WorkerPlatformAPI();
