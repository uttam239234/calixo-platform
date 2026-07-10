"use client";

import Link from "next/link";
import { ModuleTabs, type ModuleTab } from "@/components/enterprise/module";
import { Bot, Palette, PenSquare, Search, Sparkles, Video } from "lucide-react";

const navItems: ModuleTab[] = [
  { id: "assistant", label: "AI Assistant", href: "/dashboard/content", icon: Bot },
  { id: "creative", label: "Creative Design Studio", href: "/dashboard/content/creative", icon: Palette },
  { id: "create", label: "Content Creation Studio", href: "/dashboard/content/create", icon: PenSquare },
  { id: "video", label: "Video Studio", href: "/dashboard/content/video", icon: Video },
];

/**
 * Exactly 4 top-level products, per the rebuild brief. Brand Kit is real, working functionality
 * (`BrandKitEngine`) but isn't one of the 4 products — it stays reachable as a small secondary
 * link rather than a `ModuleTabs` entry, so the primary nav count stays at 4.
 */
export function ContentSubNav() {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <ModuleTabs tabs={navItems} baseUrl="/dashboard/content" />
      </div>
      <Link
        href="/dashboard/content/brand-kit"
        className="hidden h-10 shrink-0 items-center gap-2 rounded-xl border border-border bg-surface/70 px-3.5 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground sm:flex"
      >
        <Sparkles size={15} />
        <span>Brand Kit</span>
      </Link>
      <button
        onClick={() => window.dispatchEvent(new Event("content-command-palette:toggle"))}
        className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-border bg-surface/70 px-3.5 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
      >
        <Search size={15} />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded-md border border-border bg-surface/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">⌘K</kbd>
      </button>
    </div>
  );
}
