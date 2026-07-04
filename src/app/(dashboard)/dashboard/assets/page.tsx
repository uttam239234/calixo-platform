"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  Image, FileText, Video, Music, FileSpreadsheet, Presentation, File, Package,
  Search, ChevronRight, Download, Copy, Layers, Clock, Shield, Users,
  Folder, Grid, List, Filter, Plus, Trash2, History, ExternalLink, Tag, BarChart3,
} from "lucide-react";
import { AssetEngine } from "@/core/assets/AssetEngine";
import type { AssetEntry, AssetType, AssetCollection } from "@/core/assets/types";

const TABS = ["Overview","Assets","Collections","Relationships","Versions","History","Export"] as const;
type Tab = typeof TABS[number];

const TYPE_ICONS: Record<string, React.ComponentType<{size?:number;className?:string}>> = {
  image: Image, video: Video, audio: Music, document: FileText, spreadsheet: FileSpreadsheet,
  presentation: Presentation, pdf: FileText, "content-doc": FileText, "creative-doc": FileText,
  template: Layers, prompt: File, "brand-asset": Package, "campaign-resource": Package, font: File, code: File, archive: Package,
};

export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [copied, setCopied] = useState(false);

  const allAssets = useMemo(() => AssetEngine.getAll(), []);
  const filtered = useMemo(() => {
    let res = allAssets;
    if (search) res = AssetEngine.search(search);
    if (filterType !== "all") res = res.filter(a => a.type === filterType);
    return res.slice(0, 50);
  }, [search, filterType, allAssets]);

  const typeCounts = useMemo(() => AssetEngine.typeCounts(), []);
  const collections = useMemo(() => AssetEngine.getCollections(), []);
  const relationships = useMemo(() => AssetEngine.getAllRelationships(), []);
  const allVersions = useMemo(() => AssetEngine.getAllVersions(), []);
  const totalAssets = AssetEngine.count();

  const handleExport = (fmt: string) => { navigator.clipboard.writeText(AssetEngine.export(fmt)); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  const selectCls = "h-9 rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 text-xs text-slate-300 outline-none";

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 border border-cyan-500/30"><Package size={20} className="text-cyan-300" /></div>
          <div><h1 className="text-lg font-bold text-white">Enterprise Asset Platform</h1><p className="text-sm text-slate-400">{totalAssets} assets across {Object.keys(typeCounts).length} types</p></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search assets..." className={cn(selectCls, "pl-8 w-48")} /></div>
          <select value={filterType} onChange={e=>setFilterType(e.target.value)} className={cn(selectCls, "w-32")}><option value="all">All Types</option>{Object.keys(typeCounts).map(t=><option key={t} value={t}>{t}</option>)}</select>
        </div>
      </motion.div>

      <div className="flex gap-1 overflow-x-auto pb-2 border-b border-slate-800/60">
        {TABS.map(tab=><button key={tab} onClick={()=>setActiveTab(tab)} className={cn("shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",activeTab===tab?"bg-cyan-500/20 text-cyan-300":"text-slate-400 hover:bg-slate-800/50")}>{tab}</button>)}
      </div>

      <div className="space-y-4">
        {activeTab === "Overview" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(typeCounts).map(([type, count]) => { const Icon = TYPE_ICONS[type] ?? File; return <Card key={type} padding="sm" gradient><div className="flex items-center justify-between"><Icon size={18} className="text-cyan-400" /><span className="text-xs text-slate-500 capitalize">{type.replace("-"," ")}</span></div><p className="text-2xl font-bold text-white mt-2">{count}</p></Card>; })}
            <Card><CardHeader title="Totals" /><CardContent className="text-xs space-y-1 text-slate-300"><p>Assets: {totalAssets}</p><p>Relationships: {relationships.length}</p><p>Collections: {collections.length}</p><p>Versions: {allVersions.length}</p></CardContent></Card>
          </div>
        )}

        {activeTab === "Assets" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(a => { const Icon = TYPE_ICONS[a.type] ?? File; return <Card key={a.id} padding="sm"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/50"><Icon size={18} className="text-cyan-400" /></div><div className="min-w-0"><p className="text-xs text-white truncate">{a.name}</p><p className="text-[10px] text-slate-500">{a.type.replace("-"," ")} • {a.brand ?? "—"}</p><p className="text-[9px] text-slate-600">{a.currentVersion} versions • {a.approvalStatus}</p></div></div></Card>; })}
          </div>
        )}

        {activeTab === "Collections" && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{collections.map(c=><Card key={c.id} padding="sm"><p className="text-sm font-semibold text-white">{c.name}</p><p className="text-[10px] text-slate-500">{c.type} • {c.assetIds.length} assets</p></Card>)}</div>}

        {activeTab === "Relationships" && <p className="text-sm text-slate-500">{relationships.length} relationships defined across assets.</p>}

        {activeTab === "Versions" && <div className="space-y-1.5">{allVersions.slice(0,30).map(v=><div key={v.id} className="flex items-center justify-between p-2 rounded bg-slate-800/20 text-xs"><span className="text-slate-300">{v.assetId}</span><span className="text-slate-500">{v.label}</span><span className="text-[10px] text-slate-600">{new Date(v.createdAt).toLocaleDateString()}</span></div>)}</div>}

        {activeTab === "History" && <div className="space-y-1.5">{AssetEngine.getHistory().slice(0,30).map((h,i)=><div key={i} className="flex justify-between p-2 rounded bg-slate-800/20 text-xs"><span className="text-slate-300">{h.assetId}</span><span className="text-slate-500">{h.action}</span><span className="text-[10px] text-slate-600">{new Date(h.timestamp).toLocaleDateString()}</span></div>)}</div>}

        {activeTab === "Export" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[{fmt:"json",label:"Asset JSON",desc:"50 assets + relationships"}, {fmt:"manifest",label:"Manifest",desc:"Counts + metadata"}].map(e=><Card key={e.fmt} padding="sm" hoverable onClick={()=>handleExport(e.fmt)}><p className="text-sm font-semibold text-white">{e.label}</p><p className="text-[10px] text-slate-500">{e.desc}</p></Card>)}
          </div>
        )}
      </div>
      {copied && <p className="text-[10px] text-emerald-400">Copied to clipboard!</p>}
    </div>
  );
}