"use client";
import { useState } from "react";
import { Copy, Play, Trash2, XCircle } from "lucide-react";
import { useCalendar } from "@/features/social/calendar/CalendarProvider";
import { formatTime } from "@/features/social/calendar/calendar-utils";
import { statusClass } from "./CalendarEventCard";

/**
 * The one genuine gap the audit found in Social Media's otherwise-complete client-side CRUD:
 * zero bulk-action code existed anywhere (no multi-select on posts, conversations, or calendar
 * events). This list view is the natural home for it — mirrors Ads Manager's `CampaignTable`
 * bulk-action bar pattern.
 */
export function AgendaView() {
  const { visibleEvents, openEdit, duplicateEvent, deleteEvent, bulkAction } = useCalendar();
  const [selected, setSelected] = useState<string[]>([]);

  const sorted = [...visibleEvents].sort((a, b) => a.start.localeCompare(b.start));

  const toggleOne = (id: string) => setSelected(current => (current.includes(id) ? current.filter(item => item !== id) : [...current, id]));
  const toggleAll = () => setSelected(current => (current.length === sorted.length ? [] : sorted.map(event => event.id)));

  const runBulk = (action: "Publish" | "Cancel" | "Delete") => {
    if (action === "Delete" && !window.confirm(`Delete ${selected.length} selected post${selected.length === 1 ? "" : "s"}?`)) return;
    bulkAction(selected, action);
    setSelected([]);
  };

  return (
    <div className="rounded-2xl border border-border bg-card/70">
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-primary/30 bg-primary/5 px-4 py-3">
          <span className="mr-2 text-sm font-medium text-foreground">{selected.length} selected</span>
          <button onClick={() => runBulk("Publish")} className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-surface hover:text-foreground">
            <Play size={13} /> Publish
          </button>
          <button onClick={() => runBulk("Cancel")} className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-surface hover:text-foreground">
            <XCircle size={13} /> Cancel
          </button>
          <button onClick={() => runBulk("Delete")} className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-surface hover:text-foreground">
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-surface/60 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" aria-label="Select all visible posts" checked={sorted.length > 0 && selected.length === sorted.length} onChange={toggleAll} className="size-4 accent-primary" />
              </th>
              {["Post", "Platform", "Campaign", "When", "Status", ""].map(head => (
                <th key={head} className="px-4 py-3 font-medium">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {sorted.map(event => (
              <tr key={event.id} className="hover:bg-surface/40">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.includes(event.id)} onChange={() => toggleOne(event.id)} className="size-4 accent-primary" />
                </td>
                <td className="max-w-[240px] truncate px-4 py-3 text-foreground">
                  <button onClick={() => openEdit(event.id)} className="truncate text-left hover:text-primary">
                    {event.title}
                  </button>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{event.platform}</td>
                <td className="px-4 py-3 text-muted-foreground">{event.campaign || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(event.start).toLocaleDateString()} · {formatTime(event.start)}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs ${statusClass[event.status]}`}>{event.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => duplicateEvent(event.id)} aria-label={`Duplicate ${event.title}`} className="text-muted-foreground hover:text-primary">
                      <Copy size={14} />
                    </button>
                    <button onClick={() => deleteEvent(event.id)} aria-label={`Delete ${event.title}`} className="text-muted-foreground hover:text-destructive">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No posts match the current search and filters.</p>}
      </div>
    </div>
  );
}
