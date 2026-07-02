import type { CampaignFilterState } from "@/features/ads/campaign-utils";
import { defaultCampaignFilters } from "@/features/ads/campaign-utils";
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import { platforms } from "@/features/ads/mock-data";

interface Props { filters: CampaignFilterState; onChange: (filters: CampaignFilterState) => void; objectives: string[]; owners: string[]; }
const selectClass = "h-9 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs text-slate-300 outline-none transition hover:border-slate-700 focus:border-cyan-500/50";

export function CampaignFilters({ filters, onChange, objectives, owners }: Props) {
  const set = (key: keyof CampaignFilterState, value: string) => onChange({ ...filters, [key]: value });
  return <div className="flex gap-2 overflow-x-auto pb-1">
    <select value={filters.status} onChange={(e) => set("status", e.target.value)} className={selectClass}><option value="">All statuses</option>{["Draft", "Review", "Scheduled", "Running", "Paused", "Completed", "Archived"].map(x => <option key={x}>{x}</option>)}</select>
    <select value={filters.platform} onChange={(e) => set("platform", e.target.value)} className={selectClass}><option value="">All platforms</option>{platforms.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
    <select value={filters.objective} onChange={(e) => set("objective", e.target.value)} className={selectClass}><option value="">All objectives</option>{objectives.map(x => <option key={x}>{x}</option>)}</select>
    <select value={filters.budget} onChange={(e) => set("budget", e.target.value)} className={selectClass}><option value="">Any budget</option><option value="under1">Under $1K</option><option value="1to5">$1K–$5K</option><option value="5to10">$5K–$10K</option><option value="10to25">$10K–$25K</option><option value="over25">$25K+</option></select>
    <select value={filters.created} onChange={(e) => set("created", e.target.value)} className={selectClass}><option value="">Any created date</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select>
    <select value={filters.owner} onChange={(e) => set("owner", e.target.value)} className={selectClass}><option value="">All owners</option>{owners.map(x => <option key={x}>{x}</option>)}</select>
    <select value={filters.sort} onChange={(e) => set("sort", e.target.value)} className={selectClass}><option value="spend">Sort: Spend</option><option value="conversions">Conversions</option><option value="ctr">CTR</option><option value="roas">ROAS</option><option value="cpa">CPA</option><option value="createdAt">Created date</option><option value="name">Campaign name</option></select>
    <button onClick={() => set("direction", filters.direction === "asc" ? "desc" : "asc")} className={`${selectClass} flex shrink-0 items-center gap-2`}>{filters.direction === "asc" ? <ArrowUpAZ size={14} /> : <ArrowDownAZ size={14} />}{filters.direction === "asc" ? "Ascending" : "Descending"}</button>
    {Object.entries(filters).some(([key, value]) => !["sort", "direction"].includes(key) && Boolean(value)) && <button onClick={() => onChange(defaultCampaignFilters)} className="shrink-0 px-2 text-xs text-cyan-300 hover:text-cyan-200">Clear filters</button>}
  </div>;
}
