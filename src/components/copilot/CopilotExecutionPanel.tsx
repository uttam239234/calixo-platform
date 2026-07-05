"use client";

import type { ComponentType } from "react";
import { CheckCircle2, Clock, Loader2, Play, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ExecutionTask, TaskState } from "@/core/copilot";

interface CopilotExecutionPanelProps {
  tasks: ExecutionTask[];
  hasPlan: boolean;
  isRunning: boolean;
  onRun: () => void;
}

const STATE_META: Record<TaskState, { icon: ComponentType<{ size?: number; className?: string }>; className: string }> = {
  queued: { icon: Clock, className: "text-muted-foreground" },
  running: { icon: Loader2, className: "text-info" },
  completed: { icon: CheckCircle2, className: "text-success" },
  failed: { icon: XCircle, className: "text-destructive" },
  cancelled: { icon: XCircle, className: "text-muted-foreground" },
  skipped: { icon: Clock, className: "text-muted-foreground" },
};

const SUMMARY_STATES = ["queued", "running", "completed", "failed"] as const;

export function CopilotExecutionPanel({ tasks, hasPlan, isRunning, onRun }: CopilotExecutionPanelProps) {
  const counts: Record<(typeof SUMMARY_STATES)[number], number> = {
    queued: tasks.filter(t => t.state === "queued").length,
    running: tasks.filter(t => t.state === "running").length,
    completed: tasks.filter(t => t.state === "completed").length,
    failed: tasks.filter(t => t.state === "failed").length,
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-1.5 text-center">
        {SUMMARY_STATES.map(key => (
          <div key={key} className="rounded-xl bg-accent/50 px-1.5 py-2">
            <p className={cn("text-sm font-semibold tabular-nums", STATE_META[key].className)}>{counts[key]}</p>
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{key}</p>
          </div>
        ))}
      </div>

      {tasks.length === 0 ? (
        hasPlan ? (
          <Button size="sm" onClick={onRun} disabled={isRunning} loading={isRunning} className="w-full gap-1.5">
            <Play size={13} /> Run Plan
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">No plan yet — send a message to generate one.</p>
        )
      ) : (
        <div className="space-y-1.5">
          {tasks.map(task => {
            const meta = STATE_META[task.state];
            const Icon = meta.icon;
            return (
              <div key={task.id} className="rounded-xl bg-accent/30 p-2">
                <div className="flex items-center gap-1.5">
                  <Icon size={12} className={cn(meta.className, task.state === "running" && "animate-spin")} />
                  <span className="flex-1 truncate text-xs text-foreground">{task.label}</span>
                  <span className="text-[10px] text-muted-foreground">{(task.estimatedTimeMs / 1000).toFixed(1)}s</span>
                </div>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className={cn("h-full rounded-full transition-all", task.state === "failed" ? "bg-destructive" : "bg-primary")}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
