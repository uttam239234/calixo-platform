"use client";

import { CalendarDays, Target, AlertCircle, FileText } from "lucide-react";
import Card from "./common/Card";
import SectionTitle from "./common/SectionTitle";
import StatusBadge from "./common/StatusBadge";
import { upcomingTasks } from "./mock-data";

const typeIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  campaign: Target,
  deadline: AlertCircle,
  meeting: CalendarDays,
  report: FileText,
};

const typeBadge: Record<string, { label: string; tone: "cyan" | "emerald" | "amber" | "rose" | "slate" }> = {
  campaign: { label: "Campaign", tone: "cyan" },
  deadline: { label: "Deadline", tone: "rose" },
  meeting: { label: "Meeting", tone: "amber" },
  report: { label: "Report", tone: "emerald" },
};

export default function CalendarWidget() {
  return (
    <Card>
      <SectionTitle title="Upcoming Tasks" subtitle="Schedule & deadlines" />

      <div className="mt-4 space-y-3">
        {upcomingTasks.map((task) => {
          const Icon = typeIcons[task.type] ?? CalendarDays;
          const badge = typeBadge[task.type] ?? { label: task.type, tone: "slate" as const };

          return (
            <div key={task.id} className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{task.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{task.date} • {task.time}</p>
                  </div>
                </div>
                <StatusBadge label={badge.label} tone={badge.tone} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}