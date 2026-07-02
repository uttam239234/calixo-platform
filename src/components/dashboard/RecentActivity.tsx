import { Activity, Clock3 } from "lucide-react";
import Avatar from "./common/Avatar";
import StatusBadge from "./common/StatusBadge";
import { recentActivity } from "./mock-data";

export default function RecentActivity() {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Recent activity</h3>
        <span className="text-sm text-slate-500">Live</span>
      </div>

      <div className="space-y-3">
        {recentActivity.map((item) => (
          <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <Avatar name={item.title} initials="AI" className="shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-white">{item.title}</p>
                <StatusBadge label="Completed" tone="emerald" />
              </div>
              <p className="mt-1 text-sm text-slate-400">{item.detail}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <Clock3 size={12} />
                {item.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
