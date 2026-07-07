/**
 * Calixo Platform - Enterprise Execution, Automation & Background Processing Platform Types
 *
 * This is the seventh major `core/platform` subpackage. It does NOT
 * reimplement queueing/worker-dispatch/scheduling — `src/background`
 * (QueueEngine, WorkerRegistry, SchedulerEngine, EventBus) already has real,
 * working mechanics for all three and is reused unmodified underneath every
 * type here. What was missing, and what this package adds, is the platform
 * layer on top: a canonical Execution model/lifecycle that every kind of
 * async work (queued/scheduled/recurring/pipeline/batch/child) maps onto, a
 * formal Retry Platform (`src/background`'s `RetryPolicy` was a single
 * hard-coded default, never a registry of named policies), an Execution
 * Policy layer (quotas/concurrency/windows — none existed), and an
 * Automation Platform that actually fires `Workflow.trigger`s (schedule/
 * event/condition) — previously stored as data on `background/types`'
 * `Workflow` but never evaluated by anything.
 */
import type {
  JobPriority,
  FailureCategory,
  QueueMetrics,
  WorkerHealth,
  SchedulerHealth,
  EventBusHealth,
} from "@/background/types";

// ============================================================================
// Execution Model (mandate section 2)
// ============================================================================

export type ExecutionKind =
  | "immediate"
  | "queued"
  | "scheduled"
  | "recurring"
  | "pipeline"
  | "batch"
  | "child"
  | "long_running";

/** The one lifecycle every Execution follows (mandate section 6), mapped onto `background`'s narrower `JobStatus`/`ExecutionStatus` — see `mapJobStatusToLifecycle` in ExecutionEngine.ts. */
export type ExecutionLifecycleStatus =
  | "created"
  | "queued"
  | "waiting"
  | "running"
  | "paused"
  | "retrying"
  | "completed"
  | "cancelled"
  | "timed_out"
  | "failed"
  | "dead_letter"
  | "archived";

/** A registered "Execution Type" — the Developer SDK's unit of registration, mirroring Phase 6's `ApiContractDefinition` pattern: define once, everything (submission, history, monitoring, policy) reads from the same definition. */
export interface ExecutionTypeDefinition {
  id: string;
  name: string;
  description: string;
  kind: ExecutionKind;
  worker: string;
  defaultPriority: JobPriority;
  defaultTimeoutMs: number;
  defaultMaxRetries: number;
  retryPolicyId?: string;
  tags: string[];
  owner: string;
  /** False marks a declared-but-not-implemented type (e.g. asset transcoding) — honesty flag surfaced by Documentation/Monitoring rather than silently pretending it runs. */
  isReal: boolean;
}

export interface SubmitExecutionRequest {
  executionTypeId?: string;
  name: string;
  worker: string;
  payload: Record<string, unknown>;
  kind?: ExecutionKind;
  priority?: JobPriority;
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
  /** Required when kind is "scheduled"; ignored otherwise. */
  scheduledAt?: string;
  parentExecutionId?: string;
  maxRetries?: number;
  retryPolicyId?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface ExecutionError {
  message: string;
  category: FailureCategory;
  timestamp: string;
}

/** The platform-level Execution record — one per submitted unit of work, wrapping the underlying `background` Job (queued/scheduled kinds) or standing alone (immediate kind, no Job created). */
export interface ExecutionRecord {
  id: string;
  jobId?: string;
  scheduleId?: string;
  executionTypeId?: string;
  kind: ExecutionKind;
  status: ExecutionLifecycleStatus;
  name: string;
  worker: string;
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
  parentExecutionId?: string;
  childExecutionIds: string[];
  priority: JobPriority;
  retryCount: number;
  maxRetries: number;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  error?: ExecutionError;
  result?: Record<string, unknown>;
  tags: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/** Passed to worker handlers registered via the Developer SDK — the "no direct execution" seam: a handler never reaches into the queue/scheduler itself, it just receives this and returns a result. */
export interface ExecutionContext {
  executionId: string;
  jobId?: string;
  attempt: number;
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
  payload: Record<string, unknown>;
}

// ============================================================================
// Retry Platform (mandate section 7)
// ============================================================================

export type BackoffStrategy = "fixed" | "linear" | "exponential";

export interface RetryPolicyDefinition {
  id: string;
  name: string;
  description: string;
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  strategy: BackoffStrategy;
  retryableCategories: FailureCategory[];
  /** Categories that abort immediately regardless of remaining attempts. */
  abortCategories: FailureCategory[];
}

// ============================================================================
// Execution Policies (mandate section 16)
// ============================================================================

export interface ExecutionWindow {
  startHour: number;
  endHour: number;
  timezone: string;
  businessDaysOnly: boolean;
}

export type PolicyScope = "global" | "organization" | "workspace";

export interface ExecutionPolicyDefinition {
  id: string;
  scope: PolicyScope;
  scopeId?: string;
  priority: JobPriority;
  timeoutMs: number;
  maxConcurrent: number;
  /** Executions allowed per rolling hour for this scope; enforced via the reused Phase 6 `RateLimiter`, not a second rate-limiting engine. */
  quotaPerHour?: number;
  executionWindow?: ExecutionWindow;
  cancellable: boolean;
}

export interface PolicyEvaluation {
  allowed: boolean;
  reason?: string;
  policy: ExecutionPolicyDefinition;
}

// ============================================================================
// Automation Platform (mandate section 8)
// ============================================================================

export type AutomationTriggerType =
  | "schedule"
  | "event"
  | "condition"
  | "workflow"
  | "connector"
  | "ai"
  | "notification"
  | "report"
  | "pipeline"
  | "manual";

export interface AutomationCondition {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "contains" | "exists";
  value: unknown;
}

export interface AutomationDefinition {
  id: string;
  name: string;
  description: string;
  triggerType: AutomationTriggerType;
  isActive: boolean;
  executionTypeId: string;
  payload: Record<string, unknown>;
  /** Set when triggerType === "schedule" — the underlying `background` Schedule id. */
  scheduleId?: string;
  /** Set when triggerType === "event" or "condition" — the platform/background event type being subscribed to. */
  eventType?: string;
  condition?: AutomationCondition;
  /** Set when triggerType === "workflow" — delegates to `background`'s real WorkflowEngine (the mandate's "Workflow Platform"); this Automation submits it as a tracked Execution rather than calling it inline. */
  workflowId?: string;
  organizationId?: string;
  workspaceId?: string;
  runCount: number;
  lastRunAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Execution Monitoring (mandate section 17)
// ============================================================================

export interface ExecutionAggregate {
  running: number;
  queued: number;
  retrying: number;
  failed: number;
  completed: number;
  deadLettered: number;
  successRatePercent: number;
  averageDurationMs: number;
  throughputPerMinute: number;
}

export interface ExecutionMonitoringSnapshot {
  isHealthy: boolean;
  queues: QueueMetrics[];
  workers: WorkerHealth[];
  scheduler: SchedulerHealth;
  eventBus: EventBusHealth;
  executions: ExecutionAggregate;
  uptimeMs: number;
  checkedAt: string;
}

export interface ExecutionHistoryEntry {
  executionId: string;
  status: ExecutionLifecycleStatus;
  worker: string;
  queue?: string;
  trigger: "manual" | "automation" | "api";
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  retryCount: number;
  result?: Record<string, unknown>;
  error?: ExecutionError;
}

