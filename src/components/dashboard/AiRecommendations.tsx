import { ArrowRight, BrainCircuit, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recommendationData } from "./mock-data";

const icons = [TrendingUp, BrainCircuit, Zap] as const;

export default function AiRecommendations() {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">AI recommendations</h3>
        <span className="text-sm text-cyan-400">3 new</span>
      </div>

      <div className="space-y-3">
        {recommendationData.map((item, index) => {
          const Icon = icons[index] ?? BrainCircuit;

          return (
            <div key={item.id} className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 transition hover:border-cyan-500/30 hover:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-300">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm">
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">{item.impact}</span>
                      <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-300">{item.confidence}% confidence</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-cyan-300 hover:bg-cyan-500/10">
                  <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
