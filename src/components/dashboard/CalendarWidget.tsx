"use client";

import { CalendarDays } from "lucide-react";
import Card from "./common/Card";
import SectionTitle from "./common/SectionTitle";
import StatusBadge from "./common/StatusBadge";
import { calendarEvents } from "./mock-data";

export default function CalendarWidget() {
  return (
    <Card>
      <SectionTitle title="Calendar" subtitle="Today’s commitments and launches" />

      <div className="mt-4 space-y-3">
        {calendarEvents.map((event) => (
          <div key={event.id} className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-slate-800 p-2 text-slate-300">
                  <CalendarDays size={16} />
                </div>
                <div>
                  <p className="font-medium text-white">{event.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{event.date} • {event.time}</p>
                </div>
              </div>
              <StatusBadge
                label={event.tone === "cyan" ? "Planning" : event.tone === "amber" ? "Launch" : "Sync"}
                tone={event.tone}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
