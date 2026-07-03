"use client";

import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import type { CampaignFilterState } from "@/features/ads/campaign-utils";

interface Props {
  filters: CampaignFilterState;
  onChange: (filters: CampaignFilterState) => void;
  objectives: string[];
  owners: string[];
}

const selectClass = "h-9 rounded-xl border border-border bg-card/50 px-3 text-xs text-muted-foreground outline-none transition hover:border-border/80 focus:border-primary/50";

export function CampaignFilters({ filters, onChange, objectives, owners }: Props) {
  const set = (key: keyof CampaignFilterState, value: string) => onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap gap-2">
      <select className={selectClass} value={filters.platform} onChange={e => set("platform", e.target.value)}>
        <option value="">All platforms</option>
        <option value="google">Google Ads</option>
        <option value="meta">Meta Ads</option>
        <option value="linkedin">LinkedIn</option>
        <option value="microsoft">Microsoft Ads</option>
        <option value="tiktok">TikTok Ads</option>
        <option value="pinterest">Pinterest Ads</option>
      </select>
      <select className={selectClass} value={filters.status} onChange={e => set("status", e.target.value)}>
        <option value="">All statuses</option>
        <option value="Running">Running</option>
        <option value="Paused">Paused</option>
        <option value="Draft">Draft</option>
        <option value="Completed">Completed</option>
        <option value="Archived">Archived</option>
      </select>
      <select className={selectClass} value={filters.objective} onChange={e => set("objective", e.target.value)}>
        <option value="">All objectives</option>
        {objectives.map(x => <option key={x}>{x}</option>)}
      </select>
      <select className={selectClass} value={filters.owner} onChange={e => set("owner", e.target.value)}>
        <option value="">All owners</option>
        {owners.map(x => <option key={x}>{x}</option>)}
      </select>
      <select className={selectClass} value={filters.sort} onChange={e => set("sort", e.target.value)}>
        <option value="name">Sort by name</option>
        <option value="budget">Sort by budget</option>
        <option value="spend">Sort by spend</option>
        <option value="conversions">Sort by conversions</option>
        <option value="roas">Sort by ROAS</option>
      </select>
      <button onClick={() => set("direction", filters.direction === "asc" ? "desc" : "asc")} className={`${selectClass} flex shrink-0 items-center gap-2`}>
        {filters.direction === "asc" ? <ArrowUpAZ size={14} /> : <ArrowDownAZ size={14} />}
        {filters.direction === "asc" ? "Ascending" : "Descending"}
      </button>
      {Object.entries(filters).some(([key, value]) => !["sort", "direction"].includes(key) && Boolean(value)) && (
        <button onClick={() => onChange({ ...filters, platform: "", status: "", objective: "", owner: "" })} className="shrink-0 px-2 text-xs text-primary hover:text-primary/80">
          Clear filters
        </button>
      )}
    </div>
  );
}