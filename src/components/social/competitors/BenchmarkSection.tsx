"use client";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useCompetitors } from "@/features/social/competitors/CompetitorProvider";
import Card from "@/components/dashboard/common/Card";
import SectionTitle from "@/components/dashboard/common/SectionTitle";
import type { BenchmarkResult, ComparisonMetric } from "@/features/social/competitors/types";

const categories: { key: ComparisonMetric; label: string }[] = [
  { key: "followers", label: "Followers" },
  { key: "engagement", label: "Engagement" },
  { key: "growth", label: "Growth" },
  { key: "postingFrequency", label: "Posting Frequency" },
  { key: "reach", label: "Reach" },
  { key: "views", label: "Views" },
];

function BenchmarkRow({ result }: { result: BenchmarkResult }) {
  const diffIcon =
    result.difference > 0 ? (
      <TrendingUp size={14} className="text-success" />
    ) : result.difference < 0 ? (
      <TrendingDown size={14} className="text-destructive" />
    ) : (
      <Minus size={14} className="text-muted-foreground" />
    );

  const diffColor =
    result.difference > 0
      ? "text-success"
      : result.difference < 0
      ? "text-destructive"
      : "text-muted-foreground";

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-foreground">{result.category}</h4>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            #{result.rank} of {result.total}
          </span>
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${diffColor}`}>
          {diffIcon}
          {result.difference > 0 ? "+" : ""}
          {result.difference.toFixed(1)}% vs avg
        </div>
      </div>
      <div className="space-y-2">
        {result.competitors
          .sort((a, b) => b.value - a.value)
          .map((comp, i) => (
            <div key={comp.id} className="flex items-center gap-3">
              <span className="w-4 text-xs font-bold text-muted-foreground">
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{comp.name}</span>
                  <span className="text-muted-foreground">
                    {comp.name === "Your Brand"
                      ? comp.value.toLocaleString()
                      : comp.name === "Your Brand" &&
                        result.category === "Engagement"
                      ? `${comp.value}%`
                      : comp.value > 1000
                      ? `${(comp.value / 1000).toFixed(0)}K`
                      : comp.value.toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (comp.value / Math.max(...result.competitors.map((x) => x.value))) * 100)}%`,
                      backgroundColor: comp.color,
                    }}
                  />
                </div>
              </div>
              {i === 0 && (
                <Trophy size={14} className="shrink-0 text-warning" />
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export function BenchmarkSection() {
  const { competitors, brandMetrics } = useCompetitors();

  const getBrandValue = (key: ComparisonMetric): number => {
    switch (key) {
      case "followers": return brandMetrics.followers;
      case "reach": return brandMetrics.reach;
      case "engagement": return brandMetrics.engagement;
      case "growth": return brandMetrics.growth;
      case "postingFrequency": return brandMetrics.postingFrequency;
      case "views": return brandMetrics.views;
      default: return 0;
    }
  };

  const getCompValue = (c: typeof competitors[0], key: ComparisonMetric): number => {
    if (key === "ctr") return 0;
    return c.metrics[key];
  };

  const benchmarks: BenchmarkResult[] = categories.map((cat) => {
    const brandVal = getBrandValue(cat.key);
    const allCompetitorValues = competitors.map((c) => ({
      id: c.id,
      name: c.name,
      value: getCompValue(c, cat.key),
      color: c.color,
    }));
    const allValues = [
      { id: "your-brand", name: "Your Brand", value: brandVal, color: "#22d3ee" },
      ...allCompetitorValues,
    ];
    const sorted = [...allValues].sort((a, b) => b.value - a.value);
    const rank = sorted.findIndex((x) => x.id === "your-brand") + 1;
    const avg = allValues.reduce((s, x) => s + x.value, 0) / allValues.length;
    const diff = avg > 0 ? ((brandVal - avg) / avg) * 100 : 0;

    return {
      category: cat.label,
      yourBrand: brandVal,
      competitors: allValues,
      rank,
      total: allValues.length,
      difference: Number(diff.toFixed(1)),
    };
  });

  return (
    <Card>
      <SectionTitle
        title="Benchmark"
        subtitle="Compare your brand performance against competitors"
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {benchmarks.map((result) => (
          <BenchmarkRow key={result.category} result={result} />
        ))}
      </div>
    </Card>
  );
}