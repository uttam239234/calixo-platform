import Link from "next/link";
import { Archive, Copy, Eye, MoreHorizontal, Pause, Play, Trash2 } from "lucide-react";
import type { Campaign } from "@/features/ads/types";
import type { Platform } from "@/features/ads/types";

export const campaignStatusStyle: Record<Campaign["status"], string> = { Draft: "text-slate-300 bg-slate-700/50", Review: "text-violet-300 bg-violet-500/10", Scheduled: "text-blue-300 bg-blue-500/10", Running: "text-emerald-300 bg-emerald-500/10", Paused: "text-amber-300 bg-amber-500/10", Completed: "text-cyan-300 bg-cyan-500/10", Archived: "text-rose-300 bg-rose-500/10" };
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

interface Props { campaign: Campaign; platform: Platform; selected: boolean; onSelect: () => void; onAction: (action: string) => void; }
export function CampaignRow({ campaign, platform, selected, onSelect, onAction }: Props) {
  return <tr className={`group transition hover:bg-cyan-500/[0.035] ${selected ? "bg-cyan-500/[0.06]" : ""}`}>
    <td className="px-4 py-4"><input type="checkbox" checked={selected} onChange={onSelect} className="size-4 accent-cyan-400" aria-label={`Select ${campaign.name}`} /></td>
    <td className="px-4 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold" style={{ backgroundColor: `${platform.color}20`, color: platform.color }}>{platform.shortName}</span><div><Link href={`/dashboard/ads/campaigns/${campaign.id}`} className="font-medium text-slate-200 hover:text-cyan-300">{campaign.name}</Link><p className="mt-0.5 text-xs text-slate-500">{platform.name} · {campaign.owner}</p></div></div></td>
    <td className="px-4 py-4 text-slate-400">{campaign.objective}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs ${campaignStatusStyle[campaign.status]}`}>{campaign.status}</span></td><td className="px-4 py-4 text-slate-300">{money.format(campaign.spend)}</td><td className="px-4 py-4 text-slate-300">{campaign.conversions}</td><td className="px-4 py-4 text-slate-300">{campaign.ctr.toFixed(2)}%</td><td className="px-4 py-4 font-medium text-emerald-300">{campaign.roas.toFixed(1)}x</td>
    <td className="px-4 py-4"><details className="relative"><summary className="list-none cursor-pointer rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-white"><MoreHorizontal size={17} /></summary><div className="absolute right-0 z-30 mt-1 w-40 rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl">{[["View", Eye], ["Edit", Eye], ["Duplicate", Copy], [campaign.status === "Paused" ? "Resume" : "Pause", campaign.status === "Paused" ? Play : Pause], ["Archive", Archive], ["Delete", Trash2]].map(([label, Icon]) => <button key={label as string} onClick={() => onAction(label as string)} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs hover:bg-slate-800 ${label === "Delete" ? "text-rose-300" : "text-slate-300"}`}><Icon size={14} />{label as string}</button>)}</div></details></td>
  </tr>;
}
