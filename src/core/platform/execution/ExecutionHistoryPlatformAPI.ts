/**
 * Calixo Platform - Execution History Platform API
 */
import { executionHistoryEngine } from "./ExecutionHistoryEngine";
import type { ExecutionHistoryEntry } from "./types";
import type { Job } from "@/background/types";

export class ExecutionHistoryPlatformAPI {
  getTimeline(executionId: string): ExecutionHistoryEntry | undefined {
    return executionHistoryEngine.getTimeline(executionId);
  }

  listByOrganization(organizationId: string): ExecutionHistoryEntry[] {
    return executionHistoryEngine.listByOrganization(organizationId);
  }

  getRecentFailures(limit?: number): ExecutionHistoryEntry[] {
    return executionHistoryEngine.getRecentFailures(limit);
  }

  getDeadLetter(): Promise<Job[]> {
    return executionHistoryEngine.getDeadLetter();
  }

  requeueDeadLetter(jobId: string): Promise<Job> {
    return executionHistoryEngine.requeueDeadLetter(jobId);
  }
}

export const executionHistoryPlatformAPI = new ExecutionHistoryPlatformAPI();
