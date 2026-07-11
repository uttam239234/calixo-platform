"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Lock, Pause, Play, Plus, Send, Trash2, X } from "lucide-react";
import { reportsPlatformAPI, DELIVERY_METHODS } from "@/core/reports";
import type { DeliveryMethod, ReportRecipient, ReportRecipientType, ScheduleFrequency } from "@/core/reports";
import { useReports } from "@/hooks/useReports";
import { useSchedules } from "@/hooks/useSchedules";
import { useReportsContext } from "@/features/reports/ReportsProvider";
import { ModuleEmptyState } from "@/components/enterprise/module";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const FREQUENCIES: ScheduleFrequency[] = ["daily", "weekly", "monthly", "quarterly", "yearly", "manual"];

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function ScheduledReportsPage() {
  const { tenantContext, currentUserName, canManage, recordSchedule, showToast } = useReportsContext();
  const { reports } = useReports();
  const { schedules, pause, resume, remove, refresh } = useSchedules(null);

  const [reportId, setReportId] = useState("");
  const [frequency, setFrequency] = useState<ScheduleFrequency>("weekly");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("email");
  const [recipientType, setRecipientType] = useState<ReportRecipientType>("user");
  const [recipientValue, setRecipientValue] = useState("");
  const [pendingRecipients, setPendingRecipients] = useState<ReportRecipient[]>([]);

  const recipientOptions = useMemo(() => reportsPlatformAPI.listRecipientOptions(tenantContext.workspaceId), [tenantContext.workspaceId]);
  const reportNameById = useMemo(() => new Map(reports.map(r => [r.id, r.name])), [reports]);

  function addRecipient() {
    if (recipientType === "email") {
      const email = recipientValue.trim();
      if (!email) return;
      setPendingRecipients(prev => [...prev, { type: "email", id: email, label: email }]);
      setRecipientValue("");
      return;
    }
    const source = recipientType === "user" ? recipientOptions.users : recipientOptions.teams;
    const match = source.find(o => o.id === recipientValue);
    if (!match) return;
    setPendingRecipients(prev => (prev.some(r => r.id === match.id && r.type === recipientType) ? prev : [...prev, { type: recipientType, id: match.id, label: match.label }]));
    setRecipientValue("");
  }

  function handleCreate() {
    if (!reportId || pendingRecipients.length === 0) return;
    reportsPlatformAPI.createSchedule({ reportId, frequency, recipients: pendingRecipients, deliveryMethod });
    recordSchedule();
    refresh();
    setPendingRecipients([]);
    showToast("Schedule created.");
  }

  async function handleSendNow(schedule: (typeof schedules)[number]) {
    const { notified, externalPending } = await reportsPlatformAPI.sendScheduledDelivery(schedule, tenantContext);
    showToast(externalPending > 0 ? `Sent to ${notified} recipient(s), ${externalPending} pending email delivery.` : `Sent to ${notified} recipient(s).`);
  }

  if (!canManage) {
    return (
      <div className="flex items-center justify-center py-24">
        <ModuleEmptyState icon={<Lock size={32} />} title="You can't manage schedules" description="Ask a workspace admin to grant the report:manage permission." />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 py-4 lg:grid-cols-[320px_1fr]">
      <div className="card h-fit space-y-3 p-4">
        <p className="text-xs font-semibold text-foreground">New Schedule</p>

        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Report</label>
          <select value={reportId} onChange={e => setReportId(e.target.value)} className="input">
            <option value="">Choose a report…</option>
            {reports.map(r => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Frequency</label>
            <select value={frequency} onChange={e => setFrequency(e.target.value as ScheduleFrequency)} className="input capitalize">
              {FREQUENCIES.map(f => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Delivery</label>
            <select value={deliveryMethod} onChange={e => setDeliveryMethod(e.target.value as DeliveryMethod)} className="input">
              {DELIVERY_METHODS.map(d => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Recipients</label>
          <div className="mb-1.5 flex gap-1">
            {(["user", "team", "email"] as ReportRecipientType[]).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setRecipientType(type);
                  setRecipientValue("");
                }}
                className={cn("rounded-lg px-2 py-1 text-[10px] font-medium capitalize", recipientType === type ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {recipientType === "email" ? (
              <Input inputSize="sm" placeholder="name@company.com" value={recipientValue} onChange={e => setRecipientValue(e.target.value)} />
            ) : (
              <select value={recipientValue} onChange={e => setRecipientValue(e.target.value)} className="input">
                <option value="">{recipientType === "user" ? "Choose a user…" : "Choose a team…"}</option>
                {(recipientType === "user" ? recipientOptions.users : recipientOptions.teams).map(o => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}
            <Button size="sm" variant="outline" type="button" onClick={addRecipient}>
              <Plus size={13} />
            </Button>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {pendingRecipients.map((r, i) => (
              <span key={`${r.type}-${r.id}-${i}`} className="badge badge-secondary gap-1">
                {r.label}
                <button type="button" onClick={() => setPendingRecipients(prev => prev.filter((_, idx) => idx !== i))}>
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <Button size="sm" className="w-full gap-1.5" disabled={!reportId || pendingRecipients.length === 0} onClick={handleCreate}>
          <Plus size={13} /> Create Schedule
        </Button>
        <p className="text-[10px] text-muted-foreground">Created by {currentUserName}</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground">All Scheduled Reports ({schedules.length})</p>
        {schedules.length === 0 ? (
          <div className="card flex flex-col items-center justify-center gap-2 p-10 text-center">
            <CalendarClock size={22} className="text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No scheduled reports yet</p>
            <p className="text-xs text-muted-foreground">Create one from the panel on the left.</p>
          </div>
        ) : (
          schedules.map(schedule => (
            <div key={schedule.id} className="card p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{reportNameById.get(schedule.reportId) ?? schedule.reportId}</p>
                  <p className="mt-0.5 text-[11px] capitalize text-muted-foreground">
                    {schedule.frequency} · {schedule.deliveryMethod} · Next run: {formatDate(schedule.nextRunAt)}
                  </p>
                </div>
                <span className={cn("badge flex-shrink-0", schedule.active ? "badge-success" : "badge-outline")}>{schedule.active ? "Active" : "Paused"}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {schedule.recipients.map((r, i) => (
                  <span key={`${r.type}-${r.id}-${i}`} className="badge badge-outline">
                    {r.label}
                  </span>
                ))}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-border/60 pt-2.5">
                <Button size="xs" variant="outline" className="gap-1" onClick={() => handleSendNow(schedule)}>
                  <Send size={11} /> Send Now
                </Button>
                {schedule.active ? (
                  <Button size="xs" variant="outline" className="gap-1" onClick={() => pause(schedule.id)}>
                    <Pause size={11} /> Pause
                  </Button>
                ) : (
                  <Button size="xs" variant="outline" className="gap-1" onClick={() => resume(schedule.id)}>
                    <Play size={11} /> Resume
                  </Button>
                )}
                <Button size="xs" variant="ghost" className="gap-1 text-destructive hover:bg-destructive/10" onClick={() => remove(schedule.id)}>
                  <Trash2 size={11} /> Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
