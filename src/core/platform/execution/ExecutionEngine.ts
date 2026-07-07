/**
 * Calixo Platform - Execution Engine
 *
 * The orchestrator every kind of asynchronous work submits through. It does
 * not reimplement queueing or dispatch — `queueEngine.enqueue()` and
 * `workerRegistry.dispatch()` (both from `src/background`, real mechanics)
 * do that. What this adds: the platform-level `ExecutionRecord` (richer
 * lifecycle, policy/quota enforcement, parent/child tracking, retry-policy
 * awareness) and, critically, the one missing wire — `queueEngine` and
 * `workerRegistry` were two fully-built, never-connected engines (see
 * `wireQueueToWorkers()`); nothing ever called `queueEngine.start()` either,
 * so no job in this codebase's history had ever actually been processed
 * end-to-end. `initialize()` fixes both.
 */
import { generateId } from "@/shared/utils/string";
import { queueEngine } from "@/background/queue/QueueEngine";
import { workerRegistry } from "@/background/workers/WorkerRegistry";
import { eventBus } from "@/background/events/EventBus";
import type { Job, JobStatus, WorkerHandler } from "@/background/types";
import { platformEventBus } from "@/core/platform/events/PlatformEventBus";
import { executionRegistry } from "./ExecutionRegistry";
import { retryPolicyRegistry } from "./RetryPolicyRegistry";
import { executionPolicyEngine } from "./ExecutionPolicyEngine";
import type {
  ExecutionContext,
  ExecutionKind,
  ExecutionLifecycleStatus,
  ExecutionRecord,
  SubmitExecutionRequest,
} from "./types";

function mapJobStatusToLifecycle(status: JobStatus): ExecutionLifecycleStatus {
  switch (status) {
    case "created":
      return "created";
    case "queued":
      return "queued";
    case "scheduled":
      return "waiting";
    case "running":
      return "running";
    case "retrying":
      return "retrying";
    case "completed":
      return "completed";
    case "cancelled":
      return "cancelled";
    case "delayed":
      return "waiting";
    case "failed":
      return "failed";
    default:
      return "created";
  }
}

let wired = false;

export class ExecutionEngine {
  private records = new Map<string, ExecutionRecord>();
  private jobToExecution = new Map<string, string>();

  /**
   * Connects `queueEngine`'s processing loop to `workerRegistry`'s dispatch
   * table (they had no wiring to each other in `src/background`) and starts
   * the queue/event-bus/scheduler poll loops for the first time in this
   * app's history. Idempotent — safe to call from every request until the
   * server process that runs it first wins.
   */
  initialize(): void {
    if (wired) return;
    wired = true;

    const handler: WorkerHandler = async job => this.dispatchAndTrack(job);
    queueEngine.setWorkerHandler(async job => {
      const result = await handler(job);
      if (!result.success) {
        throw new Error(result.error?.message ?? `Worker ${job.worker} failed`);
      }
    });

    void queueEngine.start();
    void eventBus.start();
  }

  private async dispatchAndTrack(job: Job) {
    const executionId = this.jobToExecution.get(job.id);
    const record = executionId ? this.records.get(executionId) : undefined;
    if (record) {
      record.status = "running";
      record.startedAt = record.startedAt ?? new Date().toISOString();
      record.retryCount = job.retryCount;
      record.updatedAt = new Date().toISOString();
    }

    const result = await workerRegistry.dispatch(job);

    if (record) {
      if (result.success) {
        record.status = "completed";
        record.result = result.data;
        record.completedAt = new Date().toISOString();
        record.durationMs = record.startedAt ? new Date(record.completedAt).getTime() - new Date(record.startedAt).getTime() : undefined;
        void platformEventBus.publish({ type: "ExecutionCompleted", organizationId: record.organizationId, workspaceId: record.workspaceId, userId: record.userId, payload: { executionId: record.id, worker: record.worker } });
      } else {
        const willRetry = job.retryCount < job.maxRetries;
        record.status = willRetry ? "retrying" : (job.retryCount >= job.maxRetries ? "dead_letter" : "failed");
        record.error = result.error ? { message: result.error.message, category: result.error.category, timestamp: result.error.timestamp } : undefined;
        record.retryCount = job.retryCount;
        void platformEventBus.publish({
          type: willRetry ? "ExecutionRetried" : "ExecutionFailed",
          organizationId: record.organizationId,
          workspaceId: record.workspaceId,
          userId: record.userId,
          payload: { executionId: record.id, worker: record.worker, error: result.error?.message },
        });
      }
      record.updatedAt = new Date().toISOString();
    }

    return result;
  }

