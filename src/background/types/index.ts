/**
 * Calixo Platform - Enterprise Background Processing Types
 *
 * Core types for the asynchronous execution engine.
 * Supports job queues, workers, events, workflows, scheduling, and webhooks.
 */

// ============================================================================
// Job Types
// ============================================================================

export type JobType =
  | 'immediate'
  | 'scheduled'
  | 'recurring'
  | 'long_running'
  | 'high_priority'
  | 'background'
  | 'batch';

export type JobStatus =
  | 'created'
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'retrying'
  | 'cancelled'
  | 'delayed'
  | 'scheduled';

export type JobPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Job {
  id: string;
  type: JobType;
  status: JobStatus;
  priority: JobPriority;
  name: string;
  worker: string;
  payload: Record<string, unknown>;
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  retryCount: number;
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  error?: JobError;
  metadata?: Record<string, unknown>;
  tags: string[];
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobError {
  message: string;
  code?: string;
  stack?: string;
  category: FailureCategory;
  timestamp: string;
}

export type FailureCategory = 'transient' | 'permanent' | 'timeout' | 'validation' | 'rate_limit' | 'unknown';

export interface CreateJobRequest {
  type: JobType;
  priority?: JobPriority;
  name: string;
  worker: string;
  payload: Record<string, unknown>;
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
  scheduledAt?: string;
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Queue Types
// ============================================================================

export type QueueName = 'default' | 'high_priority' | 'scheduled' | 'recurring' | 'batch' | 'dead_letter';

export interface QueueMetrics {
  queueName: QueueName;
  length: number;
  running: number;
  completed: number;
  failed: number;
  retrying: number;
  delayed: number;
  averageDuration?: number;
}

// ============================================================================
// Worker Types
// ============================================================================

export interface WorkerDefinition {
  name: string;
  description: string;
  module: string;
  version: string;
  concurrency: number;
  maxRetries: number;
  timeout: number;
  handles: string[];
  isActive: boolean;
}

export interface WorkerResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: JobError;
  metadata?: Record<string, unknown>;
}

export interface WorkerHandler {
  (job: Job): Promise<WorkerResult>;
}

// ============================================================================
// Event Types
// ============================================================================

export type EventStatus = 'pending' | 'published' | 'delivered' | 'failed' | 'cancelled';

export interface Event {
  id: string;
  type: string;
  source: string;
  subject?: string;
  data: Record<string, unknown>;
  dataSchema?: string;
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
  correlationId?: string;
  causationId?: string;
  status: EventStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
  publishedAt?: string;
}

export interface EventSubscriber {
  id: string;
  eventType: string;
  handler: string;
  description: string;
  isActive: boolean;
  priority: number;
  metadata?: Record<string, unknown>;
}

export interface EventHandler {
  (event: Event): Promise<void>;
}

// ============================================================================
// Schedule Types
// ============================================================================

export type ScheduleFrequency = 'cron' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Schedule {
  id: string;
  name: string;
  description?: string;
  frequency: ScheduleFrequency;
  cronExpression?: string;
  timezone: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  hour: number;
  minute: number;
  worker: string;
  payload: Record<string, unknown>;
  organizationId?: string;
  workspaceId?: string;
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleRequest {
  name: string;
  description?: string;
  frequency: ScheduleFrequency;
  cronExpression?: string;
  timezone?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  hour?: number;
  minute?: number;
  worker: string;
  payload: Record<string, unknown>;
  organizationId?: string;
  workspaceId?: string;
  isActive?: boolean;
}

// ============================================================================
// Workflow Types
// ============================================================================

export type WorkflowStatus = 'active' | 'paused' | 'draft' | 'archived' | 'error';

export type WorkflowTriggerType = 'event' | 'schedule' | 'webhook' | 'manual' | 'condition';

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  organizationId?: string;
  workspaceId?: string;
  isDeleted: boolean;
  deletedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTrigger {
  type: WorkflowTriggerType;
  config: Record<string, unknown>;
  eventType?: string;
  scheduleId?: string;
}

export interface WorkflowCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'exists';
  value: unknown;
}

export interface WorkflowAction {
  type: string;
  name: string;
  config: Record<string, unknown>;
  order: number;
  onFailure?: 'abort' | 'continue' | 'retry';
}

// ============================================================================
// Execution Types
// ============================================================================

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'retrying' | 'skipped';

export interface Execution {
  id: string;
  jobId?: string;
  workflowId?: string;
  worker: string;
  status: ExecutionStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: JobError;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  retryCount: number;
  maxRetries: number;
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  logs: ExecutionLog[];
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: Record<string, unknown>;
}

// ============================================================================
// Retry Policy
// ============================================================================

export interface RetryPolicy {
  maxRetries: number;
  initialDelay: number;
  backoffMultiplier: number;
  maxDelay: number;
  retryableCategories: FailureCategory[];
  timeout: number;
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxRetries: 3,
  initialDelay: 1000,
  backoffMultiplier: 2,
  maxDelay: 30000,
  retryableCategories: ['transient', 'timeout', 'rate_limit'],
  timeout: 30000,
};

// ============================================================================
// Webhook Types
// ============================================================================

export type WebhookDirection = 'incoming' | 'outgoing';

export interface Webhook {
  id: string;
  name: string;
  description?: string;
  direction: WebhookDirection;
  url?: string;
  secret?: string;
  events: string[];
  headers?: Record<string, string>;
  organizationId?: string;
  workspaceId?: string;
  isActive: boolean;
  lastTriggeredAt?: string;
  lastResponse?: WebhookResponse;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookResponse {
  statusCode: number;
  body?: string;
  headers?: Record<string, string>;
  duration: number;
  timestamp: string;
}

export interface IncomingWebhookPayload {
  headers: Record<string, string>;
  body: unknown;
  query: Record<string, string>;
  method: string;
  ip?: string;
}

// ============================================================================
// Health Types
// ============================================================================

export interface HealthStatus {
  isHealthy: boolean;
  queues: QueueMetrics[];
  workers: WorkerHealth[];
  scheduler: SchedulerHealth;
  eventBus: EventBusHealth;
  uptime: number;
  lastCheck: string;
}

export interface WorkerHealth {
  name: string;
  isActive: boolean;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageDuration?: number;
  lastHeartbeat?: string;
}

export interface SchedulerHealth {
  totalSchedules: number;
  activeSchedules: number;
  lastTick?: string;
  nextTick?: string;
}

export interface EventBusHealth {
  totalEvents: number;
  pendingEvents: number;
  failedEvents: number;
  subscribers: number;
}

// ============================================================================
// Paginated Responses
// ============================================================================

export interface PaginatedJobs {
  data: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedExecutions {
  data: Execution[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedEvents {
  data: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedSchedules {
  data: Schedule[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedWorkflows {
  data: Workflow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}