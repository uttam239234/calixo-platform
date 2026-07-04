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
    <div className="group flex items-center gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 transition-all duration-200 hover:border-cyan-500/20 hover:bg-slate-900">
      {/* Favorite */}
      <button
        onClick={() => onToggleFavorite(competitor.id)}
        className="shrink-0"
      >
        <Star
          size={16}
          className={
            competitor.favorite
              ? "fill-amber-400 text-amber-400"
              : "text-slate-600 hover:text-slate-400"
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
            <span className="font-medium text-white">{competitor.name}</span>
            <span className="text-xs text-slate-500">{competitor.handle}</span>
            {competitor.favorite && (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400">
                Favorite
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
            <span>{competitor.platform}</span>
            <span>{competitor.industry}</span>
            <span>{competitor.country}</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="hidden items-center gap-6 md:flex">
        <div className="text-right">
          <p className="text-xs text-slate-500">Followers</p>
          <p className="text-sm font-medium text-white">
            {(competitor.metrics.followers / 1000).toFixed(1)}K
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Growth</p>
          <p className="text-sm font-medium text-emerald-400">
            +{competitor.metrics.growth}%
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Engagement</p>
          <p className="text-sm font-medium text-white">
            {competitor.metrics.engagement}%
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-slate-500 hover:text-cyan-300"
          onClick={() => onToggleCompare(competitor.id)}
          title={isCompared ? "Remove from comparison" : "Add to comparison"}
        >
          <BarChart3
            size={15}
            className={isCompared ? "text-cyan-400" : ""}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-slate-500 hover:text-white"
          onClick={() => onEdit(competitor.id)}
          title="Edit"
        >
          <Edit3 size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-slate-500 hover:text-red-400"
          onClick={() => onRemove(competitor.id)}
          title="Remove"
        >
          <Trash2 size={14} />
        </Button>
        <a
          href={`/dashboard/social/competitors/${competitor.id}`}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white"
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
      <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/50 p-12 text-center">
        <p className="text-lg font-medium text-slate-400">
          No competitors found
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Try adjusting your search or filters, or add a new competitor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Showing {visibleCompetitors.length} of{" "}
          {visibleCompetitors.length} competitors
        </p>
        <p className="text-xs text-slate-500">
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