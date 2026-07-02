import { ArrowRight, Sparkles } from "lucide-react";
import Card from "@/components/dashboard/common/Card";
import { recommendations } from "@/features/ads/mock-data";

export function RecommendationPanel() {
  return <Card className="p-5" hover={false}><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Calixo AI</p><h3 className="mt-1 font-semibold text-white">Recommendations</h3></div><span className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-300"><Sparkles size={19} /></span></div>
    <div className="mt-4 space-y-2">{recommendations.map((item) => <button key={item.id} className="group flex w-full items-center gap-3 rounded-2xl border border-transparent bg-slate-950/40 p-3 text-left transition hover:border-cyan-500/20 hover:bg-cyan-500/5"><span className={`h-2 w-2 shrink-0 rounded-full ${item.impact === "High" ? "bg-cyan-300 shadow-[0_0_8px_#67e8f9]" : "bg-violet-400"}`} /><span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-200">{item.title}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{item.description}</span></span><ArrowRight size={15} className="shrink-0 text-slate-600 transition group-hover:translate-x-1 group-hover:text-cyan-300" /></button>)}</div>
  </Card>;
}
