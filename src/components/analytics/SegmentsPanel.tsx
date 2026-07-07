"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Bookmark, Plus, Trash2, Filter as FilterIcon } from "lucide-react";
import type { AnalyticsFilterState, AnalyticsSegment } from "@/core/analytics";

interface SegmentsPanelProps {
  segments: AnalyticsSegment[];
  currentFilters: AnalyticsFilterState;
  activeFilterCount: number;
  onApply: (filters: AnalyticsFilterState) => void;
  onSave: (name: string, description: string, filters: AnalyticsFilterState) => void;
  onRemove: (id: string) => void;
}

function describeFilters(filters: AnalyticsFilterState): string {
  const parts = Object.entries(filters).filter(([, v]) => v);
  return parts.length ? parts.map(([k, v]) => `${k}: ${v}`).join(", ") : "No filters";
}

export default function SegmentsPanel({ segments, currentFilters, activeFilterCount, onApply, onSave, onRemove }: SegmentsPanelProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");

  return (
    <Card>
      <CardHeader
        title="Saved Segments"
        description="Reusable audience and campaign filter combinations"
        action={
          <Button variant="outline" size="sm" className="gap-1.5" disabled={activeFilterCount === 0} onClick={() => setSaving(v => !v)}>
            <Plus size={14} /> Save Current Filters
          </Button>
        }
      />
      <CardContent>
        {saving && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 p-3">
            <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Segment name" className="input flex-1 text-sm" />
            <Button
              variant="primary"
              size="sm"
              disabled={!name.trim()}
              onClick={() => {
                onSave(name.trim(), describeFilters(currentFilters), currentFilters);
                setName("");
                setSaving(false);
              }}
            >
              Save
            </Button>
          </div>
        )}

        {segments.length === 0 ? (
          <EmptyState icon={<Bookmark size={24} />} title="No saved segments" description="Apply filters above, then save them as a reusable segment." />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {segments.map(segment => (
              <div key={segment.id} className="flex items-start justify-between gap-2 rounded-xl border border-border/60 bg-card/50 p-3">
                <button className="min-w-0 flex-1 text-left" onClick={() => onApply(segment.filters)}>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <FilterIcon size={12} className="text-primary" />
                    {segment.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{segment.description}</p>
                </button>
                <button aria-label="Remove segment" onClick={() => onRemove(segment.id)} className="flex-shrink-0 rounded p-1 text-muted-foreground hover:bg-accent">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
