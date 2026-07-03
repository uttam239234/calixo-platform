"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { SkeletonText } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { CalendarDays, Target, AlertCircle, FileText, Clock, CheckCircle2, Circle, User } from "lucide-react";
import { upcomingTasks } from "./mock-data";
import type { UpcomingTask } from "./types";

const typeConfig = {
  campaign: { icon: Target, className: "bg-primary/10 text-primary" },
  deadline: { icon: AlertCircle, className: "bg-destructive/10 text-destructive" },
  meeting: { icon: CalendarDays, className: "bg-warning/10 text-warning" },
  report: { icon: FileText, className: "bg-success/10 text-success" },
};

const priorityColors: Record<string, string> = {
  high: "border-l-primary",
  medium: "border-l-warning",
  low: "border-l-muted-foreground/30",
};

function TaskRow({ task }: { task: UpcomingTask }) {
  const config = typeConfig[task.type];
  const TypeIcon = config.icon;
  const [checked, setChecked] = useState(false);

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/50 px-4 py-3.5 transition-all duration-150 hover:bg-accent/50 hover:border-border/80 hover:shadow-sm border-l-[3px] ${priorityColors[task.priority]} ${
        checked ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={() => setChecked(!checked)}
          className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors duration-150"
          aria-label={checked ? "Mark as incomplete" : "Mark as complete"}
        >
          {checked ? (
            <CheckCircle2 size={18} className="text-success" />
          ) : (
            <Circle size={18} />
          )}
        </button>
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${config.className}`}>
          <TypeIcon size={16} />
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-semibold text-foreground truncate ${checked ? "line-through" : ""}`}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <Clock size={11} />
            <span>{task.date}</span>
            <span>•</span>
            <span>{task.time}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/80 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm">
          <User size={10} />
          {task.assignee}
        </span>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium capitalize ${
          task.priority === "high" ? "border-destructive/20 bg-destructive/10 text-destructive" :
          task.priority === "medium" ? "border-warning/20 bg-warning/10 text-warning" :
          "border-border/60 bg-muted/10 text-muted-foreground"
        }`}>
          {task.priority}
        </span>
      </div>
    </div>
  );
}

function TaskSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/50 px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 rounded-full bg-gradient-to-r from-border/40 via-border/60 to-border/40 animate-pulse" />
        <div className="h-9 w-9 rounded-xl bg-gradient-to-r from-border/40 via-border/60 to-border/40 animate-pulse" />
        <div className="space-y-1.5">
          <SkeletonText className="h-4 w-40" />
          <SkeletonText className="h-3 w-24" />
        </div>
      </div>
      <SkeletonText className="h-5 w-16" />
    </div>
  );
}

interface UpcomingTasksProps {
  loading?: boolean;
}

export default function UpcomingTasks({ loading = false }: UpcomingTasksProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader title="Upcoming Tasks" description="Schedule & deadlines" />
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <TaskSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (upcomingTasks.length === 0) {
    return (
      <Card>
        <CardHeader title="Upcoming Tasks" description="Schedule & deadlines" />
        <CardContent>
          <EmptyState
            icon={<CalendarDays size={32} />}
            title="No upcoming tasks"
            description="Your schedule is clear. Add campaigns or deadlines to stay on track."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Upcoming Tasks"
        description="Schedule & deadlines"
      />
      <CardContent>
        <div className="space-y-2">
          {upcomingTasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}