/**
 * Calixo Platform - Enterprise Execution, Automation & Background Processing Platform
 *
 * Barrel for the seventh major `core/platform` subpackage. Reuses
 * `src/background`'s real QueueEngine/WorkerRegistry/SchedulerEngine/
 * EventBus unmodified (plus one bug fix to `getNextDue` and one additive
 * `QueueEngine.getJob()` accessor — see their own comments) rather than
 * rebuilding queueing/dispatch/scheduling. What this package adds: the
 * Execution model/lifecycle/policy/retry layer, the Automation Platform
 * that makes `Workflow.trigger`s real, and — critically —
 * `initializeExecutionFoundation()` is the first thing in this codebase's
 * history to actually connect `queueEngine` to `workerRegistry` and start
 * their processing loops server-side.
 */

export * from "./types";
export * from "./RetryPolicyRegistry";
export * from "./ExecutionPolicyEngine";
export * from "./ExecutionRegistry";
export * from "./ExecutionEngine";
export * from "./AutomationEngine";
export * from "./ExecutionHistoryEngine";
export * from "./ExecutionMonitoring";

export * from "./ExecutionPlatformAPI";
export * from "./AutomationPlatformAPI";
export * from "./SchedulerPlatformAPI";
export * from "./QueuePlatformAPI";
export * from "./WorkerPlatformAPI";
export * from "./ExecutionHistoryPlatformAPI";
export * from "./ExecutionMonitoringPlatformAPI";
export * from "./RetryPlatformAPI";
export * from "./PolicyPlatformAPI";
export * from "./ExecutionDeveloperSDK";

import { schedulerEngine } from "@/background/scheduler/SchedulerEngine";
import { executionEngine } from "./ExecutionEngine";
import { registerCoreExecutionWiring } from "./contracts/registerCoreExecutionWiring";

let initialized = false;

/**
 * Registers the real workflow/notification/report-tick/ai-embedding
 * workers, then wires `queueEngine` to `workerRegistry` and starts the
 * queue, event-bus, and scheduler poll loops. Idempotent — safe to call
 * more than once; the first caller (in practice, the first request that
 * touches `initializePlatformFoundation()`) wins.
 */
export async function initializeExecutionFoundation(): Promise<void> {
  if (initialized) return;
  initialized = true;

  registerCoreExecutionWiring();
  executionEngine.initialize();
  void schedulerEngine.start();
}
