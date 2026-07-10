"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Bot, FileText, History, Megaphone, Search, Sparkles } from "lucide-react";
import { copilotPlatformAPI, trackCopilotAction } from "@/core/copilot";
import { reportsPlatformAPI } from "@/core/reports";
import { adsPlatformAPI } from "@/core/ads";
import { assetsPlatformAPI } from "@/core/assets";

interface CommandItem {
  id: string;
  label: string;
  hint: string;
  group: "Actions" | "Reports" | "Campaigns" | "Assets" | "Recommendations";
  action: () => void;
}

const GROUP_ICON: Record<CommandItem["group"], typeof Search> = {
  Actions: Sparkles,
  Reports: FileText,
  Campaigns: Megaphone,
  Assets: History,
  Recommendations: Bot,
};

/** Self-contained: owns its own open state and global Cmd+K/Ctrl+K listener, mirroring `ContentCommandPalette` — mounted once in `dashboard/ai/layout.tsx`. Searches across every module Copilot can route to, not just conversations. */
export function CopilotCommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const toggle = () =>
      setOpen(v => {
        if (!v) trackCopilotAction("search");
        return !v;
      });
    function handleGlobalKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
    }
    window.addEventListener("keydown", handleGlobalKeydown);
    window.addEventListener("copilot-command-palette:toggle", toggle);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeydown);
      window.removeEventListener("copilot-command-palette:toggle", toggle);
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (!open) setQuery("");
    })();
  }, [open]);

  const items = useMemo<CommandItem[]>(() => {
    const actionItems: CommandItem[] = copilotPlatformAPI.listActions().map(a => ({
      id: `action-${a.id}`,
      label: a.name,
      hint: a.description,
      group: "Actions",
      action: () => window.dispatchEvent(new CustomEvent("copilot-command-palette:insert-prompt", { detail: a.name })),
    }));
    const reportItems: CommandItem[] = reportsPlatformAPI.listReportSummaries().map(r => ({
      id: `report-${r.id}`,
      label: r.name,
      hint: `${r.category} report`,
      group: "Reports",
      action: () => router.push("/dashboard/reports"),
    }));
    const campaignItems: CommandItem[] = adsPlatformAPI
      .listCampaigns()
      .slice(0, 10)
      .map(c => ({ id: `campaign-${c.id}`, label: c.name, hint: `${c.status} · $${c.spend.toLocaleString()} spent`, group: "Campaigns" as const, action: () => router.push("/dashboard/ads") }));
    const assetItems: CommandItem[] = assetsPlatformAPI
      .listAssetSummaries()
      .slice(0, 10)
      .map(a => ({ id: `asset-${a.id}`, label: a.name, hint: a.type, group: "Assets" as const, action: () => router.push("/dashboard/assets") }));

    const all = [...actionItems, ...campaignItems, ...reportItems, ...assetItems];
    const q = query.trim().toLowerCase();
    return q ? all.filter(i => i.label.toLowerCase().includes(q) || i.hint.toLowerCase().includes(q)) : all;
  }, [query, router]);

  useEffect(() => {
    (async () => {
      setActiveIndex(0);
    })();
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, items.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
      }
      if (e.key === "Enter") {
        const item = items[activeIndex];
        if (item) {
          item.action();
          setOpen(false);
        }
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open, items, activeIndex]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/40 pt-[12vh]" onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search size={16} className="text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search actions, campaigns, reports, assets…"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">Esc</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {items.length === 0 && <p className="px-3 py-6 text-center text-sm text-muted-foreground">No matches</p>}
          {items.map((item, index) => {
            const GroupIcon = GROUP_ICON[item.group];
            return (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  setOpen(false);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${index === activeIndex ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-surface/60"}`}
              >
                <GroupIcon size={15} className="text-primary" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{item.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{item.hint}</span>
                </span>
                <ArrowRight size={13} className="text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
