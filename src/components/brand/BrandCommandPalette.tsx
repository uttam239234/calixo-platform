"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, MessageSquare, Users, Hash, Bell, FileText, Sparkles } from "lucide-react";
import { useBrandMonitoring } from "@/features/brand/BrandMonitoringProvider";
import { recordReputationUsage, trackReputationAction } from "@/core/reputation";

interface CommandItem {
  id: string;
  label: string;
  hint: string;
  group: "Mentions" | "Competitors" | "Keywords" | "Alerts" | "Reports" | "Insights";
  action: () => void;
}

const GROUP_ICON: Record<CommandItem["group"], typeof Search> = {
  Mentions: MessageSquare,
  Competitors: Users,
  Keywords: Hash,
  Alerts: Bell,
  Reports: FileText,
  Insights: Sparkles,
};

/**
 * Self-contained: owns its own open state and global Cmd+K/Ctrl+K listener, mirroring Social
 * Media's `SocialCommandPalette` — mounted once in `dashboard/brand/layout.tsx` alongside
 * `BrandMonitoringProvider`, which wraps every Brand Monitoring route.
 */
export function BrandCommandPalette() {
  const router = useRouter();
  const { mentions, competitors, settings, crisisAlerts, reports, insights, tenantContext } = useBrandMonitoring();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const toggle = () =>
      setOpen(v => {
        if (!v) {
          recordReputationUsage(tenantContext, "reputation.dashboardView");
          trackReputationAction("search");
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
    window.addEventListener("brand-command-palette:toggle", toggle);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeydown);
      window.removeEventListener("brand-command-palette:toggle", toggle);
    };
  }, [tenantContext]);

  useEffect(() => {
    (async () => {
      if (!open) setQuery("");
    })();
  }, [open]);

  const items = useMemo<CommandItem[]>(() => {
    const mentionItems: CommandItem[] = mentions.slice(0, 30).map(mention => ({
      id: `mention-${mention.id}`,
      label: mention.content.slice(0, 60) || "Untitled mention",
      hint: `${mention.platform} · ${mention.sentiment}`,
      group: "Mentions",
      action: () => router.push("/dashboard/brand/mentions"),
    }));
    const competitorItems: CommandItem[] = competitors.map(c => ({
      id: `competitor-${c.id}`,
      label: c.name,
      hint: `${c.shareOfVoice}% share of voice`,
      group: "Competitors",
      action: () => router.push("/dashboard/brand/competitors"),
    }));
    const keywordItems: CommandItem[] = settings.trackedKeywords.map(keyword => ({
      id: `keyword-${keyword}`,
      label: keyword,
      hint: "Tracked keyword",
      group: "Keywords",
      action: () => router.push("/dashboard/brand/settings"),
    }));
    const alertItems: CommandItem[] = crisisAlerts.filter(a => !a.isResolved).map(alert => ({
      id: `alert-${alert.id}`,
      label: alert.title,
      hint: `Risk score ${alert.riskScore}`,
      group: "Alerts",
      action: () => router.push("/dashboard/brand/crisis"),
    }));
    const reportItems: CommandItem[] = reports.map(report => ({
      id: `report-${report.id}`,
      label: report.name,
      hint: `${report.type} · ${report.format}`,
      group: "Reports",
      action: () => router.push("/dashboard/brand/reports"),
    }));
    const insightItems: CommandItem[] = insights.map(insight => ({
      id: `insight-${insight.id}`,
      label: insight.title,
      hint: insight.type,
      group: "Insights",
      action: () => router.push("/dashboard/brand/insights"),
    }));

    const all = [...mentionItems, ...competitorItems, ...keywordItems, ...alertItems, ...reportItems, ...insightItems];
    const q = query.trim().toLowerCase();
    return q ? all.filter(i => i.label.toLowerCase().includes(q) || i.hint.toLowerCase().includes(q)) : all;
  }, [query, mentions, competitors, settings, crisisAlerts, reports, insights, router]);

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
            placeholder="Search mentions, competitors, keywords, alerts…"
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
