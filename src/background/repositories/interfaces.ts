/**
 * Calixo Platform - Background Processing Repository Interfaces
 */

import type {
  Job,
  CreateJobRequest,
  Execution,
  ExecutionLog,
  Event,
  EventSubscriber,
  Schedule,
  Workflow,
  Webhook,
  PaginatedJobs,
  PaginatedExecutions,
  PaginatedEvents,
  PaginatedSchedules,
  PaginatedWorkflows,
  JobStatus,
  QueueName,
} from '@/background/types';

export interface JobRepository {
  getById(id: string): Promise<Job | null>;
  getByOrganization(organizationId: string): Promise<Job[]>;
  getByWorker(worker: string): Promise<Job[]>;
  getByStatus(status: JobStatus): Promise<Job[]>;
  getByQueue(queue: QueueName): Promise<Job[]>;
  getNextDue(limit?: number): Promise<Job[]>;
  getDeadLetterJobs(): Promise<Job[]>;
  getPaginated(params: {
    organizationId?: string;
    status?: JobStatus;
    worker?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedJobs>;
  create(data: CreateJobRequest): Promise<Job>;
  updateStatus(id: string, status: JobStatus): Promise<Job>;
  markRunning(id: string): Promise<Job>;
  markCompleted(id: string, duration?: number): Promise<Job>;
  markFailed(id: string, error: Job['error']): Promise<Job>;
  markRetrying(id: string, error: Job['error']): Promise<Job>;
  markCancelled(id: string): Promise<Job>;
  incrementRetry(id: string): Promise<Job>;
  updateScheduledAt(id: string, scheduledAt: string): Promise<Job>;
  delete(id: string): Promise<boolean>;
  countByStatus(status: JobStatus): Promise<number>;
  countByQueue(queue: QueueName): Promise<number>;
  getQueueMetrics(): Promise<Record<QueueName, number>>;
}

export interface ExecutionRepository {
  getById(id: string): Promise<Execution | null>;
  getByJob(jobId: string): Promise<Execution[]>;
  getByWorkflow(workflowId: string): Promise<Execution[]>;
  getByWorker(worker: string): Promise<Execution[]>;
  getByStatus(status: Execution['status']): Promise<Execution[]>;
  getPaginated(params: {
    organizationId?: string;
    status?: Execution['status'];
    worker?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedExecutions>;
  create(execution: Omit<Execution, 'id' | 'createdAt' | 'updatedAt' | 'logs'>): Promise<Execution>;
  updateStatus(id: string, status: Execution['status']): Promise<Execution>;
  complete(id: string, output: Record<string, unknown>, duration: number): Promise<Execution>;
  fail(id: string, error: Job['error']): Promise<Execution>;
  addLog(id: string, log: ExecutionLog): Promise<Execution>;
  delete(id: string): Promise<boolean>;
  countByStatus(status: Execution['status']): Promise<number>;
  getAverageDuration(worker: string): Promise<number>;
}

export interface EventRepository {
  getById(id: string): Promise<Event | null>;
  getByType(type: string): Promise<Event[]>;
  getByStatus(status: Event['status']): Promise<Event[]>;
  getByCorrelationId(correlationId: string): Promise<Event[]>;
  getPaginated(params: {
    organizationId?: string;
    type?: string;
    status?: Event['status'];
    page?: number;
    limit?: number;
  }): Promise<PaginatedEvents>;
  create(event: Omit<Event, 'id' | 'createdAt' | 'publishedAt'>): Promise<Event>;
  markPublished(id: string): Promise<Event>;
  markDelivered(id: string): Promise<Event>;
  markFailed(id: string): Promise<Event>;
  deleteOlderThan(date: string): Promise<number>;
  countByStatus(status: Event['status']): Promise<number>;
}

export interface EventSubscriberRepository {
  getById(id: string): Promise<EventSubscriber | null>;
  getByEventType(eventType: string): Promise<EventSubscriber[]>;
  getAll(): Promise<EventSubscriber[]>;
  getActive(): Promise<EventSubscriber[]>;
  create(subscriber: Omit<EventSubscriber, 'id'>): Promise<EventSubscriber>;
  update(id: string, data: Partial<EventSubscriber>): Promise<EventSubscriber>;
  activate(id: string): Promise<EventSubscriber>;
  deactivate(id: string): Promise<EventSubscriber>;
  delete(id: string): Promise<boolean>;
}

export interface ScheduleRepository {
  getById(id: string): Promise<Schedule | null>;
  getAll(): Promise<Schedule[]>;
  getActive(): Promise<Schedule[]>;
  getByWorker(worker: string): Promise<Schedule[]>;
  getByOrganization(organizationId: string): Promise<Schedule[]>;
  getDue(now: string): Promise<Schedule[]>;
  getPaginated(params: {
    organizationId?: string;
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<PaginatedSchedules>;
  create(data: Schedule): Promise<Schedule>;
  update(id: string, data: Partial<Schedule>): Promise<Schedule>;
  activate(id: string): Promise<Schedule>;
  deactivate(id: string): Promise<Schedule>;
  updateLastRun(id: string, lastRunAt: string, nextRunAt: string): Promise<Schedule>;
  delete(id: string): Promise<boolean>;
  countActive(): Promise<number>;
}

export interface WorkflowRepository {
  getById(id: string): Promise<Workflow | null>;
  getAll(): Promise<Workflow[]>;
  getByStatus(status: Workflow['status']): Promise<Workflow[]>;
  getByOrganization(organizationId: string): Promise<Workflow[]>;
  getByTriggerType(triggerType: Workflow['trigger']['type']): Promise<Workflow[]>;
  getPaginated(params: {
    organizationId?: string;
    status?: Workflow['status'];
    page?: number;
    limit?: number;
  }): Promise<PaginatedWorkflows>;
  create(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow>;
  update(id: string, data: Partial<Workflow>): Promise<Workflow>;
  activate(id: string): Promise<Workflow>;
  pause(id: string): Promise<Workflow>;
  archive(id: string): Promise<Workflow>;
  delete(id: string): Promise<boolean>;
}

export interface WebhookRepository {
  getById(id: string): Promise<Webhook | null>;
  getByOrganization(organizationId: string): Promise<Webhook[]>;
  getByEvent(eventType: string): Promise<Webhook[]>;
  getActive(): Promise<Webhook[]>;
  getOutgoing(): Promise<Webhook[]>;
  getIncoming(): Promise<Webhook[]>;
  create(webhook: Omit<Webhook, 'id' | 'createdAt' | 'updatedAt'>): Promise<Webhook>;
  update(id: string, data: Partial<Webhook>): Promise<Webhook>;
  activate(id: string): Promise<Webhook>;
  deactivate(id: string): Promise<Webhook>;
  updateLastTriggered(id: string, response: Webhook['lastResponse']): Promise<Webhook>;
  delete(id: string): Promise<boolean>;
}