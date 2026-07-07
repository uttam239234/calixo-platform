/**
 * Calixo Platform - Background Processing Repository Implementations
 *
 * In-memory implementations. Replace with Prisma-based implementations for production.
 */

import { generateId } from '@/shared/utils/string';
import { appLogger } from '@/logging';
import type {
  Job, CreateJobRequest, Execution, ExecutionLog, Event, EventSubscriber,
  Schedule, Workflow, Webhook, JobStatus, JobPriority, QueueName,
  PaginatedJobs, PaginatedExecutions, PaginatedEvents, PaginatedSchedules, PaginatedWorkflows,
} from '@/background/types';
import { DEFAULT_RETRY_POLICY } from '@/background/types';
import type {
  JobRepository, ExecutionRepository, EventRepository, EventSubscriberRepository,
  ScheduleRepository, WorkflowRepository, WebhookRepository,
} from './interfaces';

// ============================================================================
// In-Memory Job Repository
// ============================================================================

export class InMemoryJobRepository implements JobRepository {
  private jobs: Map<string, Job> = new Map();

  async getById(id: string): Promise<Job | null> {
    return this.jobs.get(id) || null;
  }

  async getByOrganization(organizationId: string): Promise<Job[]> {
    return Array.from(this.jobs.values())
      .filter(j => j.organizationId === organizationId && !j.isDeleted);
  }

  async getByWorker(worker: string): Promise<Job[]> {
    return Array.from(this.jobs.values())
      .filter(j => j.worker === worker && !j.isDeleted);
  }

  async getByStatus(status: JobStatus): Promise<Job[]> {
    return Array.from(this.jobs.values())
      .filter(j => j.status === status && !j.isDeleted);
  }

  async getByQueue(queue: QueueName): Promise<Job[]> {
    return Array.from(this.jobs.values())
      .filter(j => !j.isDeleted)
      .filter(j => this.getQueueForJob(j) === queue);
  }

