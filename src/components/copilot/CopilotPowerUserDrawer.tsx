"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { CopilotExecutionPanel } from "./CopilotExecutionPanel";
import { CopilotPlanPipeline } from "./CopilotPlanPipeline";
import type { ExecutionTask } from "@/core/copilot";
import type { PipelineStageView } from "./types";

interface CopilotPowerUserDrawerProps {
  tasks: ExecutionTask[];
  hasPlan: boolean;
  isRunning: boolean;
  onRun: () => void;
  pipelineStages: PipelineStageView[];
}

/**
 * The brief's "Power User Mode... debug information — never enabled by default." Only rendered
 * when the header's Beginner/Power User toggle is on, replacing the old always-visible Execution
 * + Execution Plan cards.
 */
export function CopilotPowerUserDrawer({ tasks, hasPlan, isRunning, onRun, pipelineStages }: CopilotPowerUserDrawerProps) {
  return (
    <div className="scrollbar-thin w-[300px] flex-shrink-0 space-y-4 overflow-y-auto pb-2 pr-0.5">
      <Card>
        <CardHeader title="Execution" description="Live task states from ExecutionEngine" />
        <CardContent>
          <CopilotExecutionPanel tasks={tasks} hasPlan={hasPlan} isRunning={isRunning} onRun={onRun} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader title="Planner Pipeline" description="Understand → Tool Selection → Execution → Validation → Response" />
        <CardContent>
          <CopilotPlanPipeline stages={pipelineStages} />
        </CardContent>
      </Card>
    </div>
  );
}
