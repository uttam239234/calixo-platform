"use client";
import { useState } from "react";
import { Play, Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import { useCompetitors } from "@/features/social/competitors/CompetitorProvider";
import Card from "@/components/dashboard/common/Card";
import SectionTitle from "@/components/dashboard/common/SectionTitle";

const tabs = ["Top Posts", "Top Videos", "Top Reels", "Top Shorts"] as const;
type ContentTab = (typeof tabs)[number];

const platformEmojis: Record<string, string> = {
  Instagram: "📸",
  LinkedIn: "💼",
  Facebook: "👍",
  X: "🐦",
  TikTok: "🎵",
  YouTube: "▶️",
  Pinterest: "📌",
  Threads: "🧵",
};

export function TopContent() {
  const { competitors } = useCompetitors();
  const [activeTab, setActiveTab] = useState<ContentTab>("Top Posts");

  const allContent = competitors.flatMap((c) =>
    c.topContent.map((content) => ({
      ...content,
      competitorName: c.name,
      competitorColor: c.color,
    }))
  );

  const filtered = allContent.filter((c) => {
    if (activeTab === "Top Posts") return true;
    if (activeTab === "Top Videos") return c.type === "Video";
    if (activeTab === "Top Reels") return c.type === "Reel";
    if (activeTab === "Top Shorts") return c.type === "Short";
    return true;
  });

  const sorted = [...filtered].sort((a, b) => b.engagement - a.engagement).slice(0, 8);

  return (
    <Card>
      <SectionTitle
        title="Top Content"
        subtitle="Best performing content across all competitors"
      />
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === tab
                ? "bg-cyan-500/15 text-cyan-300"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sorted.map((content) => (
          <div
            key={content.id}
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 transition-all duration-200 hover:border-cyan-500/30"
          >
            {/* Thumbnail */}
            <div className="relative flex h-28 items-center justify-center bg-slate-800/50">
              <span className="text-3xl font-bold text-slate-600">
                {content.thumbnail}
              </span>
              {(content.type === "Video" ||
                content.type === "Reel" ||
                content.type === "Short") && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <Play size={16} className="ml-0.5 text-white" />
                  </div>
                </div>
              )}
              <span className="absolute right-2 top-2 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-xs">
                {platformEmojis[content.platform] || "🌐"}
              </span>
            </div>

            {/* Caption */}
            <div className="p-3">
              <p className="line-clamp-2 text-xs text-slate-300">
                {content.caption}
              </p>
              <p
                className="mt-1 text-[10px] font-medium"
                style={{ color: content.competitorColor }}
              >
                {content.competitorName}
              </p>

              {/* Stats */}
              <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-500">
                <span className="flex items-center gap-0.5">
                  <Eye size={10} />
                  {(content.views / 1000).toFixed(0)}K
                </span>
                <span className="flex items-center gap-0.5">
                  <Heart size={10} />
                  {content.engagement > 1000
                    ? `${(content.engagement / 1000).toFixed(1)}K`
                    : content.engagement}
                </span>
                {content.likes && (
                  <span className="flex items-center gap-0.5">
                    <Heart size={10} />
                    {(content.likes / 1000).toFixed(0)}K
                  </span>
                )}
                {content.comments && (
                  <span className="flex items-center gap-0.5">
                    <MessageCircle size={10} />
                    {content.comments > 1000
                      ? `${(content.comments / 1000).toFixed(1)}K`
                      : content.comments}
                  </span>
                )}
                {content.shares && (
                  <span className="flex items-center gap-0.5">
                    <Share2 size={10} />
                    {(content.shares / 1000).toFixed(0)}K
                  </span>
                )}
              </div>
              {content.date && (
                <p className="mt-1 text-[10px] text-slate-600">
                  {new Date(content.date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}