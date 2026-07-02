import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import Card from "@/components/dashboard/common/Card";
import { platforms } from "@/features/ads/mock-data";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });

export function PlatformOverview() {
  return <section>
    <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold text-white">Platform overview</h2><span className="text-xs text-slate-500">All accounts · July 2026</span></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{platforms.map((platform) => (
      <Card key={platform.id} className="group p-4" hover>
        <div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white" style={{ backgroundColor: `${platform.color}26`, color: platform.color }}>{platform.shortName}</span><CheckCircle2 size={16} className={platform.status === "Connected" ? "text-emerald-400" : "text-amber-400"} /></div>
        <p className="mt-4 text-sm font-semibold text-white">{platform.name}</p>
        <p className="mt-1 text-2xl font-semibold text-white">{money.format(platform.spend)}</p>
        <div className="mt-4 flex items-end justify-between text-xs text-slate-500"><span>{platform.campaignCount} campaigns<br /><span className="text-slate-300">{platform.roas.toFixed(1)}x ROAS</span></span><span className="flex items-center gap-1 text-emerald-400"><ArrowUpRight size={13} /> {platform.ctr.toFixed(2)}% CTR</span></div>
      </Card>
    ))}</div>
  </section>;
}
