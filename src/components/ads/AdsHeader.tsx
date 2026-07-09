"use client";

import { CalendarDays, Download, Plus, RefreshCw, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AdsHeader() {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-primary" />
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">AI Advertising Command Center</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Ads Manager</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage every advertising platform from one workspace.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => window.dispatchEvent(new Event("ads-command-palette:toggle"))}
          className="flex items-center gap-2 rounded-2xl border border-border bg-card/50 px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
        >
          <Search size={15} className="text-muted-foreground/70" />
          <span className="text-muted-foreground/60">Search campaigns...</span>
          <kbd className="rounded-md border border-border bg-background/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/60">⌘K</kbd>
        </button>
        <Button variant="outline" size="sm">
          <CalendarDays size={14} />
          Jul 1–31
        </Button>
        <Button variant="outline" size="sm">
          <RefreshCw size={14} />
        </Button>
        <Link href="/dashboard/ads/campaigns/new">
          <Button variant="primary" size="sm">
            <Plus size={14} />
            Create Campaign
          </Button>
        </Link>
        <Button variant="outline" size="sm">
          <Download size={14} />
          Export
        </Button>
      </div>
    </div>
  );
}