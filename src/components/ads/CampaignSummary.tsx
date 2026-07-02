import { Banknote, Eye, MousePointerClick, Target } from "lucide-react";
import Card from "@/components/dashboard/common/Card";
import { performance } from "@/features/ads/mock-data";

const items = [
  { label: "Total spend", value: `$${(performance.spend / 1000).toFixed(1)}K`, change: performance.spendChange, icon: Banknote },
  { label: "Impressions", value: `${(performance.impressions / 1000000).toFixed(2)}M`, change: 11.6, icon: Eye },
  { label: "Clicks", value: `${(performance.clicks / 1000).toFixed(1)}K`, change: 9.3, icon: MousePointerClick },
  { label: "Conversions", value: performance.conversions.toLocaleString(), change: performance.conversionChange, icon: Target },
];

export function CampaignSummary() {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{items.map(({ label, value, change, icon: Icon }) => <Card key={label} className="p-5">
    <div className="flex items-center justify-between"><span className="text-sm text-slate-400">{label}</span><span className="rounded-xl bg-slate-800 p-2 text-cyan-300"><Icon size={17} /></span></div>
    <p className="mt-3 text-2xl font-semibold text-white">{value}</p><p className="mt-1 text-xs text-emerald-400">+{change}% <span className="text-slate-500">vs last month</span></p>
  </Card>)}</div>;
}
