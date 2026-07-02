import { CheckCircle2, Clock3, RefreshCw, TriangleAlert } from "lucide-react";
import Card from "@/components/dashboard/common/Card";
import { platforms } from "@/features/ads/mock-data";

export function PlatformStatus() {
  return <Card className="p-5" hover={false}><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Connections</p><h3 className="mt-1 font-semibold text-white">Platform status</h3></div><span className="text-xs text-emerald-400">4 of 5 healthy</span></div>
    <div className="mt-4 space-y-2">{platforms.map((platform) => { const StatusIcon = platform.status === "Connected" ? CheckCircle2 : platform.status === "Syncing" ? RefreshCw : TriangleAlert; return <div key={platform.id} className="flex items-center gap-3 rounded-2xl bg-slate-950/40 p-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold" style={{ backgroundColor: `${platform.color}20`, color: platform.color }}>{platform.shortName}</span><div className="min-w-0 flex-1"><p className="text-sm font-medium text-slate-200">{platform.name}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500"><Clock3 size={11} /> {platform.lastSync} · {platform.campaignCount} campaigns</p></div><StatusIcon size={16} className={platform.status === "Connected" ? "text-emerald-400" : platform.status === "Syncing" ? "animate-spin text-cyan-300" : "text-amber-400"} /></div>; })}</div>
  </Card>;
}
