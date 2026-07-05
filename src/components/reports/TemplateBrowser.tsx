"use client";

import { useMemo, useState } from "react";
import { Copy, Eye, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { REPORT_CATEGORIES } from "@/core/reports";
import type { ReportCategory, ReportTemplate } from "@/core/reports";

interface TemplateBrowserProps {
  templates: ReportTemplate[];
  onClone: (id: string) => void;
  onPreview: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function TemplateBrowser({ templates, onClone, onPreview, onToggleFavorite }: TemplateBrowserProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ReportCategory | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates
      .filter(t => category === "all" || t.category === category)
      .filter(t => !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q)));
  }, [templates, query, category]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search templates..."
            className="h-9 w-full rounded-xl border border-border bg-card pl-8 pr-3 text-sm text-foreground outline-none focus:border-primary/40"
          />
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value as ReportCategory | "all")}
          className="h-9 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary/40"
        >
          <option value="all">All Categories</option>
          {REPORT_CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No templates match your search.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(template => {
            const categoryLabel = REPORT_CATEGORIES.find(c => c.id === template.category)?.label ?? template.category;
            return (
              <div key={template.id} className="card flex flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="badge badge-primary">{categoryLabel}</span>
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(template.id)}
                    className={cn("transition-colors", template.isFavorite ? "text-warning" : "text-muted-foreground/40 hover:text-warning")}
                    aria-label={template.isFavorite ? "Unfavorite" : "Favorite"}
                  >
                    <Star size={14} fill={template.isFavorite ? "currentColor" : "none"} />
                  </button>
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground">{template.name}</p>
                <p className="mt-1 line-clamp-2 flex-1 text-xs text-muted-foreground">{template.description}</p>
                <div className="mt-3 flex gap-1.5">
                  <Button size="xs" variant="outline" onClick={() => onPreview(template.id)} className="flex-1 gap-1">
                    <Eye size={11} /> Preview
                  </Button>
                  <Button size="xs" onClick={() => onClone(template.id)} className="flex-1 gap-1">
                    <Copy size={11} /> Clone
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
