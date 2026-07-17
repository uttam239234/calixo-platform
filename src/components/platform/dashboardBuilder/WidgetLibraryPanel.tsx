"use client";

/**
 * Calixo Platform - Generic Widget Library Panel
 *
 * Shared, reusable UI for any module built on the
 * `core/platform/dashboardBuilder` registry. The widget catalog and group
 * ordering are module-specific, so they're passed as props rather than
 * imported — this component owns zero knowledge of any one module's
 * widget vocabulary.
 */

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Search, Eye, EyeOff, Pin, PinOff, ArrowUp, ArrowDown, X, Plus } from "lucide-react";
import type { DashboardWidgetCatalogEntry, DashboardWidgetConfig } from "@/core/platform/dashboardBuilder";

interface WidgetLibraryPanelProps<TKey extends string> {
  widgets: DashboardWidgetConfig<TKey>[];
  catalog: DashboardWidgetCatalogEntry<TKey>[];
  groups: readonly string[];
  readOnly: boolean;
  onChange: (widgets: DashboardWidgetConfig<TKey>[]) => void;
  /** Places a brand-new instance of a catalog widget that currently has zero instances on this layout (e.g. after "Remove") — real server round-trip via `addDashboardWidgetAction`, not a local-only add. */
  onAdd: (key: TKey) => void;
  onClose: () => void;
}

export default function WidgetLibraryPanel<TKey extends string>({ widgets, catalog, groups, readOnly, onChange, onAdd, onClose }: WidgetLibraryPanelProps<TKey>) {
  const [query, setQuery] = useState("");

  const ordered = useMemo(() => [...widgets].sort((a, b) => a.order - b.order), [widgets]);

  const filteredCatalog = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter(c => !q || c.label.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }, [query, catalog]);

  const configFor = (key: TKey) => ordered.find(w => w.key === key);

  function toggleVisible(key: TKey) {
    onChange(widgets.map(w => (w.key === key ? { ...w, visible: !w.visible } : w)));
  }

  function togglePinned(key: TKey) {
    onChange(widgets.map(w => (w.key === key ? { ...w, pinned: !w.pinned } : w)));
  }

  function move(key: TKey, direction: -1 | 1) {
    const sorted = [...widgets].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex(w => w.key === key);
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    [sorted[index], sorted[target]] = [sorted[target], sorted[index]];
    onChange(sorted.map((w, i) => ({ ...w, order: i })));
  }

  return (
    <Card className="border-primary/20">
      <CardHeader
        title="Widget Library"
        description="Show, hide, pin, and reorder this dashboard's widgets"
        action={
          <Button variant="ghost" size="icon-sm" aria-label="Close" onClick={onClose}>
            <X size={16} />
          </Button>
        }
      />
      <CardContent>
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
          <Search size={15} className="text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search widgets…" className="w-full bg-transparent text-sm outline-none" />
        </div>

        <div className="space-y-5">
          {groups.map(group => {
            const entries = filteredCatalog.filter(c => c.group === group);
            if (entries.length === 0) return null;
            return (
              <div key={group}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{group}</p>
                <div className="space-y-2">
                  {entries.map(entry => {
                    const config = configFor(entry.key);
                    if (!config) {
                      return (
                        <div key={entry.key} className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border/60 bg-card/30 px-3 py-2.5">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">{entry.label}</p>
                            <p className="truncate text-xs text-muted-foreground">{entry.description}</p>
                          </div>
                          <Button variant="outline" size="sm" className="flex-shrink-0 gap-1" disabled={readOnly} onClick={() => onAdd(entry.key)}>
                            <Plus size={13} />
                            Add
                          </Button>
                        </div>
                      );
                    }
                    return (
                      <div key={entry.key} className={`flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/50 px-3 py-2.5 ${!config.visible ? "opacity-50" : ""}`}>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{entry.label}</p>
                          <p className="truncate text-xs text-muted-foreground">{entry.description}</p>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-0.5">
                          <button aria-label="Move up" disabled={readOnly} onClick={() => move(entry.key, -1)} className="rounded p-1.5 hover:bg-accent disabled:opacity-30">
                            <ArrowUp size={14} />
                          </button>
                          <button aria-label="Move down" disabled={readOnly} onClick={() => move(entry.key, 1)} className="rounded p-1.5 hover:bg-accent disabled:opacity-30">
                            <ArrowDown size={14} />
                          </button>
                          <button aria-label={config.pinned ? "Unpin" : "Pin"} disabled={readOnly} onClick={() => togglePinned(entry.key)} className="rounded p-1.5 hover:bg-accent disabled:opacity-30">
                            {config.pinned ? <PinOff size={14} className="text-primary" /> : <Pin size={14} />}
                          </button>
                          <button aria-label={config.visible ? "Hide" : "Show"} disabled={readOnly} onClick={() => toggleVisible(entry.key)} className="rounded p-1.5 hover:bg-accent disabled:opacity-30">
                            {config.visible ? <Eye size={14} /> : <EyeOff size={14} className="text-muted-foreground" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