  async getNextDue(limit: number = 10): Promise<Job[]> {
    const now = new Date().toISOString();
    // Also picks up 'scheduled' (future-dated on creation) and 'retrying' (backed off after a
    // failure) jobs once their `scheduledAt` arrives — previously only 'queued' was matched here,
    // so `updateScheduledAt`/`incrementRetry` (which both set status to 'scheduled'/'retrying')
    // left jobs permanently stuck: nothing ever transitioned them back to 'queued', so scheduled
    // jobs and retries never actually ran. Found via the Enterprise Execution Platform audit.
    return Array.from(this.jobs.values())
      .filter(j => !j.isDeleted && (j.status === 'queued' || j.status === 'scheduled' || j.status === 'retrying') && (!j.scheduledAt || j.scheduledAt <= now))
      .sort((a, b) => {
        const priorityOrder: Record<JobPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        const pDiff = (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
        if (pDiff !== 0) return pDiff;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      })
      .slice(0, limit);
  }

  async getDeadLetterJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values())
      .filter(j => !j.isDeleted && j.status === 'failed' && j.retryCount >= j.maxRetries);
  }

  async getPaginated(params: {
    organizationId?: string; status?: JobStatus; worker?: string;
    page?: number; limit?: number; search?: string;
  }): Promise<PaginatedJobs> {
    let filtered = Array.from(this.jobs.values()).filter(j => !j.isDeleted);
    if (params.organizationId) filtered = filtered.filter(j => j.organizationId === params.organizationId);
    if (params.status) filtered = filtered.filter(j => j.status === params.status);
    if (params.worker) filtered = filtered.filter(j => j.worker === params.worker);
    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(j => j.name.toLowerCase().includes(s));
    }
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return { data: filtered.slice(start, start + limit), total, page, limit, totalPages };
  }

  async create(data: CreateJobRequest): Promise<Job> {
    const now = new Date().toISOString();
    const job: Job = {
      id: generateId(16),
      type: data.type,
      status: data.scheduledAt ? 'scheduled' : 'queued',
      priority: data.priority || 'medium',
      name: data.name,
      worker: data.worker,
      payload: data.payload,
      organizationId: data.organizationId,
      workspaceId: data.workspaceId,
      userId: data.userId,
      scheduledAt: data.scheduledAt,
      retryCount: 0,
      maxRetries: data.maxRetries ?? DEFAULT_RETRY_POLICY.maxRetries,
      retryDelay: data.retryDelay ?? DEFAULT_RETRY_POLICY.initialDelay,
      backoffMultiplier: data.backoffMultiplier ?? DEFAULT_RETRY_POLICY.backoffMultiplier,
      tags: data.tags || [],
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
    this.jobs.set(job.id, job);
    appLogger.debug('JobRepository', `Job created: ${job.name} (${job.id})`);
    return { ...job };
  }

  async updateStatus(id: string, status: JobStatus): Promise<Job> {
    const job = this.jobs.get(id);
    if (!job) throw new Error('Job not found');
    job.status = status;
    job.updatedAt = new Date().toISOString();
    if (status === 'running') job.startedAt = job.updatedAt;
    if (status === 'completed') {
      job.completedAt = job.updatedAt;
      if (job.startedAt) job.duration = new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime();
    }
    this.jobs.set(id, job);
    return { ...job };
  }

  async markRunning(id: string): Promise<Job> {
    return this.updateStatus(id, 'running');
  }

  async markCompleted(id: string, duration?: number): Promise<Job> {
    const job = this.jobs.get(id);
    if (!job) throw new Error('Job not found');
    job.status = 'completed';
    job.completedAt = new Date().toISOString();
    if (job.startedAt) job.duration = duration || (new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime());
    job.updatedAt = job.completedAt;
    this.jobs.set(id, job);
    return { ...job };
  }

  async markFailed(id: string, error: Job['error']): Promise<Job> {
    const job = this.jobs.get(id);
    if (!job) throw new Error('Job not found');
    job.status = 'failed';
    job.error = error;
    job.updatedAt = new Date().toISOString();
    this.jobs.set(id, job);
    return { ...job };
  }

  async markRetrying(id: string, error: Job['error']): Promise<Job> {
    const job = this.jobs.get(id);
    if (!job) throw new Error('Job not found');
    job.status = 'retrying';
    job.error = error;
    job.updatedAt = new Date().toISOString();
    this.jobs.set(id, job);
    return { ...job };
  }

  async markCancelled(id: string): Promise<Job> {
    return this.updateStatus(id, 'cancelled');
  }

  async incrementRetry(id: string): Promise<Job> {
    const job = this.jobs.get(id);
    if (!job) throw new Error('Job not found');
    job.retryCount++;
    job.retryDelay = Math.min(job.retryDelay * job.backoffMultiplier, 30000);
    job.status = 'retrying';
    job.updatedAt = new Date().toISOString();

    // Calculate next retry time
    const nextRetry = new Date(Date.now() + job.retryDelay).toISOString();
    job.scheduledAt = nextRetry;
    this.jobs.set(id, job);
    return { ...job };
  }

  async updateScheduledAt(id: string, scheduledAt: string): Promise<Job> {
    const job = this.jobs.get(id);
    if (!job) throw new Error('Job not found');
    job.scheduledAt = scheduledAt;
    job.status = 'scheduled';
    job.updatedAt = new Date().toISOString();
    this.jobs.set(id, job);
    return { ...job };
  }

  async delete(id: string): Promise<boolean> {
    const job = this.jobs.get(id);
    if (!job) return false;
    job.isDeleted = true;
    job.deletedAt = new Date().toISOString();
    return true;
  }

  async countByStatus(status: JobStatus): Promise<number> {
    return Array.from(this.jobs.values())
      .filter(j => j.status === status && !j.isDeleted).length;
  }

  async countByQueue(queue: QueueName): Promise<number> {
    return Array.from(this.jobs.values())
      .filter(j => !j.isDeleted && this.getQueueForJob(j) === queue).length;
  }

  async getQueueMetrics(): Promise<Record<QueueName, number>> {
    const metrics: Record<string, number> = {
      default: 0, high_priority: 0, scheduled: 0, recurring: 0, batch: 0, dead_letter: 0,
    };
    for (const job of this.jobs.values()) {
      if (!job.isDeleted) {
        const queue = this.getQueueForJob(job);
        metrics[queue] = (metrics[queue] || 0) + 1;
      }
    }
    return metrics as Record<QueueName, number>;
  }

  private getQueueForJob(job: Job): QueueName {
    if (job.status === 'failed' && job.retryCount >= job.maxRetries) return 'dead_letter';
    if (job.type === 'high_priority') return 'high_priority';
    if (job.type === 'scheduled') return 'scheduled';
    if (job.type === 'recurring') return 'recurring';
    if (job.type === 'batch') return 'batch';
    return 'default';
  }
}

