/**
 * Calixo Platform - Execution Monitoring Platform
 *
 * Wraps `background`'s real `healthMonitor.getHealth()` (queue/worker/
 * scheduler/event-bus metrics — already genuine, not mocked) and adds the
 * execution-level aggregates (running/queued/retrying/failed/success-rate/
 * throughput) it didn't have, computed from `ExecutionEngine`'s own record
 * set rather than a second store.
 */
import { healthMonitor } from "@/background/health/HealthMonitor";
import { executionEngine } from "./ExecutionEngine";
import type { ExecutionAggregate, ExecutionMonitoringSnapshot, ExecutionRecord } from "./types";

export class ExecutionMonitoring {
  async getSnapshot(): Promise<ExecutionMonitoringSnapshot> {
    const health = await healthMonitor.getHealth();
    const executions = executionEngine.list({});
    return {
      isHealthy: health.isHealthy,
      queues: health.queues,
      workers: health.workers,
      scheduler: health.scheduler,
      eventBus: health.eventBus,
      executions: this.aggregate(executions),
      uptimeMs: health.uptime,
      checkedAt: health.lastCheck,
    };
  }

  private aggregate(executions: ExecutionRecord[]): ExecutionAggregate {
    const running = executions.filter(e => e.status === "running").length;
    const queued = executions.filter(e => e.status === "queued" || e.status === "created" || e.status === "waiting").length;
    const retrying = executions.filter(e => e.status === "retrying").length;
    const failed = executions.filter(e => e.status === "failed").length;
    const completed = executions.filter(e => e.status === "completed").length;
    const deadLettered = executions.filter(e => e.status === "dead_letter").length;

    const durations = executions.map(e => e.durationMs).filter((d): d is number => d !== undefined);
    const averageDurationMs = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

    const totalTerminal = completed + failed;
    const successRatePercent = totalTerminal > 0 ? Math.round((completed / totalTerminal) * 100) : 100;

    const now = Date.now();
    const throughputPerMinute = executions.filter(e => e.completedAt && now - new Date(e.completedAt).getTime() < 60_000).length;

    return { running, queued, retrying, failed, completed, deadLettered, successRatePercent, averageDurationMs, throughputPerMinute };
  }
}

export const executionMonitoring = new ExecutionMonitoring();
