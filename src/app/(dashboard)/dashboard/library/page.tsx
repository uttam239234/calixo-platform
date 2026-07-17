"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  Library, Search, Grid, List, Image, Clock, Filter, X, ChevronRight, Download, Copy, Layers,
  Folder, Star, Archive, Users, Tag, Calendar, ArrowUpDown, Eye, ExternalLink, MoreHorizontal,
  FileText, Video, Music, FileSpreadsheet, Presentation, File, Package, BarChart3, Shield,
  History, GitBranch, ChevronDown, ChevronUp, Plus, Trash2, MoveRight, Sparkles, Zap, Wand2,
} from "lucide-react";
import { LibraryEngine } from "@/core/library/LibraryEngine";
import type { AssetEntry } from "@/core/assets/types";
import type { ViewMode, SortField, SortOrder, LibraryFilter } from "@/core/library/types";

const VIEWS: { mode: ViewMode; label: string; icon: React.ComponentType<{size?:number;className?:string}> }[] = [
  { mode: "grid", label: "Grid", icon: Grid }, { mode: "gallery", label: "Gallery", icon: Image }, { mode: "list", label: "List", icon: List }, { mode: "timeline", label: "Timeline", icon: Clock },
];
const TYPE_ICONS: Record<string, React.ComponentType<{size?:number;className?:string}>> = {
  image: Image, video: Video, audio: Music, document: FileText, spreadsheet: FileSpreadsheet,
  presentation: Presentation, pdf: FileText, "content-doc": FileText, "creative-doc": FileText,
  template: Layers, prompt: File, "brand-asset": Package, "campaign-resource": Package, font: File, code: File, archive: Package,
};

const selectCls = "h-8 rounded-lg border border-slate-700/60 bg-slate-900/70 px-2 text-[11px] text-slate-300 outline-none";

