"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { AnalyticsChannelRow } from "@/core/analytics";

interface RevenueBridgeChartProps {
  channels: AnalyticsChannelRow[];
}

function parseCurrency(value: string): number {
  const num = parseFloat(value.replace(/[^0-9.-]/g, ""));
  if (value.includes("M")) return num * 1_000_000;
  if (value.includes("K")) return num * 1_000;
  return num;
}

interface BridgePoint {
  name: string;
  base: number;
  revenue: number;
  cumulative: number;
}

function buildBridgeData(channels: AnalyticsChannelRow[]): BridgePoint[] {
  const points = channels.reduce<BridgePoint[]>((acc, c) => {
    const revenue = parseCurrency(c.revenue);
    const base = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
    acc.push({ name: c.channel, base, revenue, cumulative: base + revenue });
    return acc;
  }, []);
  const total = points.length > 0 ? points[points.length - 1].cumulative : 0;
  return [...points, { name: "Total", base: 0, revenue: total, cumulative: total }];
}

/** Standard Recharts waterfall technique: an invisible "base" stacked series plus a visible "delta" series. */
export default function RevenueBridgeChart({ channels }: RevenueBridgeChartProps) {
  const data = buildBridgeData(channels);

  return (
    <Card>
      <CardHeader title="Revenue Bridge" description="Waterfall of cumulative revenue contribution by channel" />
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="4 4" strokeOpacity={0.4} />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} fontSize={12} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value, name) => (name === "revenue" ? [`$${Number(value).toLocaleString()}`, "Contribution"] : ["", ""])}
                contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "13px" }}
              />
              <Bar dataKey="base" stackId="bridge" fill="transparent" />
              <Bar dataKey="revenue" stackId="bridge" radius={[4, 4, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell key={entry.name} fill={i === data.length - 1 ? "#4F46E5" : "#10B981"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