// ============================================================================
// In-Memory Execution Repository
// ============================================================================

export class InMemoryExecutionRepository implements ExecutionRepository {
  private executions: Map<string, Execution> = new Map();

  async getById(id: string): Promise<Execution | null> {
    return this.executions.get(id) || null;
  }

  async getByJob(jobId: string): Promise<Execution[]> {
    return Array.from(this.executions.values())
      .filter(e => e.jobId === jobId);
  }

  async getByWorkflow(workflowId: string): Promise<Execution[]> {
    return Array.from(this.executions.values())
      .filter(e => e.workflowId === workflowId);
  }

  async getByWorker(worker: string): Promise<Execution[]> {
    return Array.from(this.executions.values())
      .filter(e => e.worker === worker);
  }

  async getByStatus(status: Execution['status']): Promise<Execution[]> {
    return Array.from(this.executions.values())
      .filter(e => e.status === status);
  }

  async getPaginated(params: {
    organizationId?: string; status?: Execution['status']; worker?: string;
    page?: number; limit?: number;
  }): Promise<PaginatedExecutions> {
    let filtered = Array.from(this.executions.values());
    if (params.organizationId) filtered = filtered.filter(e => e.organizationId === params.organizationId);
    if (params.status) filtered = filtered.filter(e => e.status === params.status);
    if (params.worker) filtered = filtered.filter(e => e.worker === params.worker);
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return { data: filtered.slice(start, start + limit), total, page, limit, totalPages };
  }

  async create(data: Omit<Execution, 'id' | 'createdAt' | 'updatedAt' | 'logs'>): Promise<Execution> {
    const now = new Date().toISOString();
    const execution: Execution = {
      ...data,
      id: generateId(16),
      logs: [],
      createdAt: now,
      updatedAt: now,
    };
    this.executions.set(execution.id, execution);
    return { ...execution };
  }

  async updateStatus(id: string, status: Execution['status']): Promise<Execution> {
    const exec = this.executions.get(id);
    if (!exec) throw new Error('Execution not found');
    exec.status = status;
    exec.updatedAt = new Date().toISOString();
    if (status === 'running') exec.startedAt = exec.updatedAt;
    this.executions.set(id, exec);
    return { ...exec };
  }

  async complete(id: string, output: Record<string, unknown>, duration: number): Promise<Execution> {
    const exec = this.executions.get(id);
    if (!exec) throw new Error('Execution not found');
    exec.status = 'completed';
    exec.output = output;
    exec.duration = duration;
    exec.completedAt = new Date().toISOString();
    exec.updatedAt = exec.completedAt;
    this.executions.set(id, exec);
    return { ...exec };
  }

  async fail(id: string, error: Job['error']): Promise<Execution> {
    const exec = this.executions.get(id);
    if (!exec) throw new Error('Execution not found');
    exec.status = 'failed';
    exec.error = error;
    exec.updatedAt = new Date().toISOString();
    this.executions.set(id, exec);
    return { ...exec };
  }

  async addLog(id: string, log: ExecutionLog): Promise<Execution> {
    const exec = this.executions.get(id);
    if (!exec) throw new Error('Execution not found');
    exec.logs.push(log);
    exec.updatedAt = new Date().toISOString();
    this.executions.set(id, exec);
    return { ...exec };
  }

  async delete(id: string): Promise<boolean> {
    return this.executions.delete(id);
  }

