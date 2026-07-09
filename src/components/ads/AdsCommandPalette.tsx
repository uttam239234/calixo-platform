"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Megaphone, Radio, Sparkles, Zap, Plus } from "lucide-react";
import { useCampaigns } from "@/features/ads/CampaignProvider";
import { useAdsAutomationRules } from "@/hooks/useAdsAutomationRules";
import { recordAdsUsage, trackAdsAction } from "@/core/ads";

interface CommandItem {
  id: string;
  label: string;
  hint: string;
  group: "Campaigns" | "Platforms" | "Recommendations" | "Automation" | "Quick Actions";
  action: () => void;
}

const GROUP_ICON: Record<CommandItem["group"], typeof Search> = {
  Campaigns: Megaphone,
  Platforms: Radio,
  Recommendations: Sparkles,
  Automation: Zap,
  "Quick Actions": Plus,
};

/**
 * Self-contained: owns its own open state and global Cmd+K/Ctrl+K listener, unlike
 * `AnalyticsCommandPalette`/Dashboard's `CommandPalette` (which are controlled by a single big
 * page component) — Ads Manager has no equivalent shell, so this mounts once in
 * `dashboard/ads/layout.tsx` alongside `CampaignProvider` and reads `useCampaigns()` directly.
 */
export function AdsCommandPalette() {
  const router = useRouter();
  const { campaigns, platforms, recommendations, tenantContext } = useCampaigns();
  const { rules } = useAdsAutomationRules(tenantContext.organizationId);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const toggle = () =>
      setOpen(v => {
        if (!v) {
          recordAdsUsage(tenantContext, "ads.search");
          trackAdsAction("search");
        }
        return !v;
      });
    function handleGlobalKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
    }
    window.addEventListener("keydown", handleGlobalKeydown);
    window.addEventListener("ads-command-palette:toggle", toggle);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeydown);
      window.removeEventListener("ads-command-palette:toggle", toggle);
    };
  }, [tenantContext]);

  useEffect(() => {
    (async () => {
      if (!open) setQuery("");
    })();
  }, [open]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const items = useMemo<CommandItem[]>(() => {
    const campaignItems: CommandItem[] = campaigns.map(c => ({
      id: `campaign-${c.id}`,
      label: c.name,
      hint: `${c.status} · ${c.objective}`,
      group: "Campaigns",
      action: () => router.push(`/dashboard/ads/campaigns/${c.id}`),
    }));
    const platformItems: CommandItem[] = platforms.map(p => ({
      id: `platform-${p.id}`,
      label: p.name,
      hint: `${p.status} · ${p.campaignCount} campaigns`,
      group: "Platforms",
      action: () => scrollTo("recommendation-panel"),
    }));
    const recommendationItems: CommandItem[] = recommendations.filter(r => r.status === "new").map(r => ({
      id: `recommendation-${r.id}`,
      label: r.title,
      hint: r.description,
      group: "Recommendations",
      action: () => scrollTo("recommendation-panel"),
    }));
    const ruleItems: CommandItem[] = rules.map(r => ({
      id: `rule-${r.id}`,
      label: r.name,
      hint: r.description,
      group: "Automation",
      action: () => scrollTo("recommendation-panel"),
    }));
    const quickActionItems: CommandItem[] = [
      { id: "action-new-campaign", label: "Create new campaign", hint: "Launch the campaign wizard", group: "Quick Actions", action: () => router.push("/dashboard/ads/campaigns/new") },
      { id: "action-all-campaigns", label: "View all campaigns", hint: "Full campaign list", group: "Quick Actions", action: () => router.push("/dashboard/ads/campaigns") },
    ];

    const all = [...campaignItems, ...platformItems, ...recommendationItems, ...ruleItems, ...quickActionItems];
    const q = query.trim().toLowerCase();
    return q ? all.filter(i => i.label.toLowerCase().includes(q) || i.hint.toLowerCase().includes(q)) : all;
  }, [query, campaigns, platforms, recommendations, rules, router]);

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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[12vh]" onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search size={16} className="text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search campaigns, platforms, recommendations, rules…"
            className="w-full bg-transparent text-sm outline-none"
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
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${index === activeIndex ? "bg-primary/10 text-foreground" : "text-foreground hover:bg-accent/60"}`}
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
