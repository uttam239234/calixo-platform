"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, Search, Video, X } from "lucide-react";
import { assetsPlatformAPI } from "@/core/assets";
import type { MediaAssetSummary } from "@/core/assets";

/**
 * Real Content Studio Asset Library integration (via `assetsPlatformAPI.listMediaAssets()`) —
 * replaces the previous "local file upload only" gap in `MediaUploader.tsx`. Social Media owns
 * no asset storage; this only ever reads through the sanctioned Assets Platform API.
 */
export function AssetLibraryPicker({ onSelect, onClose }: { onSelect: (assets: MediaAssetSummary[]) => void; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const assets = useMemo(() => assetsPlatformAPI.listMediaAssets(undefined, query || undefined), [query]);

  const toggle = (id: string) => setSelected(current => (current.includes(id) ? current.filter(item => item !== id) : [...current, id]));
  const confirm = () => {
    onSelect(assets.filter(asset => selected.includes(asset.id)));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-background/70 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-5 shadow-2xl" onClick={event => event.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Browse Asset Library</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>
        <label className="mt-3 flex h-9 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-muted-foreground">
          <Search size={14} />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search assets…" className="w-full bg-transparent text-sm text-foreground outline-none" />
        </label>
        <div className="mt-4 grid max-h-80 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
          {assets.map(asset => (
            <button key={asset.id} onClick={() => toggle(asset.id)} className={`relative overflow-hidden rounded-xl border transition ${selected.includes(asset.id) ? "border-primary" : "border-border hover:border-border"}`}>
              <div className="relative aspect-video bg-surface">
                {asset.type === "image" ? <Image src={asset.url} alt={asset.name} fill unoptimized className="object-cover" /> : <video src={asset.url} className="h-full w-full object-cover" />}
              </div>
              <span className="flex items-center gap-1 truncate p-1.5 text-[10px] text-muted-foreground">
                {asset.type === "video" ? <Video size={10} /> : <ImageIcon size={10} />} {asset.name}
              </span>
            </button>
          ))}
          {assets.length === 0 && <p className="col-span-full py-8 text-center text-xs text-muted-foreground">No assets match your search.</p>}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
            Cancel
          </button>
          <button onClick={confirm} disabled={selected.length === 0} className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-40">
            Attach{selected.length > 0 ? ` ${selected.length}` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
