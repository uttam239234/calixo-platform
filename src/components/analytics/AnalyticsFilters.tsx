"use client";

import { useState } from "react";
import { Filter, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AnalyticsAudience, AnalyticsChannel, AnalyticsDevice, AnalyticsFilterState, AnalyticsRegion } from "@/core/analytics";

interface FilterOptions {
  channels: AnalyticsChannel[];
  campaigns: string[];
  regions: AnalyticsRegion[];
  devices: AnalyticsDevice[];
  audiences: AnalyticsAudience[];
}

interface AnalyticsFiltersProps {
  filters: AnalyticsFilterState;
  options: FilterOptions;
  activeFilterCount: number;
  onApply: (filters: AnalyticsFilterState) => void;
  onClear: () => void;
}

export function AnalyticsFilters({ filters, options, activeFilterCount, onApply, onClear }: AnalyticsFiltersProps) {
  const [pending, setPending] = useState<AnalyticsFilterState>(filters);
  const [syncedFilters, setSyncedFilters] = useState(filters);

  // Adjust local draft state during render when the committed filters change
  // externally (e.g. Clear) — avoids a set-state-in-effect render cascade.
  if (filters !== syncedFilters) {
    setSyncedFilters(filters);
    setPending(filters);
  }

  const isDirty = JSON.stringify(pending) !== JSON.stringify(filters);

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SlidersHorizontal size={16} className="text-primary" />
          Filters
          {activeFilterCount > 0 && <span className="badge badge-primary">{activeFilterCount} active</span>}
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Channel"
            className="input h-8.5 w-auto text-sm"
            value={pending.channel ?? ""}
            onChange={e => setPending(prev => ({ ...prev, channel: (e.target.value || undefined) as AnalyticsChannel | undefined }))}
          >
            <option value="">All Channels</option>
            {options.channels.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            aria-label="Campaign"
            className="input h-8.5 w-auto text-sm"
            value={pending.campaign ?? ""}
            onChange={e => setPending(prev => ({ ...prev, campaign: e.target.value || undefined }))}
          >
            <option value="">All Campaigns</option>
            {options.campaigns.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            aria-label="Region"
            className="input h-8.5 w-auto text-sm"
            value={pending.region ?? ""}
            onChange={e => setPending(prev => ({ ...prev, region: (e.target.value || undefined) as AnalyticsRegion | undefined }))}
          >
            <option value="">All Regions</option>
            {options.regions.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            aria-label="Device"
            className="input h-8.5 w-auto text-sm"
            value={pending.device ?? ""}
            onChange={e => setPending(prev => ({ ...prev, device: (e.target.value || undefined) as AnalyticsDevice | undefined }))}
          >
            <option value="">All Devices</option>
            {options.devices.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            aria-label="Audience"
            className="input h-8.5 w-auto text-sm"
            value={pending.audience ?? ""}
            onChange={e => setPending(prev => ({ ...prev, audience: (e.target.value || undefined) as AnalyticsAudience | undefined }))}
          >
            <option value="">All Audiences</option>
            {options.audiences.map(a => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              <X size={14} />
              Clear
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onApply(pending)} disabled={!isDirty}>
            <Filter size={14} />
            Apply
          </Button>
        </div>
      </div>
    </section>
  );
}
