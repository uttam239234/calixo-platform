/**
 * Calixo Platform - Execution Platform API
 *
 * The sanctioned way any module submits asynchronous work. Every module
 * mentioned in the mandate (Workflow, Connectors, Reports, AIOS,
 * Communication, Assets) should call `submit()` instead of enqueuing a job
 * or spinning up its own timer directly.
 */
import { executionEngine } from "./ExecutionEngine";
import type { ExecutionLifecycleStatus, ExecutionRecord, SubmitExecutionRequest } from "./types";

export class ExecutionPlatformAPI {
  submit(request: SubmitExecutionRequest): Promise<ExecutionRecord> {
    return executionEngine.submit(request);
  }

  cancel(executionId: string): Promise<ExecutionRecord | undefined> {
    return executionEngine.cancel(executionId);
  }

  retry(executionId: string): Promise<ExecutionRecord | undefined> {
    return executionEngine.retry(executionId);
  }

  get(executionId: string): ExecutionRecord | undefined {
    return executionEngine.get(executionId);
  }

  list(params: { organizationId?: string; status?: ExecutionLifecycleStatus; worker?: string } = {}): ExecutionRecord[] {
    return executionEngine.list(params);
  }

  count(): number {
    return executionEngine.count();
  }
}

export const executionPlatformAPI = new ExecutionPlatformAPI();
