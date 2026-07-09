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
        <p className="text-lg text-muted-foreground">Competitor not found</p>
        <Link
          href="/dashboard/social/competitors"
          className="mt-4 text-sm text-primary hover:text-primary/80"
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
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"
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
              <h1 className="text-2xl font-semibold text-foreground">
                {competitor.name}
              </h1>
              {competitor.favorite && (
                <Star size={16} className="fill-warning text-warning" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {competitor.handle} · {competitor.platform} ·{" "}
              {competitor.industry}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      {competitor.description && (
        <Card>
          <p className="text-sm text-foreground">{competitor.description}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
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
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
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
          <h3 className="mb-4 text-lg font-semibold text-foreground">
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
                className="flex items-center justify-between border-b border-border pb-2 text-sm"
              >
                <span className="text-muted-foreground">{metric.label}</span>
                <span className="font-medium text-foreground">{metric.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Hashtags
          </h3>
          <div className="space-y-3">
            {competitor.hashtags.map((h) => (
              <div
                key={h.tag}
                className="rounded-xl border border-border bg-surface/40 p-3"
              >
                <div className="flex items-center gap-2">
                  <Hash size={12} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {h.tag}
                  </span>
                </div>
                <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
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
        <h3 className="mb-4 text-lg font-semibold text-foreground">Audience</h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Top Countries</p>
            <p className="mt-1 text-sm text-foreground">
              {competitor.audience.countries.join(", ")}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Top Cities</p>
            <p className="mt-1 text-sm text-foreground">
              {competitor.audience.cities.join(", ")}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Age</p>
            <p className="mt-1 text-sm text-foreground">
              {competitor.audience.age}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gender</p>
            <p className="mt-1 text-sm text-foreground">
              {competitor.audience.gender}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Language</p>
            <p className="mt-1 text-sm text-foreground">
              {competitor.audience.language}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Devices</p>
            <p className="mt-1 text-sm text-foreground">
              {competitor.audience.devices}
            </p>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Activity Timeline</h3>
        <div className="space-y-3">
          {competitor.timeline.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 border-l-2 border-primary/30 pl-4"
            >
              <div className="flex-1">
                <p className="text-sm text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.date).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] capitalize ${
                  item.type === "growth"
                    ? "bg-success/10 text-success"
                    : item.type === "content"
                    ? "bg-primary/10 text-primary"
                    : "bg-warning/10 text-warning"
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
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Top Performing Content
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {competitor.topContent.map((content) => (
            <div
              key={content.id}
              className="flex gap-3 rounded-xl border border-border bg-surface/40 p-3"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-surface text-lg font-bold text-muted-foreground">
                {content.thumbnail}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-xs text-foreground">
                  {content.caption}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
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