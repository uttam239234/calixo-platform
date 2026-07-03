"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Download, Maximize2 } from "lucide-react";
import type { RevenuePoint } from "./types";

interface RevenueChartProps {
  data: RevenuePoint[];
  range: "7d" | "30d" | "90d" | "custom";
}

export function RevenueChart({ data, range }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader
        title="Revenue Analytics"
        description={`Performance across ${range === "7d" ? "the last 7 days" : range === "30d" ? "the last 30 days" : range === "90d" ? "the last 90 days" : "your custom date range"}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download size={14} />
              Export
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Fullscreen">
              <Maximize2 size={14} />
            </Button>
          </div>
        }
      />
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="4 4" strokeOpacity={0.4} />
              <XAxis dataKey="label" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} fontSize={13} dy={8} />
              <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} fontSize={13} dx={-4} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  fontSize: "13px",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                  padding: "12px 16px",
                }}
                cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "4 4" }}
                formatter={(value: unknown) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fillOpacity={1} fill="url(#revenueFill)" strokeWidth={2.5} name="Revenue" dot={false} activeDot={{ r: 5, fill: "var(--primary)", stroke: "white", strokeWidth: 2 }} />
              <Area type="monotone" dataKey="spend" stroke="#F59E0B" fillOpacity={1} fill="url(#spendFill)" strokeWidth={2} name="Spend" dot={false} activeDot={{ r: 5, fill: "#F59E0B", stroke: "white", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}