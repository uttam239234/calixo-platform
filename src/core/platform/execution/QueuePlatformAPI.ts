/**
 * Calixo Platform - Queue Platform API
 *
 * Thin facade over `background`'s real `QueueEngine` — priority/delayed/
 * scheduled/retry/dead-letter mechanics all already genuine (see
 * `QueueEngine.ts` and the `getNextDue` fix in
 * `background/repositories/implementations.ts` that made scheduled/retrying
 * jobs actually dequeue again).
 */
import { queueEngine } from "@/background/queue/QueueEngine";
import type { CreateJobRequest, Job, QueueMetrics } from "@/background/types";

export class QueuePlatformAPI {
  enqueue(request: CreateJobRequest): Promise<Job> {
    return queueEngine.enqueue(request);
  }

  enqueueBatch(requests: CreateJobRequest[]): Promise<Job[]> {
    return queueEngine.enqueueBatch(requests);
  }

  cancel(jobId: string): Promise<Job> {
    return queueEngine.cancel(jobId);
  }

  getJob(jobId: string): Promise<Job | null> {
    return queueEngine.getJob(jobId);
  }

  getMetrics(): Promise<QueueMetrics[]> {
    return queueEngine.getMetrics();
  }

  getDeadLetter(): Promise<Job[]> {
    return queueEngine.getDeadLetterJobs();
  }

  requeueDeadLetter(jobId: string): Promise<Job> {
    return queueEngine.requeueDeadLetter(jobId);
  }
}

export const queuePlatformAPI = new QueuePlatformAPI();
