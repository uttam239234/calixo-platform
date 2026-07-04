/**
 * Calixo Platform - Queue Engine
 *
 * Core queue implementation supporting priority queues, delayed jobs,
 * scheduled jobs, recurring jobs, retry queues, and dead letter queues.
 */

import { appLogger } from '@/logging';
import type { Job, QueueName, QueueMetrics, CreateJobRequest } from '@/background/types';
import type { JobRepository, ExecutionRepository } from '@/background/repositories/interfaces';
import { InMemoryJobRepository, InMemoryExecutionRepository } from '@/background/repositories/implementations';

export class QueueEngine {
  private jobRepo: JobRepository;
  private executionRepo: ExecutionRepository;
  private isProcessing: boolean = false;
  private pollInterval: number = 1000;
  private maxConcurrent: number = 5;
  private activeJobs: Set<string> = new Set();
  private workerHandler?: (job: Job) => Promise<void>;

  constructor(
    jobRepo?: JobRepository,
    executionRepo?: ExecutionRepository
  ) {
    this.jobRepo = jobRepo || new InMemoryJobRepository();
    this.executionRepo = executionRepo || new InMemoryExecutionRepository();
  }

  setWorkerHandler(handler: (job: Job) => Promise<void>): void {
    this.workerHandler = handler;
  }

  setPollInterval(ms: number): void {
    this.pollInterval = ms;
  }

  setMaxConcurrent(count: number): void {
    this.maxConcurrent = count;
  }

  async enqueue(data: CreateJobRequest): Promise<Job> {
    return this.jobRepo.create(data);
  }

  async enqueueBatch(dataArray: CreateJobRequest[]): Promise<Job[]> {
    const jobs: Job[] = [];
    for (const data of dataArray) {
      jobs.push(await this.jobRepo.create(data));
    }
    appLogger.info('QueueEngine', `Enqueued ${jobs.length} batch jobs`);
    return jobs;
  }

  async dequeue(limit: number = 5): Promise<Job[]> {
    return this.jobRepo.getNextDue(limit);
  }

  async acknowledge(id: string): Promise<Job> {
    return this.jobRepo.markCompleted(id);
  }

  async fail(id: string, error: Job['error']): Promise<Job> {
    return this.jobRepo.markFailed(id, error);
  }

  async retry(id: string): Promise<Job> {
    const job = await this.jobRepo.getById(id);
    if (!job) throw new Error('Job not found');

    if (job.retryCount >= job.maxRetries) {
      // Move to dead letter queue
      await this.jobRepo.markFailed(id, {
        message: 'Max retries exceeded',
        category: 'permanent',
        timestamp: new Date().toISOString(),
      });
      appLogger.warn('QueueEngine', `Job ${id} moved to dead letter queue after ${job.retryCount} retries`);
      return this.jobRepo.getById(id) as Promise<Job>;
    }

    return this.jobRepo.incrementRetry(id);
  }

  async cancel(id: string): Promise<Job> {
    return this.jobRepo.markCancelled(id);
  }

  async getDeadLetterJobs(): Promise<Job[]> {
    return this.jobRepo.getDeadLetterJobs();
  }

  async requeueDeadLetter(id: string): Promise<Job> {
    const job = await this.jobRepo.getById(id);
    if (!job) throw new Error('Job not found');
    return this.jobRepo.updateScheduledAt(id, new Date().toISOString());
  }

  async getMetrics(): Promise<QueueMetrics[]> {
    const queues: QueueName[] = ['default', 'high_priority', 'scheduled', 'recurring', 'batch', 'dead_letter'];
    const metrics: QueueMetrics[] = [];

    for (const queueName of queues) {
      const jobs = await this.jobRepo.getByQueue(queueName);
      metrics.push({
        queueName,
        length: jobs.filter(j => j.status === 'queued' || j.status === 'scheduled').length,
        running: jobs.filter(j => j.status === 'running').length,
        completed: jobs.filter(j => j.status === 'completed').length,
        failed: jobs.filter(j => j.status === 'failed').length,
        retrying: jobs.filter(j => j.status === 'retrying').length,
        delayed: jobs.filter(j => j.status === 'delayed').length,
      });
    }

    return metrics;
  }

  // ============================================================================
  // Processing Loop
  // ============================================================================

  async start(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;
    appLogger.info('QueueEngine', 'Queue processing started');
    this.processLoop();
  }

  stop(): void {
    this.isProcessing = false;
    appLogger.info('QueueEngine', 'Queue processing stopped');
  }

  private async processLoop(): Promise<void> {
    while (this.isProcessing) {
      try {
        const available = this.maxConcurrent - this.activeJobs.size;
        if (available > 0 && this.workerHandler) {
          const jobs = await this.dequeue(available);
          for (const job of jobs) {
            if (!this.activeJobs.has(job.id)) {
              this.activeJobs.add(job.id);
              this.processJob(job).finally(() => {
                this.activeJobs.delete(job.id);
              });
            }
          }
        }
      } catch (error) {
        appLogger.error('QueueEngine', 'Error in processing loop', error as Error);
      }

      await this.sleep(this.pollInterval);
    }
  }

  private async processJob(job: Job): Promise<void> {
    try {
      await this.jobRepo.markRunning(job.id);
      const startTime = Date.now();

      if (this.workerHandler) {
        await this.workerHandler(job);
      }

      const duration = Date.now() - startTime;
      await this.jobRepo.markCompleted(job.id, duration);
    } catch (error) {
      const errMsg = (error as Error).message;
      const jobError: Job['error'] = {
        message: errMsg,
        category: 'transient',
        timestamp: new Date().toISOString(),
      };

      const currentJob = await this.jobRepo.getById(job.id);
      if (currentJob && currentJob.retryCount < currentJob.maxRetries) {
        await this.jobRepo.incrementRetry(job.id);
        appLogger.warn('QueueEngine', `Job ${job.id} failed, retrying (${currentJob.retryCount + 1}/${currentJob.maxRetries})`);
      } else {
        await this.jobRepo.markFailed(job.id, {
          ...jobError,
          message: `${errMsg} (max retries exceeded)`,
          category: 'permanent',
        });
        appLogger.error('QueueEngine', `Job ${job.id} failed permanently after max retries`);
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const queueEngine = new QueueEngine();