export default function LibraryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<LibraryFilter>({});
  const [sort, setSort] = useState<{ field: SortField; order: SortOrder }>({ field: "updatedAt", order: "desc" });
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [linkCopied, setLinkCopied] = useState(false);

  const result = useMemo(() => LibraryEngine.search(searchQuery, filters, sort), [searchQuery, filters, sort]);
  const selectedAsset = useMemo(() => selectedAssetId ? LibraryEngine.getAsset(selectedAssetId) : undefined, [selectedAssetId]);
  const relationships = useMemo(() => selectedAssetId ? LibraryEngine.getRelationships(selectedAssetId) : [], [selectedAssetId]);
  const versions = useMemo(() => selectedAssetId ? LibraryEngine.getVersions(selectedAssetId) : [], [selectedAssetId]);
  const collections = useMemo(() => LibraryEngine.getCollections(), []);
  const recentAssets = useMemo(() => LibraryEngine.getRecent(), []);

  // Cmd+K toggles command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdPaletteOpen(v => !v); } };
    window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleFilterChange = (key: keyof LibraryFilter, value: string) => setFilters(prev => ({ ...prev, [key]: value || undefined }));
  const handleSelectAsset = useCallback((id: string) => { setSelectedAssetId(id); setShowDetails(true); }, []);
  const toggleSelect = (id: string) => { const next = new Set(selectedIds); if (next.has(id)) next.delete(id); else next.add(id); setSelectedIds(next); };

  const handleCopyLink = async (asset: AssetEntry) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/dashboard/library?asset=${asset.id}`);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // clipboard permission denied — link simply isn't copied, no further action needed
    }
  };

  const handleDownload = (asset: AssetEntry) => {
    if (asset.fileUrl || asset.preview) {
      const a = document.createElement("a");
      a.href = asset.fileUrl ?? asset.preview!;
      a.download = asset.name;
      a.click();
      return;
    }
    const blob = new Blob([JSON.stringify(asset, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${asset.name.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cmdResults = useMemo(() => {
    if (!cmdQuery) return [];
    const q = cmdQuery.toLowerCase();
    const results: { id: string; type: string; label: string; icon: React.ComponentType<any> }[] = [];
    LibraryEngine.search(q, {}, { field: "updatedAt", order: "desc" }).assets.slice(0, 8).forEach(a => results.push({ id: a.id, type: "asset", label: a.name, icon: TYPE_ICONS[a.type] ?? File }));
    collections.slice(0, 4).forEach(c => results.push({ id: c.id, type: "collection", label: c.name, icon: Folder }));
    return results;
  }, [cmdQuery, collections]);

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0 flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 border border-cyan-500/30"><Library size={18} className="text-cyan-300" /></div>
          <div><h1 className="text-lg font-bold text-white">Marketing Resource Hub</h1><p className="text-[11px] text-slate-400">{result.totalCount} resources found</p></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900/80 rounded-lg p-0.5 border border-slate-700/50">
            {VIEWS.map(v => <button key={v.mode} onClick={() => setViewMode(v.mode)} className={cn("p-1.5 rounded-md", viewMode === v.mode ? "bg-cyan-500/20 text-cyan-300" : "text-slate-500 hover:text-slate-300")}><v.icon size={15} /></button>)}
          </div>
          <button onClick={() => setShowFilters(v => !v)} className={cn("p-1.5 rounded-lg hover:bg-slate-800", showFilters ? "text-cyan-400" : "text-slate-500")}><Filter size={15} /></button>
          <div className="relative"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" /><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search resources... (Ctrl+K)" className={cn(selectCls, "pl-8 w-48")} /></div>
        </div>
      </motion.div>

      {/* Filters bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="flex-shrink-0 overflow-hidden mb-3">
            <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-900/40 border border-slate-700/40">
              <select value={filters.brand ?? ""} onChange={e => handleFilterChange("brand", e.target.value)} className={selectCls}><option value="">All Brands</option>{["Calixo","RGU","Demo Enterprise"].map(b=><option key={b}>{b}</option>)}</select>
              <select value={filters.assetType ?? ""} onChange={e => handleFilterChange("assetType", e.target.value)} className={selectCls}><option value="">All Types</option>{Object.keys(LibraryEngine.countByType()).map(t=><option key={t}>{t}</option>)}</select>
              <select value={filters.createdBy ?? ""} onChange={e => handleFilterChange("createdBy", e.target.value)} className={selectCls}><option value="">All Creators</option>{["Sarah Chen","Marcus Rivera","Emily Park","David Kim"].map(u=><option key={u}>{u}</option>)}</select>
              <select value={sort.field} onChange={e => setSort(s => ({ ...s, field: e.target.value as SortField }))} className={selectCls}><option value="updatedAt">Updated</option><option value="createdAt">Created</option><option value="name">Name</option><option value="type">Type</option></select>
              <button onClick={() => setSort(s => ({ ...s, order: s.order === "asc" ? "desc" : "asc" }))} className="p-1.5 rounded hover:bg-slate-700 text-slate-400"><ArrowUpDown size={13} /></button>
              <button onClick={() => setFilters({})} className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1"><X size={11} /> Clear</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Sidebar: collections + quick links */}
        <div className="flex-shrink-0 w-56 overflow-y-auto scrollbar-thin space-y-3">
          <Card>
            <CardHeader title="Collections" />
            <CardContent className="space-y-0.5">
              {[{ label: "Recent", icon: Clock }, { label: "Favorites", icon: Star }, { label: "Archived", icon: Archive }, { label: "Shared", icon: Users }].map(c => <button key={c.label} className="flex items-center gap-2 w-full text-left px-2 py-1 rounded text-[11px] text-slate-400 hover:bg-slate-800/50"><c.icon size={13} />{c.label}</button>)}
              <div className="border-t border-slate-800 mt-2 pt-2">
                {collections.slice(0, 8).map(c => <button key={c.id} onClick={() => handleFilterChange("collectionId", c.id)} className={cn("flex items-center gap-2 w-full text-left px-2 py-1 rounded text-[11px]", filters.collectionId === c.id ? "text-cyan-300 bg-cyan-500/10" : "text-slate-400 hover:bg-slate-800/50")}><Folder size={13} className="text-slate-600" />{c.name}<span className="ml-auto text-slate-600">{c.assetIds.length}</span></button>)}
              </div>
            </CardContent>
          </Card>
          {selectedIds.size > 0 && (
            <Card>
              <CardHeader title="Bulk Actions" description={`${selectedIds.size} selected`} />
              <CardContent><div className="flex flex-wrap gap-1">{["Move","Copy","Archive","Delete","Tag"].map(a=><Button key={a} size="xs" variant="outline" disabled title="Coming soon" className="text-[10px] border-slate-700 h-7 opacity-50">{a}</Button>)}</div></CardContent>
            </Card>
          )}
        </div>

        {/* Asset grid/list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {viewMode === "grid" || viewMode === "gallery" ? (
            <div className={cn("grid gap-3", viewMode === "gallery" ? "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5")}>
              {result.assets.slice(0, 40).map(a => { const Icon = TYPE_ICONS[a.type] ?? File; const isSel = selectedIds.has(a.id);
                return <Card key={a.id} padding="sm" hoverable onClick={() => handleSelectAsset(a.id)} className={cn(isSel && "ring-1 ring-cyan-500")}>
                  <div className="flex items-center gap-2 mb-2" onClick={e => { e.stopPropagation(); toggleSelect(a.id); }}><input type="checkbox" checked={isSel} readOnly className="accent-cyan-500 w-3 h-3" /><Icon size={14} className="text-cyan-400" /></div>
                  {viewMode === "gallery" && <div className="w-full h-24 rounded-lg bg-slate-800/50 mb-2 overflow-hidden"><img src={a.preview} alt={a.name} className="w-full h-full object-cover" /></div>}
                  <p className="text-[11px] text-white truncate">{a.name}</p>
                  <p className="text-[9px] text-slate-500">{a.type.replace("-"," ")} • {a.brand ?? "—"} • v{a.currentVersion}</p>
                </Card>;
              })}
            </div>
          ) : viewMode === "list" ? (
            <div className="space-y-1">
              {result.assets.slice(0, 50).map(a => { const Icon = TYPE_ICONS[a.type] ?? File;
                return <div key={a.id} onClick={() => handleSelectAsset(a.id)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/30 cursor-pointer transition-colors">
                  <input type="checkbox" checked={selectedIds.has(a.id)} onChange={() => toggleSelect(a.id)} onClick={e => e.stopPropagation()} className="accent-cyan-500 w-3 h-3" />
                  <Icon size={16} className="text-cyan-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1"><p className="text-xs text-white truncate">{a.name}</p><p className="text-[9px] text-slate-500">{a.type} • {a.brand} • {a.currentVersion} versions</p></div>
                  <span className="text-[9px] text-slate-600">{new Date(a.updatedAt).toLocaleDateString()}</span>
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full", a.approvalStatus === "approved" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400")}>{a.approvalStatus}</span>
                </div>;
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {result.assets.slice(0, 30).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(a => (
                <div key={a.id} onClick={() => handleSelectAsset(a.id)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/30 cursor-pointer">
                  <Clock size={14} className="text-slate-500" />
                  <div className="flex-1"><p className="text-xs text-white">{a.name}</p><p className="text-[9px] text-slate-500">{new Date(a.createdAt).toLocaleDateString()} • {a.createdBy}</p></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {showDetails && selectedAsset && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="flex-shrink-0 overflow-y-auto scrollbar-thin space-y-3 pl-1" style={{ minWidth: 0, maxWidth: 320 }}>
              <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-white">{selectedAsset.name}</h3><button onClick={() => setShowDetails(false)} className="p-1 rounded hover:bg-slate-700 text-slate-500"><X size={14} /></button></div>
              {selectedAsset.preview && <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-800/50"><img src={selectedAsset.preview} alt={selectedAsset.name} className="w-full h-full object-cover" /></div>}
              <Card><CardHeader title="Metadata" /><CardContent className="text-[10px] space-y-1 text-slate-400">{[{l:"Type",v:selectedAsset.type},{l:"Brand",v:selectedAsset.brand},{l:"Campaign",v:selectedAsset.campaign},{l:"Created",v:new Date(selectedAsset.createdAt).toLocaleDateString()},{l:"Version",v:selectedAsset.currentVersion},{l:"Status",v:selectedAsset.approvalStatus}].map(m=><div key={m.l} className="flex justify-between"><span className="text-slate-600">{m.l}</span><span>{m.v ?? "—"}</span></div>)}</CardContent></Card>
              <Card><CardHeader title="Versions" description={`${versions.length} total`} /><CardContent className="text-[10px] space-y-1">{versions.slice(0,8).map(v=><div key={v.id} className="flex justify-between"><span>{v.label}</span><span className="text-slate-600">{new Date(v.createdAt).toLocaleDateString()}</span></div>)}</CardContent></Card>
              <Card><CardHeader title="Relationships" description={`${relationships.length} links`} /><CardContent className="text-[10px] space-y-1">{relationships.slice(0,6).map(r=><div key={r.id} className="flex items-center gap-1 text-slate-400"><GitBranch size={10} className="text-slate-600" /><span>{r.type}</span><ChevronRight size={10} className="text-slate-600" /></div>)}</CardContent></Card>
              <div className="flex gap-2"><Button size="xs" onClick={() => handleDownload(selectedAsset)} className="gap-1 text-[10px]"><Download size={11} /> Download</Button><Button size="xs" variant="outline" onClick={() => handleCopyLink(selectedAsset)} className="gap-1 text-[10px] border-slate-700">{linkCopied ? "Copied!" : <><Copy size={11} /> Copy Link</>}</Button></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Command Palette overlay */}
      <AnimatePresence>
        {cmdPaletteOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-[15vh]" onClick={() => setCmdPaletteOpen(false)}>
            <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800"><Search size={16} className="text-slate-500" /><input value={cmdQuery} onChange={e => setCmdQuery(e.target.value)} placeholder="Search resources, collections, campaigns..." autoFocus className="flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600" /><kbd className="text-[10px] text-slate-600 bg-slate-800 px-2 py-0.5 rounded">ESC</kbd></div>
              <div className="max-h-72 overflow-y-auto p-2">
                {cmdResults.map(r => <button key={r.id} onClick={() => { setCmdPaletteOpen(false); if (r.type === "asset") handleSelectAsset(r.id); else if (r.type === "collection") handleFilterChange("collectionId", r.id); }} className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/50 text-sm text-slate-300"><r.icon size={15} className="text-cyan-400" /><span className="flex-1">{r.label}</span><span className="text-[10px] text-slate-600">{r.type}</span></button>)}
                {cmdQuery && cmdResults.length === 0 && <p className="text-xs text-slate-600 px-3 py-4">No results found for "{cmdQuery}"</p>}
                {!cmdQuery && <p className="text-xs text-slate-600 px-3 py-4">Start typing to search across all resources...</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}