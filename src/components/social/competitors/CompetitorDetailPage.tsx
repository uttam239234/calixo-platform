"use client";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Calendar,
  Users,
  Activity,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Play,
  Star,
  Hash,
} from "lucide-react";
import { useCompetitors } from "@/features/social/competitors/CompetitorProvider";
import Card from "@/components/dashboard/common/Card";
import IconBadge from "@/components/dashboard/common/IconBadge";

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

export function CompetitorDetailPage({ id }: { id: string }) {
  const { competitors } = useCompetitors();
  const competitor = competitors.find((c) => c.id === id);

  if (!competitor) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-slate-400">Competitor not found</p>
        <Link
          href="/dashboard/social/competitors"
          className="mt-4 text-sm text-cyan-300 hover:text-cyan-200"
        >
          Back to competitors
        </Link>
      </div>
    );
  }

  const stats = [
    {
      label: "Followers",
      value: (competitor.metrics.followers / 1000).toFixed(1) + "K",
      icon: Users,
      tone: "cyan" as const,
    },
    {
      label: "Growth Rate",
      value: competitor.metrics.growth + "%",
      icon: TrendingUp,
      tone: "emerald" as const,
    },
    {
      label: "Engagement",
      value: competitor.metrics.engagement + "%",
      icon: Activity,
      tone: "amber" as const,
    },
    {
      label: "Monthly Reach",
      value: (competitor.metrics.reach / 1000).toFixed(0) + "K",
      icon: Eye,
      tone: "rose" as const,
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/social/competitors"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-300"
        >
          <ArrowLeft size={14} />
          Competitor Intelligence
        </Link>
        <div className="mt-4 flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
            style={{ backgroundColor: `${competitor.color}20` }}
          >
            <span>{platformEmojis[competitor.platform] || "🏢"}</span>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-white">
                {competitor.name}
              </h1>
              {competitor.favorite && (
                <Star size={16} className="fill-amber-400 text-amber-400" />
              )}
            </div>
            <p className="text-sm text-slate-400">
              {competitor.handle} · {competitor.platform} ·{" "}
              {competitor.industry}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      {competitor.description && (
        <Card>
          <p className="text-sm text-slate-300">{competitor.description}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
            {competitor.website && (
              <span className="flex items-center gap-1">
                <Globe size={12} />
                {competitor.website}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              Joined{" "}
              {competitor.joinedDate
                ? new Date(competitor.joinedDate).toLocaleDateString()
                : "—"}
            </span>
            <span>{competitor.country}</span>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {stat.value}
                </p>
              </div>
              <IconBadge icon={stat.icon} tone={stat.tone} />
            </div>
          </Card>
        ))}
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-white">
            Detailed Metrics
          </h3>
          <div className="space-y-3">
            {[
              { label: "Posts", value: competitor.metrics.posts },
              { label: "Videos", value: competitor.metrics.videos },
              { label: "Reels", value: competitor.metrics.reels },
              { label: "Stories", value: competitor.metrics.stories },
              { label: "Likes", value: (competitor.metrics.likes / 1000).toFixed(0) + "K" },
              { label: "Comments", value: (competitor.metrics.comments / 1000).toFixed(0) + "K" },
              { label: "Shares", value: (competitor.metrics.shares / 1000).toFixed(0) + "K" },
              { label: "Views", value: (competitor.metrics.views / 1000).toFixed(0) + "K" },
              { label: "Posting Frequency", value: competitor.metrics.postingFrequency + "/week" },
              { label: "Response Time", value: competitor.metrics.responseTime + "h" },
            ].map((metric) => (
              <div
                key={metric.label}
                className="flex items-center justify-between border-b border-slate-800 pb-2 text-sm"
              >
                <span className="text-slate-400">{metric.label}</span>
                <span className="font-medium text-white">{metric.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-semibold text-white">
            Hashtags
          </h3>
          <div className="space-y-3">
            {competitor.hashtags.map((h) => (
              <div
                key={h.tag}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-3"
              >
                <div className="flex items-center gap-2">
                  <Hash size={12} className="text-cyan-400" />
                  <span className="text-sm font-medium text-white">
                    {h.tag}
                  </span>
                </div>
                <div className="mt-2 flex gap-3 text-xs text-slate-500">
                  <span>Frequency: {h.frequency}/week</span>
                  <span>Reach: {(h.reach / 1000).toFixed(0)}K</span>
                  <span>Trend: {h.trend}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Audience */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-white">Audience</h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div>
            <p className="text-xs text-slate-500">Top Countries</p>
            <p className="mt-1 text-sm text-white">
              {competitor.audience.countries.join(", ")}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Top Cities</p>
            <p className="mt-1 text-sm text-white">
              {competitor.audience.cities.join(", ")}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Age</p>
            <p className="mt-1 text-sm text-white">
              {competitor.audience.age}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Gender</p>
            <p className="mt-1 text-sm text-white">
              {competitor.audience.gender}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Language</p>
            <p className="mt-1 text-sm text-white">
              {competitor.audience.language}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Devices</p>
            <p className="mt-1 text-sm text-white">
              {competitor.audience.devices}
            </p>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-white">Activity Timeline</h3>
        <div className="space-y-3">
          {competitor.timeline.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 border-l-2 border-cyan-500/30 pl-4"
            >
              <div className="flex-1">
                <p className="text-sm text-white">{item.label}</p>
                <p className="text-xs text-slate-500">
                  {new Date(item.date).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] capitalize ${
                  item.type === "growth"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : item.type === "content"
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "bg-amber-500/10 text-amber-400"
                }`}
              >
                {item.type}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Content */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-white">
          Top Performing Content
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {competitor.topContent.map((content) => (
            <div
              key={content.id}
              className="flex gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-lg font-bold text-slate-600">
                {content.thumbnail}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-xs text-slate-300">
                  {content.caption}
                </p>
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
                  <span>{content.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}