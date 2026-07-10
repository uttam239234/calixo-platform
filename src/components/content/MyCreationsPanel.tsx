"use client";

import { Clock, ImageOff } from "lucide-react";
import { useContentStudio } from "@/features/content/ContentStudioProvider";
import type { GenerationHistoryEntry } from "@/core/content";

interface MyCreationsPanelProps {
  kind: "creative" | "content";
  onSelect: (entry: GenerationHistoryEntry) => void;
}

/** Replaces the old static "Library" tab — a real history view backed by the generation-history store, scoped inside each Studio rather than a separate top-level tab. */
export function MyCreationsPanel({ kind, onSelect }: MyCreationsPanelProps) {
  const { history } = useContentStudio();
  const entries = history.filter(entry => entry.kind === kind);

  if (entries.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border p-8 text-center">
        <ImageOff size={24} className="mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Nothing created here yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-2">
      {entries.map(entry => (
        <button
          key={entry.id}
          onClick={() => onSelect(entry)}
          className="rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/30"
        >
          {entry.kind === "creative" && entry.primaryImageUrl && (
            <img src={entry.primaryImageUrl} alt={entry.outputLabel} className="mb-2 h-28 w-full rounded-lg object-cover" />
          )}
          <p className="truncate text-sm font-semibold text-foreground">{entry.outputLabel}</p>
          <p className="truncate text-xs text-muted-foreground">{entry.brief.objective || "No objective set"}</p>
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock size={11} /> {new Date(entry.createdAt).toLocaleString()}
          </p>
        </button>
      ))}
    </div>
  );
}
