"use client";
import { useState } from "react";
import {
  Lightbulb,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { useCompetitors } from "@/features/social/competitors/CompetitorProvider";
import Card from "@/components/dashboard/common/Card";
import SectionTitle from "@/components/dashboard/common/SectionTitle";
import { Button } from "@/components/ui/button";
import type { AIRecommendation } from "@/features/social/competitors/types";

const priorityColors: Record<string, string> = {
  Critical: "border-red-500/30 bg-red-500/5",
  High: "border-amber-500/30 bg-amber-500/5",
  Medium: "border-cyan-500/30 bg-cyan-500/5",
  Low: "border-slate-600/30 bg-slate-800/30",
};

const priorityBadge: Record<string, string> = {
  Critical: "bg-red-500/20 text-red-300",
  High: "bg-amber-500/20 text-amber-300",
  Medium: "bg-cyan-500/20 text-cyan-300",
  Low: "bg-slate-700 text-slate-400",
};

const priorityIcon: Record<string, typeof AlertTriangle> = {
  Critical: AlertTriangle,
  High: Zap,
  Medium: Target,
  Low: Lightbulb,
};

function RecommendationCard({
  rec,
  onApply,
  onDismiss,
}: {
  rec: AIRecommendation;
  onApply: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = priorityIcon[rec.priority] || Lightbulb;

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-200 ${
        priorityColors[rec.priority]
      } ${rec.applied ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Icon size={16} className="text-cyan-300" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-medium text-white">{rec.title}</h4>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityBadge[rec.priority]}`}
              >
                {rec.priority}
              </span>
              {rec.applied && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-400">
                  <CheckCircle2 size={10} />
                  Applied
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-400">{rec.description}</p>

            {expanded && (
              <div className="mt-3 space-y-2 border-t border-slate-700/50 pt-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-500">Category</p>
                    <p className="text-slate-300">{rec.category}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Confidence</p>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-cyan-500"
                          style={{ width: `${rec.confidence}%` }}
                        />
                      </div>
                      <span className="text-slate-300">{rec.confidence}%</span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-500">Business Impact</p>
                    <p className="text-slate-300">{rec.businessImpact}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-500">Suggested Action</p>
                    <p className="text-slate-300">{rec.suggestedAction}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
        >
          {expanded ? (
            <>
              <ChevronUp size={12} /> Less
            </>
          ) : (
            <>
              <ChevronDown size={12} /> Details
            </>
          )}
        </button>
        {!rec.applied && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="xs"
              className="text-slate-500 hover:text-red-400"
              onClick={() => onDismiss(rec.id)}
            >
              <X size={12} />
              Dismiss
            </Button>
            <Button
              size="xs"
              className="bg-cyan-400 text-slate-950 hover:bg-cyan-300"
              onClick={() => onApply(rec.id)}
            >
              <CheckCircle2 size={12} />
              Apply
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function AIInsights() {
  const { recommendations, applyRecommendation, dismissRecommendation, refreshAi } =
    useCompetitors();
  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all"
      ? recommendations
      : recommendations.filter((r) => r.priority.toLowerCase() === filter);

  const activeCount = recommendations.filter((r) => !r.applied).length;

  const filters = ["all", "critical", "high", "medium", "low"];

  return (
    <Card>
      <SectionTitle
        title="AI Insights"
        subtitle={`${activeCount} active recommendations`}
        action={
          <Button
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-300"
            onClick={refreshAi}
          >
            <RefreshCw size={12} />
            Regenerate
          </Button>
        }
      />
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === f
                ? "bg-cyan-500/15 text-cyan-300"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map((rec) => (
          <RecommendationCard
            key={rec.id}
            rec={rec}
            onApply={applyRecommendation}
            onDismiss={dismissRecommendation}
          />
        ))}
      </div>
    </Card>
  );
}