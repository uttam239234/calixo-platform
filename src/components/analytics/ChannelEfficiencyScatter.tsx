"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts";
import type { AnalyticsChannelRow } from "@/core/analytics";

interface ChannelEfficiencyScatterProps {
  channels: AnalyticsChannelRow[];
  onSelectChannel?: (channel: string) => void;
}

function parseNumeric(value: string): number {
  return parseFloat(value.replace(/[^0-9.-]/g, "")) || 0;
}

export default function ChannelEfficiencyScatter({ channels, onSelectChannel }: ChannelEfficiencyScatterProps) {
  const data = channels.map(c => ({ name: c.channel, spend: parseNumeric(c.spend), roas: parseNumeric(c.roas), leads: parseNumeric(c.leads) }));

  return (
    <Card>
      <CardHeader title="Channel Efficiency" description="Spend vs. ROAS correlation — click a point to filter by that channel" />
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" strokeOpacity={0.4} />
              <XAxis type="number" dataKey="spend" name="Spend" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} fontSize={12} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis type="number" dataKey="roas" name="ROAS" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} fontSize={12} tickFormatter={v => `${v}x`} />
              <ZAxis type="number" dataKey="leads" range={[80, 300]} name="Leads" />
              <Tooltip
                cursor={{ strokeDasharray: "4 4" }}
                contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "13px" }}
                formatter={(value, name) => [name === "Spend" ? `$${Number(value).toLocaleString()}` : name === "ROAS" ? `${value}x` : String(value), name ?? ""]}
                labelFormatter={() => ""}
              />
              <Scatter
                name="Channels"
                data={data}
                fill="var(--primary)"
                onClick={(point) => onSelectChannel?.((point as unknown as { name: string }).name)}
                cursor={onSelectChannel ? "pointer" : "default"}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
