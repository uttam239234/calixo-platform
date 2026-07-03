"use client";

import { Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const filters = ["Date Range", "Platform", "Campaign", "Region", "Device", "Audience"];

export function AnalyticsFilters() {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SlidersHorizontal size={16} className="text-primary" />
          Filters
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className="rounded-full border border-border bg-surface/50 px-3 py-1.5 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground hover:bg-accent"
            >
              {filter}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm">
          <Filter size={14} />
          Apply
        </Button>
      </div>
    </section>
  );
}