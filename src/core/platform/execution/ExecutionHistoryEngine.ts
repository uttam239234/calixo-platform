/**
 * Calixo Platform - Execution History Platform
 *
 * Wraps `ExecutionEngine`'s in-memory records (started/finished/duration/
 * retries/worker/organization/workspace/user/result — mandate section 9)
 * plus `queueEngine`'s dead-letter queue, rather than keeping a second copy
 * of job history.
 */
import { queueEngine } from "@/background/queue/QueueEngine";
import type { Job } from "@/background/types";
import { executionEngine } from "./ExecutionEngine";
import type { ExecutionHistoryEntry } from "./types";

export class ExecutionHistoryEngine {
  getTimeline(executionId: string): ExecutionHistoryEntry | undefined {
    const record = executionEngine.get(executionId);
    if (!record) return undefined;
    return {
      executionId: record.id,
      status: record.status,
      worker: record.worker,
      trigger: record.tags.includes("automation") ? "automation" : "manual",
      organizationId: record.organizationId,
      workspaceId: record.workspaceId,
      userId: record.userId,
      startedAt: record.startedAt,
      completedAt: record.completedAt,
      durationMs: record.durationMs,
      retryCount: record.retryCount,
      result: record.result,
      error: record.error,
    };
  }

  listByOrganization(organizationId: string): ExecutionHistoryEntry[] {
    return executionEngine
      .list({ organizationId })
      .map(r => this.getTimeline(r.id))
      .filter((entry): entry is ExecutionHistoryEntry => entry !== undefined);
  }

  getRecentFailures(limit = 20): ExecutionHistoryEntry[] {
    return executionEngine
      .list({})
      .filter(r => r.status === "failed" || r.status === "dead_letter")
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, limit)
      .map(r => this.getTimeline(r.id))
      .filter((entry): entry is ExecutionHistoryEntry => entry !== undefined);
  }

  async getDeadLetter(): Promise<Job[]> {
    return queueEngine.getDeadLetterJobs();
  }

  async requeueDeadLetter(jobId: string): Promise<Job> {
    return queueEngine.requeueDeadLetter(jobId);
  }

  count(): number {
    return executionEngine.count();
  }
}

export const executionHistoryEngine = new ExecutionHistoryEngine();
