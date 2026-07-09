"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, FileText, Radio, Sparkles, Plus } from "lucide-react";
import { useSocial } from "@/features/social/SocialProvider";
import { recordSocialUsage, trackSocialAction } from "@/core/social";

interface CommandItem {
  id: string;
  label: string;
  hint: string;
  group: "Posts" | "Accounts" | "Recommendations" | "Quick Actions";
  action: () => void;
}

const GROUP_ICON: Record<CommandItem["group"], typeof Search> = {
  Posts: FileText,
  Accounts: Radio,
  Recommendations: Sparkles,
  "Quick Actions": Plus,
};

/**
 * Self-contained: owns its own open state and global Cmd+K/Ctrl+K listener, mirroring Ads
 * Manager's `AdsCommandPalette` — mounted once in `dashboard/social/layout.tsx` alongside
 * `SocialProvider`, which wraps every Social route (dashboard, calendar, analytics, inbox,
 * competitors), so posts/accounts/recommendations are available regardless of which sub-page is
 * open.
 */
export function SocialCommandPalette() {
  const router = useRouter();
  const { posts, accounts, recommendations, tenantContext } = useSocial();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const toggle = () =>
      setOpen(v => {
        if (!v) {
          recordSocialUsage(tenantContext, "social.dashboardView");
          trackSocialAction("search");
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
    window.addEventListener("social-command-palette:toggle", toggle);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeydown);
      window.removeEventListener("social-command-palette:toggle", toggle);
    };
  }, [tenantContext]);

  useEffect(() => {
    (async () => {
      if (!open) setQuery("");
    })();
  }, [open]);

  const items = useMemo<CommandItem[]>(() => {
    const postItems: CommandItem[] = posts.map(post => ({
      id: `post-${post.id}`,
      label: post.content.slice(0, 60) || "Untitled post",
      hint: `${post.platform} · ${post.status}`,
      group: "Posts",
      action: () => router.push("/dashboard/social/calendar"),
    }));
    const accountItems: CommandItem[] = accounts.map(account => ({
      id: `account-${account.id}`,
      label: account.platform,
      hint: `${account.status} · ${account.followers.toLocaleString()} followers`,
      group: "Accounts",
      action: () => document.getElementById("connected-accounts")?.scrollIntoView({ behavior: "smooth", block: "start" }),
    }));
    const recommendationItems: CommandItem[] = recommendations.filter(r => !r.applied).map(rec => ({
      id: `rec-${rec.id}`,
      label: rec.title,
      hint: rec.description,
      group: "Recommendations",
      action: () => document.getElementById("ai-recommendations")?.scrollIntoView({ behavior: "smooth", block: "start" }),
    }));
    const quickActionItems: CommandItem[] = [
      { id: "action-compose", label: "Compose a new post", hint: "Open the multi-platform composer", group: "Quick Actions", action: () => router.push("/dashboard/social/compose") },
      { id: "action-calendar", label: "View content calendar", hint: "Day, week, month, and agenda views", group: "Quick Actions", action: () => router.push("/dashboard/social/calendar") },
      { id: "action-analytics", label: "View social analytics", hint: "Engagement, reach, and platform performance", group: "Quick Actions", action: () => router.push("/dashboard/social/analytics") },
      { id: "action-inbox", label: "View inbox", hint: "Comments, replies, and mentions", group: "Quick Actions", action: () => router.push("/dashboard/social/inbox") },
      { id: "action-competitors", label: "View competitors", hint: "Competitive intelligence and benchmarking", group: "Quick Actions", action: () => router.push("/dashboard/social/competitors") },
    ];

    const all = [...postItems, ...accountItems, ...recommendationItems, ...quickActionItems];
    const q = query.trim().toLowerCase();
    return q ? all.filter(i => i.label.toLowerCase().includes(q) || i.hint.toLowerCase().includes(q)) : all;
  }, [query, posts, accounts, recommendations, router]);

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
            placeholder="Search posts, accounts, recommendations…"
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
