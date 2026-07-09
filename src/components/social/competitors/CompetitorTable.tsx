"use client";
import {
  Edit3,
  Trash2,
  BarChart3,
  Star,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompetitors } from "@/features/social/competitors/CompetitorProvider";
import type { Competitor } from "@/features/social/competitors/types";

const platformIcons: Record<string, string> = {
  Instagram: "📸",
  LinkedIn: "💼",
  Facebook: "👍",
  X: "🐦",
  TikTok: "🎵",
  YouTube: "▶️",
  Pinterest: "📌",
  Threads: "🧵",
};

function CompetitorRow({
  competitor,
  isCompared,
  onEdit,
  onRemove,
  onToggleFavorite,
  onToggleCompare,
}: {
  competitor: Competitor;
  isCompared: boolean;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onToggleCompare: (id: string) => void;
}) {
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-surface/60 p-4 transition-all duration-200 hover:border-primary/20 hover:bg-surface">
      {/* Favorite */}
      <button
        onClick={() => onToggleFavorite(competitor.id)}
        className="shrink-0"
      >
        <Star
          size={16}
          className={
            competitor.favorite
              ? "fill-warning text-warning"
              : "text-muted-foreground hover:text-foreground"
          }
        />
      </button>

      {/* Info */}
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
          style={{ backgroundColor: `${competitor.color}20` }}
        >
          <span>{platformIcons[competitor.platform] || "🏢"}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{competitor.name}</span>
            <span className="text-xs text-muted-foreground">{competitor.handle}</span>
            {competitor.favorite && (
              <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] text-warning">
                Favorite
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span>{competitor.platform}</span>
            <span>{competitor.industry}</span>
            <span>{competitor.country}</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="hidden items-center gap-6 md:flex">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Followers</p>
          <p className="text-sm font-medium text-foreground">
            {(competitor.metrics.followers / 1000).toFixed(1)}K
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Growth</p>
          <p className="text-sm font-medium text-success">
            +{competitor.metrics.growth}%
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Engagement</p>
          <p className="text-sm font-medium text-foreground">
            {competitor.metrics.engagement}%
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-primary"
          onClick={() => onToggleCompare(competitor.id)}
          title={isCompared ? "Remove from comparison" : "Add to comparison"}
        >
          <BarChart3
            size={15}
            className={isCompared ? "text-primary" : ""}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => onEdit(competitor.id)}
          title="Edit"
        >
          <Edit3 size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(competitor.id)}
          title="Remove"
        >
          <Trash2 size={14} />
        </Button>
        <a
          href={`/dashboard/social/competitors/${competitor.id}`}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground"
          title="View profile"
        >
          <ChevronRight size={14} />
        </a>
      </div>
    </div>
  );
}

export function CompetitorTable() {
  const {
    visibleCompetitors,
    compareIds,
    openEdit,
    removeCompetitor,
    toggleFavorite,
    toggleCompare,
  } = useCompetitors();

  if (visibleCompetitors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-surface/50 p-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          No competitors found
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your search or filters, or add a new competitor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {visibleCompetitors.length} of{" "}
          {visibleCompetitors.length} competitors
        </p>
        <p className="text-xs text-muted-foreground">
          {compareIds.length}/4 selected for comparison
        </p>
      </div>
      <div className="space-y-2">
        {visibleCompetitors.map((competitor) => (
          <CompetitorRow
            key={competitor.id}
            competitor={competitor}
            isCompared={compareIds.includes(competitor.id)}
            onEdit={openEdit}
            onRemove={removeCompetitor}
            onToggleFavorite={toggleFavorite}
            onToggleCompare={toggleCompare}
          />
        ))}
      </div>
    </div>
  );
}