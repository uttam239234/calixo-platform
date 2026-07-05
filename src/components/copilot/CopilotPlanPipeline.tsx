"use client";

import { Check, Circle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PipelineStageView } from "./types";

interface CopilotPlanPipelineProps {
  stages: PipelineStageView[];
}

export function CopilotPlanPipeline({ stages }: CopilotPlanPipelineProps) {
  return (
    <div>
      {stages.map((stage, idx) => (
        <div key={stage.id} className="flex items-center gap-2.5">
          <div className="flex flex-col items-center self-stretch">
            <StageIcon status={stage.status} />
            {idx < stages.length - 1 && <div className={cn("my-0.5 w-px flex-1", stage.status === "completed" ? "bg-success/50" : "bg-border")} />}
          </div>
          <div className={cn("min-w-0 flex-1", idx < stages.length - 1 ? "pb-3.5" : "pb-0.5")}>
            <div className="flex items-center justify-between gap-2">
              <span className={cn("text-xs font-medium", stage.status === "pending" ? "text-muted-foreground" : "text-foreground")}>{stage.label}</span>
              {stage.status === "running" && <span className="text-[10px] text-info">{stage.progress}%</span>}
            </div>
            {stage.status === "running" && (
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full bg-info transition-all" style={{ width: `${stage.progress}%` }} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function StageIcon({ status }: { status: PipelineStageView["status"] }) {
  if (status === "completed") {
    return (
      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
        <Check size={12} />
      </div>
    );
  }
  if (status === "running") {
    return (
      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-info/15 text-info">
        <Loader2 size={12} className="animate-spin" />
      </div>
    );
  }
  if (status === "failed") {
    return (
      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <X size={12} />
      </div>
    );
  }
  return (
    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent text-muted-foreground">
      <Circle size={9} />
    </div>
  );
}
