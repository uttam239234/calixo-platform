/**
 * Calixo Platform - Execution Developer SDK
 *
 * One place a developer registers a new Execution Type, worker, schedule,
 * retry policy, automation, or policy without touching anything inside this
 * package — mirrors Phase 6's `DeveloperPlatformAPI` precedent (the SDK IS
 * the sanctioned Platform APIs, gathered behind one ergonomic surface).
 */
import { executionRegistry } from "./ExecutionRegistry";
import { workerPlatformAPI } from "./WorkerPlatformAPI";
import { schedulerPlatformAPI } from "./SchedulerPlatformAPI";
import { retryPlatformAPI } from "./RetryPlatformAPI";
import { automationPlatformAPI } from "./AutomationPlatformAPI";
import { executionPolicyPlatformAPI } from "./PolicyPlatformAPI";
import type { WorkerDefinition, WorkerHandler, CreateScheduleRequest } from "@/background/types";
import type { AutomationDefinition, ExecutionPolicyDefinition, ExecutionTypeDefinition, RetryPolicyDefinition } from "./types";

export class ExecutionDeveloperSDK {
  defineExecutionType(definition: ExecutionTypeDefinition): ExecutionTypeDefinition {
    return executionRegistry.register(definition);
  }

  defineWorker(definition: WorkerDefinition, handler: WorkerHandler): void {
    workerPlatformAPI.register(definition, handler);
  }

  defineSchedule(request: CreateScheduleRequest) {
    return schedulerPlatformAPI.createSchedule(request);
  }

  defineRetryPolicy(policy: RetryPolicyDefinition): RetryPolicyDefinition {
    return retryPlatformAPI.register(policy);
  }

  defineAutomation(definition: Omit<AutomationDefinition, "id" | "runCount" | "createdAt" | "updatedAt" | "scheduleId">): Promise<AutomationDefinition> {
    return automationPlatformAPI.register(definition);
  }

  definePolicy(policy: ExecutionPolicyDefinition): ExecutionPolicyDefinition {
    return executionPolicyPlatformAPI.setPolicy(policy);
  }
}

export const executionDeveloperSDK = new ExecutionDeveloperSDK();
