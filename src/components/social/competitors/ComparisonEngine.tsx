"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useCompetitors } from "@/features/social/competitors/CompetitorProvider";
import Card from "@/components/dashboard/common/Card";
import SectionTitle from "@/components/dashboard/common/SectionTitle";
import type { ComparisonMetric } from "@/features/social/competitors/types";

const metrics: { key: ComparisonMetric; label: string; format: (v: number) => string }[] = [
  { key: "followers", label: "Followers", format: (v) => `${(v / 1000).toFixed(0)}K` },
  { key: "reach", label: "Reach", format: (v) => `${(v / 1000).toFixed(0)}K` },
  { key: "engagement", label: "Engagement %", format: (v) => `${v.toFixed(1)}%` },
  { key: "growth", label: "Growth %", format: (v) => `${v.toFixed(1)}%` },
  { key: "postingFrequency", label: "Posts/Week", format: (v) => v.toFixed(1) },
  { key: "views", label: "Views", format: (v) => `${(v / 1000).toFixed(0)}K` },
  { key: "shares", label: "Shares", format: (v) => `${(v / 1000).toFixed(0)}K` },
  { key: "likes", label: "Likes", format: (v) => `${(v / 1000).toFixed(0)}K` },
  { key: "comments", label: "Comments", format: (v) => `${(v / 1000).toFixed(0)}K` },
  { key: "ctr", label: "CTR %", format: (v) => `${v.toFixed(1)}%` },
];

export function ComparisonEngine() {
  const { compared, brandMetrics } = useCompetitors();

  if (compared.length === 0) {
    return (
      <Card>
        <SectionTitle
          title="Comparison Engine"
          subtitle="Select up to 4 competitors to compare performance metrics"
        />
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-slate-500">
            Click the chart icon on any competitor to add them to the comparison.
          </p>
        </div>
      </Card>
    );
  }

  const getBrandValue = (key: ComparisonMetric): number => {
    switch (key) {
      case "followers": return brandMetrics.followers;
      case "reach": return brandMetrics.reach;
      case "engagement": return brandMetrics.engagement;
      case "growth": return brandMetrics.growth;
      case "postingFrequency": return brandMetrics.postingFrequency;
      case "views": return brandMetrics.views;
      case "shares": return brandMetrics.shares;
      case "likes": return brandMetrics.likes;
      case "comments": return brandMetrics.comments;
      case "ctr": return brandMetrics.ctr;
    }
  };

  const getCompetitorValue = (key: ComparisonMetric, competitor: typeof compared[0]): number => {
    const m = competitor.metrics;
    if (key === "ctr") {
      return m.reach > 0 ? Number(((m.likes + m.comments + m.shares) / m.reach * 100).toFixed(1)) : 0;
    }
    return m[key];
  };

  const chartData = metrics.map((metric) => {
    const dataPoint: Record<string, string | number> = {
      metric: metric.label,
    };
    dataPoint["Your Brand"] = getBrandValue(metric.key);
    compared.forEach((c) => {
      dataPoint[c.name] = getCompetitorValue(metric.key, c);
    });
    return dataPoint;
  });

  const colors = ["#22d3ee", ...compared.map((c) => c.color)];

  return (
    <Card>
      <SectionTitle
        title="Comparison Engine"
        subtitle={`Comparing your brand with ${compared.length} competitor${compared.length > 1 ? "s" : ""}`}
      />
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="20%">
            <CartesianGrid stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="metric"
              stroke="#64748b"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={60}
            />
            <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
            <Bar
              dataKey="Your Brand"
              fill="#22d3ee"
              radius={[4, 4, 0, 0]}
              barSize={16}
            />
            {compared.map((c, i) => (
              <Bar
                key={c.id}
                dataKey={c.name}
                fill={c.color}
                radius={[4, 4, 0, 0]}
                barSize={16}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}