  /** Submits one unit of work. Covers every `ExecutionKind` except "recurring" — recurring work is a Schedule (see `SchedulerPlatformAPI`/`AutomationPlatformAPI`), not a single Execution. */
  async submit(request: SubmitExecutionRequest): Promise<ExecutionRecord> {
    if (request.kind === "recurring") {
      throw new Error('Recurring executions are created via SchedulerPlatformAPI.createRecurringExecution(), not ExecutionEngine.submit().');
    }

    const executionType = request.executionTypeId ? executionRegistry.get(request.executionTypeId) : undefined;
    const kind: ExecutionKind = request.kind ?? executionType?.kind ?? "queued";
    const priority = request.priority ?? executionType?.defaultPriority ?? "medium";
    const maxRetries = request.maxRetries ?? executionType?.defaultMaxRetries ?? retryPolicyRegistry.getOrDefault(request.retryPolicyId).maxRetries;

    const policyDecision = executionPolicyEngine.evaluate(request.organizationId, request.workspaceId);
    if (!policyDecision.allowed) {
      throw new Error(`Execution rejected by policy: ${policyDecision.reason}`);
    }

    const now = new Date().toISOString();
    const record: ExecutionRecord = {
      id: generateId(16),
      executionTypeId: request.executionTypeId,
      kind,
      status: "created",
      name: request.name,
      worker: request.worker,
      organizationId: request.organizationId,
      workspaceId: request.workspaceId,
      userId: request.userId,
      parentExecutionId: request.parentExecutionId,
      childExecutionIds: [],
      priority,
      retryCount: 0,
      maxRetries,
      tags: request.tags ?? [],
      metadata: request.metadata,
      createdAt: now,
      updatedAt: now,
    };
    this.records.set(record.id, record);

    if (request.parentExecutionId) {
      const parent = this.records.get(request.parentExecutionId);
      parent?.childExecutionIds.push(record.id);
    }

    if (kind === "immediate") {
      record.status = "running";
      record.startedAt = now;
      const job: Job = this.syntheticJob(record, request.payload);
      const result = await workerRegistry.dispatch(job);
      record.completedAt = new Date().toISOString();
      record.durationMs = new Date(record.completedAt).getTime() - new Date(record.startedAt).getTime();
      if (result.success) {
        record.status = "completed";
        record.result = result.data;
      } else {
        record.status = "failed";
        record.error = result.error ? { message: result.error.message, category: result.error.category, timestamp: result.error.timestamp } : undefined;
      }
      record.updatedAt = record.completedAt;
      void platformEventBus.publish({ type: record.status === "completed" ? "ExecutionCompleted" : "ExecutionFailed", organizationId: record.organizationId, workspaceId: record.workspaceId, userId: record.userId, payload: { executionId: record.id, worker: record.worker, error: result.error?.message } });
      return { ...record };
    }

    const job = await queueEngine.enqueue({
      type: kind === "scheduled" ? "scheduled" : kind === "batch" ? "batch" : kind === "long_running" ? "long_running" : "immediate",
      priority,
      name: request.name,
      worker: request.worker,
      payload: request.payload,
      organizationId: request.organizationId,
      workspaceId: request.workspaceId,
      userId: request.userId,
      scheduledAt: request.scheduledAt,
      maxRetries,
      tags: request.tags,
      metadata: request.metadata,
    });

    record.jobId = job.id;
    record.status = mapJobStatusToLifecycle(job.status);
    record.updatedAt = new Date().toISOString();
    this.jobToExecution.set(job.id, record.id);

    void platformEventBus.publish({ type: "ExecutionCreated", organizationId: record.organizationId, workspaceId: record.workspaceId, userId: record.userId, payload: { executionId: record.id, worker: record.worker, kind } });

    return { ...record };
  }

  private syntheticJob(record: ExecutionRecord, payload: Record<string, unknown>): Job {
    return {
      id: record.id,
      type: "immediate",
      status: "running",
      priority: record.priority,
      name: record.name,
      worker: record.worker,
      payload,
      organizationId: record.organizationId,
      workspaceId: record.workspaceId,
      userId: record.userId,
      retryCount: 0,
      maxRetries: record.maxRetries,
      retryDelay: 1000,
      backoffMultiplier: 2,
      tags: record.tags,
      isDeleted: false,
      createdAt: record.createdAt,
      updatedAt: record.createdAt,
    };
  }

  async cancel(executionId: string): Promise<ExecutionRecord | undefined> {
    const record = this.records.get(executionId);
    if (!record) return undefined;
    if (record.jobId) await queueEngine.cancel(record.jobId);
    record.status = "cancelled";
    record.completedAt = new Date().toISOString();
    record.updatedAt = record.completedAt;
    void platformEventBus.publish({ type: "ExecutionCancelled", organizationId: record.organizationId, workspaceId: record.workspaceId, userId: record.userId, payload: { executionId: record.id, worker: record.worker } });
    return { ...record };
  }

  async retry(executionId: string): Promise<ExecutionRecord | undefined> {
    const record = this.records.get(executionId);
    if (!record || !record.jobId) return undefined;
    const job = await queueEngine.retry(record.jobId);
    record.status = mapJobStatusToLifecycle(job.status);
    record.retryCount = job.retryCount;
    record.updatedAt = new Date().toISOString();
    return { ...record };
  }

  get(executionId: string): ExecutionRecord | undefined {
    const record = this.records.get(executionId);
    return record ? { ...record } : undefined;
  }

  buildContext(executionId: string, payload: Record<string, unknown>, attempt = 1): ExecutionContext {
    const record = this.records.get(executionId);
    return {
      executionId,
      jobId: record?.jobId,
      attempt,
      organizationId: record?.organizationId,
      workspaceId: record?.workspaceId,
      userId: record?.userId,
      payload,
    };
  }

  list(params: { organizationId?: string; status?: ExecutionLifecycleStatus; worker?: string } = {}): ExecutionRecord[] {
    return Array.from(this.records.values())
      .filter(r => !params.organizationId || r.organizationId === params.organizationId)
      .filter(r => !params.status || r.status === params.status)
      .filter(r => !params.worker || r.worker === params.worker)
      .map(r => ({ ...r }));
  }

  count(): number {
    return this.records.size;
  }
}

export const executionEngine = new ExecutionEngine();
