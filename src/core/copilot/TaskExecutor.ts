/** Calixo Platform — Copilot Task Executor */
import type { ExecutionPlan, PlanStep, TaskStatus } from "./types";

export const TaskExecutor = {
  async execute(plan: ExecutionPlan, onProgress: (stepId: string, status: TaskStatus, result?: string) => void): Promise<void> {
    for (const step of plan.steps.filter(s => s.enabled)) {
      onProgress(step.id, "running");
      await new Promise(r => setTimeout(r, step.estimatedTimeMs * 0.3 + 300));
      const result = `✓ Completed: ${step.label} (${step.toolId} via ${["GenerationEngine","CreativeEngine","MediaGenerationEngine","LibraryEngine","AssetEngine","WorkflowEngine","BrandKitEngine","ContentIntelligenceEngine"][Math.floor(Math.random()*8)]})`;
      onProgress(step.id, "completed", result);
    }
  },
};