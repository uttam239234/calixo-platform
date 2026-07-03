"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { SkeletonText } from "@/components/ui/Skeleton";
import { TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { performanceSeries } from "./mock-data";

interface MarketingPerformanceChartProps {
  loading?: boolean;
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader title="Marketing Performance" description="Cross-channel growth trend" />
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-3">
            <SkeletonText className="h-6 w-20" />
            <SkeletonText className="h-6 w-20" />
            <SkeletonText className="h-6 w-20" />
            <SkeletonText className="h-6 w-20" />
          </div>
          <div className="h-72 w-full rounded-2xl bg-gradient-to-r from-border/40 via-border/60 to-border/40 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function MarketingPerformanceChart({ loading = false }: MarketingPerformanceChartProps) {
  if (loading) return <ChartSkeleton />;

  return (
    <Card>
      <CardHeader
        title="Marketing Performance"
        description="Cross-channel growth trend — last 7 days"
        action={
          <Button variant="outline" size="sm" icon={<Download size={14} />}>
            Export
          </Button>
        }
      />
      <CardContent>
        {/* Metric pills */}
        <div className="mb-5 flex flex-wrap gap-2">
          {[
            { label: "Revenue", value: "$104.2K", color: "bg-primary/10 text-primary" },
            { label: "Leads", value: "1,340", color: "bg-success/10 text-success" },
            { label: "Conversions", value: "7.8%", color: "bg-warning/10 text-warning" },
            { label: "Impressions", value: "2.4M", color: "bg-muted/10 text-muted-foreground" },
          ].map((metric) => (
            <div
              key={metric.label}
              className={`inline-flex items-center gap-1.5 rounded-xl border border-border/60 px-3.5 py-1.5 text-xs font-semibold shadow-sm ${metric.color}`}
            >
              {metric.label}
              <span className="text-foreground font-bold">{metric.value}</span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceSeries}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="4 4" strokeOpacity={0.4} />
              <XAxis
                dataKey="label"
                stroke="var(--muted-foreground)"
                tickLine={false}
                axisLine={false}
                fontSize={13}
                dy={8}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                tickLine={false}
                axisLine={false}
                fontSize={13}
                dx={-4}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  fontSize: "13px",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 10px -6px rgba(0,0,0,0.05)",
                  padding: "12px 16px",
                }}
                cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "13px", paddingTop: "12px" }}
                iconType="circle"
                iconSize={8}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#4F46E5"
                fill="url(#revGrad)"
                strokeWidth={2.5}
                name="Revenue"
                dot={false}
                activeDot={{ r: 5, fill: "#4F46E5", stroke: "white", strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="leads"
                stroke="#10B981"
                fill="url(#leadGrad)"
                strokeWidth={2}
                name="Leads"
                dot={false}
                activeDot={{ r: 5, fill: "#10B981", stroke: "white", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary/[0.03] border border-primary/10 px-4 py-3 text-sm text-muted-foreground">
          <TrendingUp size={16} className="text-primary flex-shrink-0" />
          <span>Conversion velocity improving ahead of the next launch window.</span>
        </div>
      </CardContent>
    </Card>
  );
}