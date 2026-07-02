import { CircleDollarSign, MousePointerClick, Target, TrendingUp } from "lucide-react";
import type { Campaign } from "@/features/ads/types";

export function CampaignStats({ campaigns }: { campaigns: Campaign[] }) {
  const spend = campaigns.reduce((sum, x) => sum + x.spend, 0); const conversions = campaigns.reduce((sum, x) => sum + x.conversions, 0); const revenue = campaigns.reduce((sum, x) => sum + x.revenue, 0); const clicks = campaigns.reduce((sum, x) => sum + x.clicks, 0);
  const items = [{ label: "Managed spend", value: `$${(spend / 1000).toFixed(1)}K`, icon: CircleDollarSign }, { label: "Revenue", value: `$${(revenue / 1000).toFixed(1)}K`, icon: TrendingUp }, { label: "Conversions", value: conversions.toLocaleString(), icon: Target }, { label: "Clicks", value: `${(clicks / 1000).toFixed(1)}K`, icon: MousePointerClick }];
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{items.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"><div className="flex items-center justify-between text-xs text-slate-500"><span>{label}</span><Icon size={16} className="text-cyan-300" /></div><p className="mt-2 text-xl font-semibold text-white">{value}</p></div>)}</div>;
}
