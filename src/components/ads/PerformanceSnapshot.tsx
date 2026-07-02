import { ArrowUpRight, BarChart3 } from "lucide-react";
import Card from "@/components/dashboard/common/Card";
import { performance } from "@/features/ads/mock-data";

export function PerformanceSnapshot() {
  const bars = [48, 56, 49, 65, 62, 74, 69, 82, 78, 91, 86, 100];
  return <Card className="p-5" hover={false}><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Performance snapshot</p><h3 className="mt-1 font-semibold text-white">Blended return</h3></div><span className="rounded-xl bg-violet-500/10 p-2.5 text-violet-300"><BarChart3 size={19} /></span></div>
    <div className="mt-5 flex items-end justify-between"><div><span className="text-3xl font-semibold text-white">{performance.roas.toFixed(2)}x</span><p className="mt-1 text-xs text-emerald-400"><ArrowUpRight size={13} className="inline" /> {performance.roasChange}% this month</p></div><div className="flex h-20 items-end gap-1.5">{bars.map((height, index) => <div key={index} className="w-2 rounded-t bg-cyan-400/70 transition hover:bg-cyan-300" style={{ height: `${height}%` }} />)}</div></div>
    <div className="mt-5 grid grid-cols-3 divide-x divide-slate-800 rounded-2xl bg-slate-950/50 py-3 text-center"><div><p className="text-xs text-slate-500">Revenue</p><p className="mt-1 text-sm font-semibold text-white">$626.6K</p></div><div><p className="text-xs text-slate-500">CTR</p><p className="mt-1 text-sm font-semibold text-white">{performance.ctr}%</p></div><div><p className="text-xs text-slate-500">Conv.</p><p className="mt-1 text-sm font-semibold text-white">3,920</p></div></div>
  </Card>;
}