  async countByStatus(status: Execution['status']): Promise<number> {
    return Array.from(this.executions.values())
      .filter(e => e.status === status).length;
  }

  async getAverageDuration(worker: string): Promise<number> {
    const execs = Array.from(this.executions.values())
      .filter(e => e.worker === worker && e.status === 'completed' && e.duration !== undefined);
    if (execs.length === 0) return 0;
    const total = execs.reduce((sum, e) => sum + (e.duration || 0), 0);
    return total / execs.length;
  }
}

// ============================================================================
// In-Memory Event Repository
// ============================================================================

export class InMemoryEventRepository implements EventRepository {
  private events: Map<string, Event> = new Map();

  async getById(id: string): Promise<Event | null> {
    return this.events.get(id) || null;
  }

  async getByType(type: string): Promise<Event[]> {
    return Array.from(this.events.values())
      .filter(e => e.type === type);
  }

  async getByStatus(status: Event['status']): Promise<Event[]> {
    return Array.from(this.events.values())
      .filter(e => e.status === status);
  }

  async getByCorrelationId(correlationId: string): Promise<Event[]> {
    return Array.from(this.events.values())
      .filter(e => e.correlationId === correlationId);
  }

  async getPaginated(params: {
    organizationId?: string; type?: string; status?: Event['status'];
    page?: number; limit?: number;
  }): Promise<PaginatedEvents> {
    let filtered = Array.from(this.events.values());
    if (params.organizationId) filtered = filtered.filter(e => e.organizationId === params.organizationId);
    if (params.type) filtered = filtered.filter(e => e.type === params.type);
    if (params.status) filtered = filtered.filter(e => e.status === params.status);
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return { data: filtered.slice(start, start + limit), total, page, limit, totalPages };
  }

  async create(data: Omit<Event, 'id' | 'createdAt' | 'publishedAt'>): Promise<Event> {
    const event: Event = {
      ...data,
      id: generateId(16),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.events.set(event.id, event);
    return { ...event };
  }

  async markPublished(id: string): Promise<Event> {
    const event = this.events.get(id);
    if (!event) throw new Error('Event not found');
    event.status = 'published';
    event.publishedAt = new Date().toISOString();
    this.events.set(id, event);
    return { ...event };
  }

  async markDelivered(id: string): Promise<Event> {
    const event = this.events.get(id);
    if (!event) throw new Error('Event not found');
    event.status = 'delivered';
    this.events.set(id, event);
    return { ...event };
  }

  async markFailed(id: string): Promise<Event> {
    const event = this.events.get(id);
    if (!event) throw new Error('Event not found');
    event.status = 'failed';
    this.events.set(id, event);
    return { ...event };
  }

  async deleteOlderThan(date: string): Promise<number> {
    const toDelete = Array.from(this.events.values())
      .filter(e => new Date(e.createdAt) < new Date(date));
    for (const e of toDelete) this.events.delete(e.id);
    return toDelete.length;
  }

  async countByStatus(status: Event['status']): Promise<number> {
    return Array.from(this.events.values()).filter(e => e.status === status).length;
  }
}

// ============================================================================
// In-Memory Event Subscriber Repository
// ============================================================================

export class InMemoryEventSubscriberRepository implements EventSubscriberRepository {
  private subscribers: Map<string, EventSubscriber> = new Map();

  async getById(id: string): Promise<EventSubscriber | null> {
    return this.subscribers.get(id) || null;
  }

  async getByEventType(eventType: string): Promise<EventSubscriber[]> {
    return Array.from(this.subscribers.values())
      .filter(s => s.eventType === eventType && s.isActive)
      .sort((a, b) => a.priority - b.priority);
  }

  async getAll(): Promise<EventSubscriber[]> {
    return Array.from(this.subscribers.values());
  }

  async getActive(): Promise<EventSubscriber[]> {
    return Array.from(this.subscribers.values()).filter(s => s.isActive);
  }

