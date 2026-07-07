/**
 * Calixo Platform - Execution Observability
 *
 * Wraps Phase 7's real `executionMonitoring`/`executionHistoryEngine` — no
 * second execution telemetry store.
 */
import { executionMonitoring } from "@/core/platform/execution/ExecutionMonitoring";
import { executionHistoryEngine } from "@/core/platform/execution/ExecutionHistoryEngine";

export class ExecutionObservability {
  getSnapshot() {
    return executionMonitoring.getSnapshot();
  }

  getRecentFailures(limit?: number) {
    return executionHistoryEngine.getRecentFailures(limit);
  }

  getDeadLetter() {
    return executionHistoryEngine.getDeadLetter();
  }

  getTimeline(executionId: string) {
    return executionHistoryEngine.getTimeline(executionId);
  }
}

export const executionObservability = new ExecutionObservability();
