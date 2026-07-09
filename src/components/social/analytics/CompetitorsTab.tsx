"use client";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { Trophy, TrendingUp, TrendingDown, Minus, Lightbulb, Target, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";
import Card from "@/components/dashboard/common/Card";
import SectionTitle from "@/components/dashboard/common/SectionTitle";
import { initialCompetitors, brandMetrics, aiRecommendations } from "@/features/social/competitors/mock-data";

const tabs = ["Benchmark", "Growth Comparison", "AI Insights"] as const;
type TabType = (typeof tabs)[number];

const categories: { key: string; label: string }[] = [
  { key: "followers", label: "Followers" },
  { key: "engagement", label: "Engagement" },
  { key: "growth", label: "Growth" },
  { key: "postingFrequency", label: "Posting Frequency" },
  { key: "reach", label: "Reach" },
  { key: "views", label: "Views" },
];

const priorityBadge: Record<string, string> = {
  Critical: "bg-destructive/20 text-destructive",
  High: "bg-warning/20 text-warning",
  Medium: "bg-primary/20 text-primary",
  Low: "bg-muted text-muted-foreground",
};

const priorityIcon: Record<string, typeof AlertTriangle> = {
  Critical: AlertTriangle,
  High: Zap,
  Medium: Target,
  Low: Lightbulb,
};

export function CompetitorsTab() {
  const [activeTab, setActiveTab] = useState<TabType>("Benchmark");
  const competitors = initialCompetitors;

  // Benchmark data
  const getBrandValue = (key: string): number => {
    const map: Record<string, number> = {
      followers: brandMetrics.followers,
      reach: brandMetrics.reach,
      engagement: brandMetrics.engagement,
      growth: brandMetrics.growth,
      postingFrequency: brandMetrics.postingFrequency,
      views: brandMetrics.views,
    };
    return map[key] ?? 0;
  };

  const getCompValue = (c: typeof competitors[0], key: string): number => {
    const m = c.metrics;
    const map: Record<string, number> = {
      followers: m.followers,
      reach: m.reach,
      engagement: m.engagement,
      growth: m.growth,
      postingFrequency: m.postingFrequency,
      views: m.views,
    };
    return map[key] ?? 0;
  };

  const benchmarkData = categories.map((cat) => {
    const brandVal = getBrandValue(cat.key);
    const comps = competitors.slice(0, 3).map((c) => ({
      name: c.name,
      value: getCompValue(c, cat.key),
      color: c.color,
    }));
    const all = [{ name: "Your Brand", value: brandVal, color: "#22d3ee" }, ...comps];
    const sorted = [...all].sort((a, b) => b.value - a.value);
    const rank = sorted.findIndex((x) => x.name === "Your Brand") + 1;
    return { category: cat.label, values: all, rank, total: all.length };
  });

  // Growth comparison chart data
  const growthData = competitors.slice(0, 4).map((c) => ({
    name: c.name,
    growth: c.metrics.growth,
    followers: c.metrics.followers,
    color: c.color,
  }));

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-border bg-surface/55 p-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Benchmark Tab */}
      {activeTab === "Benchmark" && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {benchmarkData.map((bench) => (
            <Card key={bench.category}>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">{bench.category}</h4>
                <span className="text-xs text-muted-foreground">
                  #{bench.rank} of {bench.total}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {bench.values
                  .sort((a, b) => b.value - a.value)
                  .map((v, i) => (
                    <div key={v.name} className="flex items-center gap-2">
                      <span className="w-3 text-xs font-bold text-muted-foreground">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-foreground">{v.name}</span>
                          <span className="text-muted-foreground">
                            {v.value > 1000 ? `${(v.value / 1000).toFixed(0)}K` : v.value}
                          </span>
                        </div>
                        <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(v.value / Math.max(...bench.values.map((x) => x.value))) * 100}%`,
                              backgroundColor: v.color,
                            }}
                          />
                        </div>
                      </div>
                      {i === 0 && <Trophy size={12} className="shrink-0 text-warning" />}
                    </div>
                  ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Growth Comparison Tab */}
      {activeTab === "Growth Comparison" && (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <SectionTitle title="Growth Rate Comparison" subtitle="Monthly follower growth %" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: 12 }}
                  />
                  <Bar dataKey="growth" radius={[4, 4, 0, 0]} barSize={32}>
                    {growthData.map((entry, index) => (
                      <rect key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <SectionTitle title="Follower Count" subtitle="Total followers comparison" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: 12 }}
                  />
                  <Bar dataKey="followers" radius={[4, 4, 0, 0]} barSize={32}>
                    {growthData.map((entry, index) => (
                      <rect key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === "AI Insights" && (
        <div className="space-y-3">
          {aiRecommendations.slice(0, 4).map((rec) => {
            const Icon = priorityIcon[rec.priority] || Lightbulb;
            return (
              <div
                key={rec.id}
                className={`rounded-2xl border p-4 ${
                  rec.priority === "Critical"
                    ? "border-destructive/30 bg-destructive/5"
                    : rec.priority === "High"
                    ? "border-warning/30 bg-warning/5"
                    : rec.priority === "Medium"
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-muted/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon size={16} className="mt-0.5 text-primary" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-medium text-foreground">{rec.title}</h4>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityBadge[rec.priority]}`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{rec.description}</p>
                    <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground">Confidence</p>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${rec.confidence}%` }} />
                          </div>
                          <span className="text-foreground">{rec.confidence}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Impact</p>
                        <p className="text-foreground">{rec.businessImpact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}