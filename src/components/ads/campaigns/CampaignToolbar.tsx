"use client";

import { Download, Grid2X2, List, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
  view: "table" | "card";
  onViewChange: (view: "table" | "card") => void;
  onExport: () => void;
}

export function CampaignToolbar({ query, onQueryChange, view, onViewChange, onExport }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/80 p-3 shadow-sm lg:flex-row lg:items-center">
      <label className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-border bg-card/50 px-3 text-muted-foreground">
        <Search size={16} />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search name, platform or objective…"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
        />
      </label>
      <div className="flex items-center gap-2">
        <div className="flex rounded-xl border border-border bg-card p-1">
          <button
            onClick={() => onViewChange("table")}
            aria-label="Table view"
            className={`rounded-lg p-2 transition-colors ${view === "table" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => onViewChange("card")}
            aria-label="Card view"
            className={`rounded-lg p-2 transition-colors ${view === "card" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Grid2X2 size={16} />
          </button>
        </div>
        <Button onClick={onExport} variant="outline" size="sm">
          <Download size={14} /> Export
        </Button>
        <Link href="/dashboard/ads/campaigns/new">
          <Button variant="primary" size="sm">
            <Plus size={14} /> New campaign
          </Button>
        </Link>
      </div>
    </div>
  );
}