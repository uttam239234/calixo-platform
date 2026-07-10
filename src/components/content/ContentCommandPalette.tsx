"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Bot, History, Image as ImageIcon, PenSquare, Search, Sparkles } from "lucide-react";
import { useContentStudio } from "@/features/content/ContentStudioProvider";
import { trackContentAction } from "@/core/content";

interface CommandItem {
  id: string;
  label: string;
  hint: string;
  group: "Creative" | "Content" | "My Creations" | "Brand Kit";
  action: () => void;
}

const GROUP_ICON: Record<CommandItem["group"], typeof Search> = {
  Creative: ImageIcon,
  Content: PenSquare,
  "My Creations": History,
  "Brand Kit": Sparkles,
};

/** Self-contained: owns its own open state and global Cmd+K/Ctrl+K listener, mirroring `BrandCommandPalette`/`SocialCommandPalette` — mounted once in `dashboard/content/layout.tsx`. */
export function ContentCommandPalette() {
  const router = useRouter();
  const { creativeCatalog, contentCatalog, history } = useContentStudio();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const toggle = () =>
      setOpen(v => {
        if (!v) trackContentAction("search");
        return !v;
      });
    function handleGlobalKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
    }
    window.addEventListener("keydown", handleGlobalKeydown);
    window.addEventListener("content-command-palette:toggle", toggle);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeydown);
      window.removeEventListener("content-command-palette:toggle", toggle);
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (!open) setQuery("");
    })();
  }, [open]);

  const items = useMemo<CommandItem[]>(() => {
    const creativeItems: CommandItem[] = creativeCatalog.map(entry => ({
      id: `creative-${entry.id}`,
      label: entry.label,
      hint: entry.description,
      group: "Creative",
      action: () => router.push(`/dashboard/content/creative?output=${entry.id}`),
    }));
    const contentItems: CommandItem[] = contentCatalog.map(entry => ({
      id: `content-${entry.id}`,
      label: entry.label,
      hint: entry.description,
      group: "Content",
      action: () => router.push(`/dashboard/content/create?output=${entry.id}`),
    }));
    const historyItems: CommandItem[] = history.slice(0, 20).map(entry => ({
      id: `history-${entry.id}`,
      label: entry.outputLabel,
      hint: entry.brief.objective || "My Creations",
      group: "My Creations",
      action: () => router.push(entry.kind === "creative" ? `/dashboard/content/creative?panel=history` : `/dashboard/content/create?panel=history`),
    }));
    const brandKitItem: CommandItem[] = [
      { id: "brand-kit", label: "Brand Kit", hint: "Manage brand colors, voice, and logos", group: "Brand Kit", action: () => router.push("/dashboard/content/brand-kit") },
    ];

    const all = [...creativeItems, ...contentItems, ...historyItems, ...brandKitItem];
    const q = query.trim().toLowerCase();
    return q ? all.filter(i => i.label.toLowerCase().includes(q) || i.hint.toLowerCase().includes(q)) : all;
  }, [query, creativeCatalog, contentCatalog, history, router]);

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
          <Bot size={16} className="text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search creative types, content types, your creations…"
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
