import { ArrowRight, PlayCircle, Settings2, Sparkles } from "lucide-react";
import ActionButton from "./common/ActionButton";
import { quickActions } from "./mock-data";

const icons = [PlayCircle, Settings2, Sparkles] as const;

export default function QuickActions() {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Quick actions</h3>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
        {quickActions.map((action, index) => {
          const Icon = icons[index] ?? PlayCircle;

          return (
            <button
              key={action.id}
              className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-500/40 hover:bg-slate-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-300">
                  <Icon size={16} />
                </div>
                <ArrowRight size={16} className="mt-0.5 text-slate-500" />
              </div>
              <p className="mt-4 font-medium text-white">{action.title}</p>
              <p className="mt-1 text-sm text-slate-400">{action.description}</p>
            </button>
          );
        })}
      </div>

      <ActionButton className="mt-4">Open command center</ActionButton>
    </section>
  );
}
