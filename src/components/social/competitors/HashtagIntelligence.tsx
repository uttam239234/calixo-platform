"use client";
import { useState } from "react";
import { Hash, TrendingUp, BarChart3, Lightbulb } from "lucide-react";
import { useCompetitors } from "@/features/social/competitors/CompetitorProvider";
import Card from "@/components/dashboard/common/Card";
import SectionTitle from "@/components/dashboard/common/SectionTitle";

export function HashtagIntelligence() {
  const { competitors } = useCompetitors();
  const [sortBy, setSortBy] = useState<"frequency" | "reach" | "trend">("frequency");

  // Aggregate hashtags from all competitors
  const allHashtags = competitors.flatMap((c) =>
    c.hashtags.map((h) => ({
      ...h,
      competitorName: c.name,
      competitorColor: c.color,
    }))
  );

  // Deduplicate and aggregate
  const aggregated = allHashtags.reduce<
    Record<
      string,
      {
        tag: string;
        frequency: number;
        reach: number;
        trend: number;
        engagement: number;
        competitors: string[];
        recommendations: string[];
      }
    >
  >((acc, h) => {
    if (!acc[h.tag]) {
      acc[h.tag] = {
        tag: h.tag,
        frequency: 0,
        reach: 0,
        trend: 0,
        engagement: 0,
        competitors: [],
        recommendations: [],
      };
    }
    acc[h.tag].frequency += h.frequency;
    acc[h.tag].reach += h.reach;
    acc[h.tag].trend += h.trend;
    acc[h.tag].engagement += h.engagement ?? 0;
    acc[h.tag].competitors.push(h.competitorName);
    if (h.recommendation && !acc[h.tag].recommendations.includes(h.recommendation)) {
      acc[h.tag].recommendations.push(h.recommendation);
    }
    return acc;
  }, {});

  const sorted = Object.values(aggregated)
    .sort((a, b) => b[sortBy] - a[sortBy])
    .slice(0, 8);

  const sortOptions: { key: typeof sortBy; label: string }[] = [
    { key: "frequency", label: "Frequency" },
    { key: "reach", label: "Reach" },
    { key: "trend", label: "Trend" },
  ];

  return (
    <Card>
      <SectionTitle
        title="Hashtag Intelligence"
        subtitle="Top performing hashtags across competitors"
        action={
          <div className="flex gap-1">
            {sortOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  sortBy === opt.key
                    ? "bg-cyan-500/15 text-cyan-300"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        }
      />
      <div className="space-y-3">
        {sorted.map((hashtag) => (
          <div
            key={hashtag.tag}
            className="rounded-xl border border-slate-800 bg-slate-900/40 p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-cyan-400" />
                <span className="text-sm font-medium text-white">
                  {hashtag.tag}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <BarChart3 size={11} />
                  {(hashtag.frequency / 10).toFixed(1)}×
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp size={11} />
                  {hashtag.trend}%
                </span>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs">
              <div className="flex-1">
                <div className="flex justify-between text-slate-500">
                  <span>Reach</span>
                  <span>{(hashtag.reach / 1000).toFixed(0)}K</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-cyan-500/60"
                    style={{
                      width: `${Math.min(
                        100,
                        (hashtag.reach /
                          Math.max(...sorted.map((h) => h.reach))) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <div className="text-slate-400">
                Used by {hashtag.competitors.length} competitor
                {hashtag.competitors.length > 1 ? "s" : ""}
              </div>
            </div>
            {hashtag.recommendations.length > 0 && (
              <div className="mt-2 flex items-start gap-1.5 text-[11px] text-slate-500">
                <Lightbulb size={11} className="mt-0.5 shrink-0 text-amber-400" />
                <span>{hashtag.recommendations[0]}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}