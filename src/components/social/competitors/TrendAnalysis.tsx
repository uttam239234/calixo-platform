"use client";
import { useState } from "react";
import {
} from "lucide-react";
import { useCompetitors } from "@/features/social/competitors/CompetitorProvider";
import Card from "@/components/dashboard/common/Card";
import SectionTitle from "@/components/dashboard/common/SectionTitle";

const tabs = ["Trending Topics", "Trending Formats", "Posting Times", "Opportunities"] as const;
type TrendTab = (typeof tabs)[number];

const sentimentColors: Record<string, string> = {
  positive: "text-success",
  neutral: "text-warning",
  negative: "text-destructive",
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
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
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
              className="flex items-center justify-between rounded-xl border border-border bg-surface/40 p-3"
            >
              <div className="flex items-center gap-3">
                <span>{platformEmojis[topic.platform] || "🌐"}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{topic.topic}</p>
                  <p className="text-xs text-muted-foreground">{topic.platform}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="text-right">
                  <p className="text-muted-foreground">Volume</p>
                  <p className="text-foreground">
                    {(topic.volume / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Growth</p>
                  <p
                    className={`font-medium ${
                      topic.growth > 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {topic.growth > 0 ? "+" : ""}
                    {topic.growth}%
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] capitalize ${sentimentColors[topic.sentiment]} bg-surface`}
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
              className="rounded-xl border border-border bg-surface/40 p-4"
            >
              <div className="flex items-center gap-2">
                <span>{platformEmojis[format.platform] || "🌐"}</span>
                <p className="text-sm font-medium text-foreground">{format.format}</p>
              </div>
              <div className="mt-3 flex gap-4 text-xs">
                <div>
                  <p className="text-muted-foreground">Growth</p>
                  <p className="text-success">+{format.growth}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Engagement</p>
                  <p className="text-foreground">{format.engagement}%</p>
                </div>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-primary/60"
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
              className="flex items-center justify-between rounded-xl border border-border bg-surface/40 p-3"
            >
              <div className="flex items-center gap-3">
                <span>{platformEmojis[pt.platform] || "🌐"}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {pt.day} at {pt.time}
                  </p>
                  <p className="text-xs text-muted-foreground">{pt.platform}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Engagement</p>
                <p className="text-success">{pt.engagement}%</p>
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
              className="rounded-xl border border-border bg-surface/40 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground">{opp.title}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{opp.description}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      opp.effort === "Low"
                        ? "bg-success/10 text-success"
                        : opp.effort === "Medium"
                        ? "bg-warning/10 text-warning"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {opp.effort}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
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