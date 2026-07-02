import { ArrowUpRight, Sparkles } from "lucide-react";
import ProgressRing from "./common/ProgressRing";
import { healthScoreData } from "./mock-data";

export default function HealthScore() {
  const { score, label, description } = healthScoreData;

  const grade = score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 55 ? "Average" : "Poor";
  const tone = score >= 85 ? "cyan" : score >= 70 ? "emerald" : score >= 55 ? "amber" : "rose";

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-4xl font-semibold text-white">{score}%</p>
            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-sm text-cyan-300">{grade}</span>
          </div>
          <p className="mt-3 text-sm text-slate-400">{description}</p>
        </div>

        <div className="flex items-center gap-4">
          <ProgressRing value={score} label="Health" tone={tone as "cyan" | "emerald" | "amber" | "rose"} />
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Sparkles size={14} className="text-cyan-300" />
              Trend +6.2%
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-emerald-300">
              <ArrowUpRight size={14} />
              Last updated 2m ago
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-400">
        Recommendation: Focus on lead nurture and creative refresh to sustain momentum through the next launch wave.
      </div>
    </section>
  );
}
