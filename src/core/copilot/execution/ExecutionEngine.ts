/**
 * Calixo Platform - Copilot Execution Engine
 *
 * Executes an ExecutionPlan produced by the Planner Engine. Tracks task
 * state, progress, retries, and history. All actual work is delegated to
 * the Tool Registry — this engine contains no business logic itself.
 */

import { generateId } from "@/shared/utils/string";
import { toolRegistry, ToolRegistry } from "../tools/ToolRegistry";
import type { ExecutionHistoryEntry, ExecutionPlan, ExecutionProgressListener, ExecutionTask, TaskState } from "../types/index";

const DEFAULT_MAX_RETRIES = 1;

export class ExecutionEngine {
  constructor(private tools: ToolRegistry = toolRegistry) {}

  private tasks: Map<string, ExecutionTask> = new Map();
  private history: ExecutionHistoryEntry[] = [];

  async executePlan(plan: ExecutionPlan, options: { onProgress?: ExecutionProgressListener } = {}): Promise<ExecutionTask[]> {
    const taskIds: string[] = [];
    for (const step of plan.steps.filter(s => s.enabled)) {
      const task = this.createTask(plan.id, step.id, step.toolId, step.label, step.estimatedTimeMs);
      taskIds.push(task.id);
      await this.runTask(task, step.input, options.onProgress);
    }
    return taskIds.map(id => this.tasks.get(id)!);
  }

  retryTask(taskId: string): ExecutionTask | undefined {
    const task = this.tasks.get(taskId);
    if (!task || task.state !== "failed") return task ? { ...task } : undefined;
    task.state = "queued";
    task.error = undefined;
    task.retryCount = 0;
    this.record(task, "Task manually retried");
    return { ...task };
  }

  cancelTask(taskId: string): ExecutionTask | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;
    task.state = "cancelled";
    task.completedAt = new Date().toISOString();
    this.record(task, "Task cancelled");
    return { ...task };
  }

  skipTask(taskId: string): ExecutionTask | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;
    task.state = "skipped";
    task.completedAt = new Date().toISOString();
    this.record(task, "Task skipped");
    return { ...task };
  }

  getTask(taskId: string): ExecutionTask | undefined {
    const task = this.tasks.get(taskId);
    return task ? { ...task } : undefined;
  }

  getTasksByPlan(planId: string): ExecutionTask[] {
    return Array.from(this.tasks.values())
      .filter(t => t.planId === planId)
      .map(t => ({ ...t }));
  }

  getHistory(planId?: string): ExecutionHistoryEntry[] {
    return planId ? this.history.filter(h => h.planId === planId) : [...this.history];
  }

  private createTask(planId: string, stepId: string, toolId: string, label: string, estimatedTimeMs: number): ExecutionTask {
    const task: ExecutionTask = {
      id: generateId(12),
      planId,
      stepId,
      toolId,
      label,
      state: "queued",
      progress: 0,
      estimatedTimeMs,
      retryCount: 0,
      maxRetries: DEFAULT_MAX_RETRIES,
    };
    this.tasks.set(task.id, task);
    this.record(task, "Task queued");
    return task;
  }

  private async runTask(task: ExecutionTask, input: Record<string, unknown>, onProgress?: ExecutionProgressListener): Promise<void> {
    this.transition(task, "running", 10, onProgress);
    task.startedAt = task.startedAt ?? new Date().toISOString();

    const result = await this.tools.execute(task.toolId, input);

    if (result.success) {
      task.result = result.data;
      task.actualTimeMs = result.durationMs;
      task.completedAt = new Date().toISOString();
      this.transition(task, "completed", 100, onProgress);
      return;
    }

    task.error = result.error;
    if (task.retryCount < task.maxRetries) {
      task.retryCount++;
      this.record(task, `Retrying after failure: ${result.error}`);
      await this.runTask(task, input, onProgress);
      return;
    }
    task.completedAt = new Date().toISOString();
    this.transition(task, "failed", task.progress, onProgress);
  }

  private transition(task: ExecutionTask, state: TaskState, progress: number, onProgress?: ExecutionProgressListener): void {
    task.state = state;
    task.progress = progress;
    this.record(task, `Task ${state}`);
    onProgress?.({ ...task });
  }

  private record(task: ExecutionTask, message: string): void {
    this.history.push({
      id: generateId(12),
      taskId: task.id,
      planId: task.planId,
      state: task.state,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}

export const executionEngine = new ExecutionEngine();
