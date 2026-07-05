"use client";

/**
 * Calixo AI Copilot Workspace - execution state.
 * Thin React binding over the platform's ExecutionEngine.
 */

import { useCallback, useState } from "react";
import { executionEngine } from "@/core/copilot";
import type { ExecutionPlan, ExecutionTask } from "@/core/copilot";

export function useCopilotExecution() {
  const [tasksByPlan, setTasksByPlan] = useState<Record<string, ExecutionTask[]>>({});
  const [runningPlanId, setRunningPlanId] = useState<string | null>(null);

  const refreshPlan = useCallback((planId: string) => {
    setTasksByPlan(prev => ({ ...prev, [planId]: executionEngine.getTasksByPlan(planId) }));
  }, []);

  const runPlan = useCallback(
    async (plan: ExecutionPlan) => {
      setRunningPlanId(plan.id);
      try {
        await executionEngine.executePlan(plan, { onProgress: () => refreshPlan(plan.id) });
      } finally {
        refreshPlan(plan.id);
        setRunningPlanId(null);
      }
    },
    [refreshPlan]
  );

  const retryTask = useCallback(
    (planId: string, taskId: string) => {
      executionEngine.retryTask(taskId);
      refreshPlan(planId);
    },
    [refreshPlan]
  );

  const cancelTask = useCallback(
    (planId: string, taskId: string) => {
      executionEngine.cancelTask(taskId);
      refreshPlan(planId);
    },
    [refreshPlan]
  );

  const getTasks = useCallback((planId: string) => tasksByPlan[planId] ?? [], [tasksByPlan]);

  return { runningPlanId, runPlan, retryTask, cancelTask, getTasks };
}
