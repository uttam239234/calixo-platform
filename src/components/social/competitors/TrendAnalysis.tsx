"use client";
import { useState } from "react";
import {
  TrendingUp,
  Hash,
  Clock,
  Lightbulb,
  BarChart3,
} from "lucide-react";
import { useCompetitors } from "@/features/social/competitors/CompetitorProvider";
import Card from "@/components/dashboard/common/Card";
import SectionTitle from "@/components/dashboard/common/SectionTitle";

const tabs = ["Trending Topics", "Trending Formats", "Posting Times", "Opportunities"] as const;
type TrendTab = (typeof tabs)[number];

const sentimentColors: Record<string, string> = {
  positive: "text-emerald-400",
  neutral: "text-amber-400",
  negative: "text-red-400",
};

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

export function TrendAnalysis() {
  const { trendData } = useCompetitors();
  const [activeTab, setActiveTab] = useState<TrendTab>("Trending Topics");

  return (
    <Card>
      <SectionTitle
        title="Trend Analysis"
        subtitle="Discover trends, formats, and content opportunities"
      />
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as TrendTab)}
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

      {/* Trending Topics */}
      {activeTab === "Trending Topics" && (
        <div className="space-y-2">
          {trendData.topics.map((topic) => (
            <div
              key={topic.id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-3"
            >
              <div className="flex items-center gap-3">
                <span>{platformEmojis[topic.platform] || "🌐"}</span>
                <div>
                  <p className="text-sm font-medium text-white">{topic.topic}</p>
                  <p className="text-xs text-slate-500">{topic.platform}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="text-right">
                  <p className="text-slate-500">Volume</p>
                  <p className="text-white">
                    {(topic.volume / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Growth</p>
                  <p
                    className={`font-medium ${
                      topic.growth > 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {topic.growth > 0 ? "+" : ""}
                    {topic.growth}%
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] capitalize ${sentimentColors[topic.sentiment]} bg-slate-800`}
                >
                  {topic.sentiment}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trending Formats */}
      {activeTab === "Trending Formats" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {trendData.formats.map((format) => (
            <div
              key={format.id}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"
            >
              <div className="flex items-center gap-2">
                <span>{platformEmojis[format.platform] || "🌐"}</span>
                <p className="text-sm font-medium text-white">{format.format}</p>
              </div>
              <div className="mt-3 flex gap-4 text-xs">
                <div>
                  <p className="text-slate-500">Growth</p>
                  <p className="text-emerald-400">+{format.growth}%</p>
                </div>
                <div>
                  <p className="text-slate-500">Engagement</p>
                  <p className="text-white">{format.engagement}%</p>
                </div>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-cyan-500/60"
                  style={{
                    width: `${(format.engagement / 25) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Posting Times */}
      {activeTab === "Posting Times" && (
        <div className="space-y-2">
          {trendData.postingTimes.map((pt) => (
            <div
              key={pt.id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-3"
            >
              <div className="flex items-center gap-3">
                <span>{platformEmojis[pt.platform] || "🌐"}</span>
                <div>
                  <p className="text-sm font-medium text-white">
                    {pt.day} at {pt.time}
                  </p>
                  <p className="text-xs text-slate-500">{pt.platform}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Engagement</p>
                <p className="text-emerald-400">{pt.engagement}%</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Opportunities */}
      {activeTab === "Opportunities" && (
        <div className="space-y-3">
          {trendData.opportunities.map((opp) => (
            <div
              key={opp.id}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-white">{opp.title}</h4>
                  <p className="mt-1 text-xs text-slate-400">{opp.description}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      opp.effort === "Low"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : opp.effort === "Medium"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {opp.effort}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-slate-500">
                <span>Potential: {opp.potential}%</span>
                <span>Relevance: {opp.relevance}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}