  async create(data: Omit<EventSubscriber, 'id'>): Promise<EventSubscriber> {
    const sub: EventSubscriber = { id: generateId(16), ...data };
    this.subscribers.set(sub.id, sub);
    return { ...sub };
  }

  async update(id: string, data: Partial<EventSubscriber>): Promise<EventSubscriber> {
    const sub = this.subscribers.get(id);
    if (!sub) throw new Error('Subscriber not found');
    Object.assign(sub, data);
    return { ...sub };
  }

  async activate(id: string): Promise<EventSubscriber> {
    return this.update(id, { isActive: true });
  }

  async deactivate(id: string): Promise<EventSubscriber> {
    return this.update(id, { isActive: false });
  }

  async delete(id: string): Promise<boolean> {
    return this.subscribers.delete(id);
  }
}

// ============================================================================
// In-Memory Schedule Repository
// ============================================================================

export class InMemoryScheduleRepository implements ScheduleRepository {
  private schedules: Map<string, Schedule> = new Map();

  async getById(id: string): Promise<Schedule | null> {
    return this.schedules.get(id) || null;
  }

  async getAll(): Promise<Schedule[]> {
    return Array.from(this.schedules.values());
  }

  async getActive(): Promise<Schedule[]> {
    return Array.from(this.schedules.values()).filter(s => s.isActive);
  }

  async getByWorker(worker: string): Promise<Schedule[]> {
    return Array.from(this.schedules.values()).filter(s => s.worker === worker);
  }

  async getByOrganization(organizationId: string): Promise<Schedule[]> {
    return Array.from(this.schedules.values()).filter(s => s.organizationId === organizationId);
  }

  async getDue(now: string): Promise<Schedule[]> {
    return Array.from(this.schedules.values())
      .filter(s => s.isActive && (!s.nextRunAt || s.nextRunAt <= now));
  }

  async getPaginated(params: {
    organizationId?: string; page?: number; limit?: number; isActive?: boolean;
  }): Promise<PaginatedSchedules> {
    let filtered = Array.from(this.schedules.values());
    if (params.organizationId) filtered = filtered.filter(s => s.organizationId === params.organizationId);
    if (params.isActive !== undefined) filtered = filtered.filter(s => s.isActive === params.isActive);
    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return { data: filtered.slice(start, start + limit), total, page, limit, totalPages };
  }

  async create(data: Schedule): Promise<Schedule> {
    this.schedules.set(data.id, data);
    return { ...data };
  }

  async update(id: string, data: Partial<Schedule>): Promise<Schedule> {
    const sched = this.schedules.get(id);
    if (!sched) throw new Error('Schedule not found');
    Object.assign(sched, data);
    sched.updatedAt = new Date().toISOString();
    return { ...sched };
  }

  async activate(id: string): Promise<Schedule> {
    return this.update(id, { isActive: true });
  }

  async deactivate(id: string): Promise<Schedule> {
    return this.update(id, { isActive: false });
  }

  async updateLastRun(id: string, lastRunAt: string, nextRunAt: string): Promise<Schedule> {
    const sched = this.schedules.get(id);
    if (!sched) throw new Error('Schedule not found');
    sched.lastRunAt = lastRunAt;
    sched.nextRunAt = nextRunAt;
    sched.updatedAt = new Date().toISOString();
    return { ...sched };
  }

  async delete(id: string): Promise<boolean> {
    return this.schedules.delete(id);
  }

  async countActive(): Promise<number> {
    return Array.from(this.schedules.values()).filter(s => s.isActive).length;
  }
}

// ============================================================================
// In-Memory Workflow Repository
// ============================================================================

export class InMemoryWorkflowRepository implements WorkflowRepository {
  private workflows: Map<string, Workflow> = new Map();

  async getById(id: string): Promise<Workflow | null> {
    return this.workflows.get(id) || null;
  }

  async getAll(): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter(w => !w.isDeleted);
  }

