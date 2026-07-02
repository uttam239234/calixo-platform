import Link from "next/link";
import { Download, Grid2X2, List, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props { query: string; onQueryChange: (value: string) => void; view: "table" | "card"; onViewChange: (view: "table" | "card") => void; onExport: () => void; }

export function CampaignToolbar({ query, onQueryChange, view, onViewChange, onExport }: Props) {
  return <div className="sticky top-0 z-20 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/90 p-3 shadow-xl backdrop-blur-xl lg:flex-row lg:items-center">
    <label className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 text-slate-400"><Search size={16} /><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search name, platform or objective…" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" /></label>
    <div className="flex items-center gap-2"><div className="flex rounded-xl border border-slate-700 bg-slate-900 p-1"><button onClick={() => onViewChange("table")} aria-label="Table view" className={`rounded-lg p-2 ${view === "table" ? "bg-cyan-500/15 text-cyan-300" : "text-slate-500 hover:text-white"}`}><List size={16} /></button><button onClick={() => onViewChange("card")} aria-label="Card view" className={`rounded-lg p-2 ${view === "card" ? "bg-cyan-500/15 text-cyan-300" : "text-slate-500 hover:text-white"}`}><Grid2X2 size={16} /></button></div><Button onClick={onExport} variant="outline" className="h-10 border-slate-700 bg-slate-900 text-slate-300"><Download /> Export</Button><Button asChild className="h-10 bg-cyan-400 px-4 text-slate-950 hover:bg-cyan-300"><Link href="/dashboard/ads/campaigns/new"><Plus /> New campaign</Link></Button></div>
  </div>;
}
