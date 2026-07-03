"use client";
import {
  Users,
  Activity,
  TrendingUp,
  Zap,
  Award,
  Globe,
} from "lucide-react";
import { useCompetitors } from "@/features/social/competitors/CompetitorProvider";
import Card from "@/components/dashboard/common/Card";
import IconBadge from "@/components/dashboard/common/IconBadge";

export function CompetitorKpiGrid() {
  const { competitors, brandMetrics } = useCompetitors();

  const totalCompetitors = competitors.length;
  const avgEngagement = competitors.length
    ? (
        competitors.reduce((sum, c) => sum + c.metrics.engagement, 0) /
        competitors.length
      ).toFixed(1)
    : "0.0";

  const fastestGrowing = competitors.length
    ? competitors.reduce((prev, curr) =>
        curr.metrics.growth > prev.metrics.growth ? curr : prev
      )
    : null;

  const platforms = [
    ...new Set(competitors.map((c) => c.platform)),
  ];
  const bestPlatform = platforms.length
    ? platforms.reduce((prev, curr) => {
        const prevAvg =
          competitors
            .filter((c) => c.platform === prev)
            .reduce((s, c) => s + c.metrics.engagement, 0) /
          competitors.filter((c) => c.platform === prev).length;
        const currAvg =
          competitors
            .filter((c) => c.platform === curr)
            .reduce((s, c) => s + c.metrics.engagement, 0) /
          competitors.filter((c) => c.platform === curr).length;
        return currAvg > prevAvg ? curr : prev;
      })
    : "";

  const aiScore = Math.min(
    100,
    Math.round(
      40 +
        (brandMetrics.engagement / 10) * 15 +
        (brandMetrics.growth / 25) * 15 +
        (brandMetrics.ctr / 5) * 10 +
        (totalCompetitors / 10) * 10 +
        (avgEngagement ? Number(avgEngagement) / 8 * 10 : 0)
    )
  );

  const scoreColor =
    aiScore >= 80
      ? "emerald"
      : aiScore >= 60
      ? "cyan"
      : aiScore >= 40
      ? "amber"
      : "rose";

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-400">Total Competitors</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {totalCompetitors}
            </p>
          </div>
          <IconBadge icon={Users} tone="cyan" />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Tracked across {platforms.length} platforms
        </p>
      </Card>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-400">Average Engagement</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {avgEngagement}%
            </p>
          </div>
          <IconBadge icon={Activity} tone="emerald" />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {brandMetrics.engagement > Number(avgEngagement)
            ? "Your brand outperforms competitors"
            : "Room to improve vs. competitors"}
        </p>
      </Card>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-400">Fastest Growing</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {fastestGrowing ? fastestGrowing.name : "—"}
            </p>
          </div>
          <IconBadge icon={TrendingUp} tone="amber" />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {fastestGrowing
            ? `${fastestGrowing.metrics.growth}% growth rate`
            : "No competitors tracked"}
        </p>
      </Card>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-400">Best Platform</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {bestPlatform || "—"}
            </p>
          </div>
          <IconBadge icon={Globe} tone="cyan" />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Highest average engagement across competitors
        </p>
      </Card>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-400">AI Competitor Score</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {aiScore}/100
            </p>
          </div>
          <IconBadge icon={Award} tone={scoreColor as "emerald" | "cyan" | "amber" | "rose"} />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {aiScore >= 80
            ? "Strong competitive position — maintain momentum"
            : aiScore >= 60
            ? "Good position — opportunities for improvement"
            : "Needs attention — review AI recommendations"}
        </p>
      </Card>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-400">Your Brand Growth</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {brandMetrics.growth}%
            </p>
          </div>
          <IconBadge icon={Zap} tone="emerald" />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {brandMetrics.growth >
          (competitors.reduce((s, c) => s + c.metrics.growth, 0) /
            (competitors.length || 1))
            ? "Outpacing competitor average growth"
            : "Below competitor average growth"}
        </p>
      </Card>
    </div>
  );
}