  async getByStatus(status: Workflow['status']): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter(w => w.status === status && !w.isDeleted);
  }

  async getByOrganization(organizationId: string): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter(w => w.organizationId === organizationId && !w.isDeleted);
  }

  async getByTriggerType(triggerType: Workflow['trigger']['type']): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter(w => w.trigger.type === triggerType && !w.isDeleted);
  }

  async getPaginated(params: {
    organizationId?: string; status?: Workflow['status']; page?: number; limit?: number;
  }): Promise<PaginatedWorkflows> {
    let filtered = Array.from(this.workflows.values()).filter(w => !w.isDeleted);
    if (params.organizationId) filtered = filtered.filter(w => w.organizationId === params.organizationId);
    if (params.status) filtered = filtered.filter(w => w.status === params.status);
    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return { data: filtered.slice(start, start + limit), total, page, limit, totalPages };
  }

  async create(data: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow> {
    const now = new Date().toISOString();
    const workflow: Workflow = { id: generateId(16), ...data, createdAt: now, updatedAt: now };
    this.workflows.set(workflow.id, workflow);
    return { ...workflow };
  }

  async update(id: string, data: Partial<Workflow>): Promise<Workflow> {
    const wf = this.workflows.get(id);
    if (!wf) throw new Error('Workflow not found');
    Object.assign(wf, data);
    wf.updatedAt = new Date().toISOString();
    return { ...wf };
  }

  async activate(id: string): Promise<Workflow> { return this.update(id, { status: 'active' }); }
  async pause(id: string): Promise<Workflow> { return this.update(id, { status: 'paused' }); }
  async archive(id: string): Promise<Workflow> { return this.update(id, { status: 'archived' }); }

  async delete(id: string): Promise<boolean> {
    const wf = this.workflows.get(id);
    if (!wf) return false;
    wf.isDeleted = true;
    wf.deletedAt = new Date().toISOString();
    return true;
  }
}

// ============================================================================
// In-Memory Webhook Repository
// ============================================================================

export class InMemoryWebhookRepository implements WebhookRepository {
  private webhooks: Map<string, Webhook> = new Map();

  async getById(id: string): Promise<Webhook | null> {
    return this.webhooks.get(id) || null;
  }

  async getByOrganization(organizationId: string): Promise<Webhook[]> {
    return Array.from(this.webhooks.values()).filter(w => w.organizationId === organizationId);
  }

  async getByEvent(eventType: string): Promise<Webhook[]> {
    return Array.from(this.webhooks.values())
      .filter(w => w.isActive && w.events.includes(eventType) && w.direction === 'outgoing');
  }

  async getActive(): Promise<Webhook[]> {
    return Array.from(this.webhooks.values()).filter(w => w.isActive);
  }

  async getOutgoing(): Promise<Webhook[]> {
    return Array.from(this.webhooks.values()).filter(w => w.direction === 'outgoing');
  }

  async getIncoming(): Promise<Webhook[]> {
    return Array.from(this.webhooks.values()).filter(w => w.direction === 'incoming');
  }

  async create(data: Omit<Webhook, 'id' | 'createdAt' | 'updatedAt'>): Promise<Webhook> {
    const now = new Date().toISOString();
    const webhook: Webhook = { id: generateId(16), ...data, createdAt: now, updatedAt: now };
    this.webhooks.set(webhook.id, webhook);
    return { ...webhook };
  }

  async update(id: string, data: Partial<Webhook>): Promise<Webhook> {
    const wh = this.webhooks.get(id);
    if (!wh) throw new Error('Webhook not found');
    Object.assign(wh, data);
    wh.updatedAt = new Date().toISOString();
    return { ...wh };
  }

  async activate(id: string): Promise<Webhook> { return this.update(id, { isActive: true }); }
  async deactivate(id: string): Promise<Webhook> { return this.update(id, { isActive: false }); }

  async updateLastTriggered(id: string, response: Webhook['lastResponse']): Promise<Webhook> {
    const wh = this.webhooks.get(id);
    if (!wh) throw new Error('Webhook not found');
    wh.lastTriggeredAt = new Date().toISOString();
    wh.lastResponse = response;
    wh.updatedAt = wh.lastTriggeredAt;
    return { ...wh };
  }

  async delete(id: string): Promise<boolean> {
    return this.webhooks.delete(id);
  }
}