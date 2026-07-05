"use client";

import { useState } from "react";
import { Pause, Play, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { SCHEDULE_FREQUENCIES } from "@/core/reports";
import type { ExportFormat, ReportSchedule, ScheduleFrequency } from "@/core/reports";

interface SchedulePanelProps {
  schedules: ReportSchedule[];
  onCreate: (params: { frequency: ScheduleFrequency; recipients: string[]; exportFormat?: ExportFormat }) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function SchedulePanel({ schedules, onCreate, onPause, onResume, onDelete }: SchedulePanelProps) {
  const [frequency, setFrequency] = useState<ScheduleFrequency>("weekly");
  const [recipients, setRecipients] = useState("");

  const handleCreate = () => {
    const list = recipients
      .split(",")
      .map(r => r.trim())
      .filter(Boolean);
    if (list.length === 0) return;
    onCreate({ frequency, recipients: list });
    setRecipients("");
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Existing Schedules</p>
        {schedules.length === 0 ? (
          <p className="text-xs text-muted-foreground">No schedules for this report yet.</p>
        ) : (
          <div className="space-y-1.5">
            {schedules.map(schedule => (
              <div key={schedule.id} className="rounded-xl bg-accent/30 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium capitalize text-foreground">{schedule.frequency}</span>
                  <span className={cn("badge", schedule.active ? "badge-success" : "badge-outline")}>{schedule.active ? "Enabled" : "Paused"}</span>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">Next run: {formatDate(schedule.nextRunAt)}</p>
                <div className="mt-1.5 flex gap-1">
                  {schedule.active ? (
                    <Button size="xs" variant="outline" onClick={() => onPause(schedule.id)} className="gap-1">
                      <Pause size={11} /> Pause
                    </Button>
                  ) : (
                    <Button size="xs" variant="outline" onClick={() => onResume(schedule.id)} className="gap-1">
                      <Play size={11} /> Resume
                    </Button>
                  )}
                  <Button size="xs" variant="ghost" onClick={() => onDelete(schedule.id)} className="gap-1 text-destructive hover:bg-destructive/10">
                    <Trash2 size={11} /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border/60 pt-3">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Create Schedule</p>
        <div className="space-y-2">
          <select value={frequency} onChange={e => setFrequency(e.target.value as ScheduleFrequency)} className="input">
            {SCHEDULE_FREQUENCIES.map(f => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          <Input inputSize="sm" placeholder="Recipients (comma separated)" value={recipients} onChange={e => setRecipients(e.target.value)} />
          <Button size="sm" onClick={handleCreate} className="w-full gap-1.5">
            <Plus size={13} /> Create Schedule
          </Button>
        </div>
      </div>
    </div>
  );
}
