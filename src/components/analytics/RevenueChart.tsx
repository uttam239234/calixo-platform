"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Download, Maximize2, MessageSquarePlus, Trash2 } from "lucide-react";
import type { AnalyticsAnnotation, AnalyticsRevenuePoint } from "@/core/analytics";

interface RevenueChartProps {
  data: AnalyticsRevenuePoint[];
  range: "7d" | "30d" | "90d" | "custom";
  onExport: () => void;
  annotations?: AnalyticsAnnotation[];
  onAddAnnotation?: (date: string, note: string) => void;
  onRemoveAnnotation?: (id: string) => void;
}

export function RevenueChart({ data, range, onExport, annotations = [], onAddAnnotation, onRemoveAnnotation }: RevenueChartProps) {
  const [adding, setAdding] = useState(false);
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  return (
    <Card>
      <CardHeader
        title="Revenue Analytics"
        description={`Performance across ${range === "7d" ? "the last 7 days" : range === "30d" ? "the last 30 days" : range === "90d" ? "the last 90 days" : "your custom date range"}`}
        action={
          <div className="flex items-center gap-2">
            {onAddAnnotation && (
              <Button variant="outline" size="sm" onClick={() => setAdding(v => !v)}>
                <MessageSquarePlus size={14} />
                Annotate
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onExport}>
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

        {onAddAnnotation && adding && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card/50 p-3">
            <input aria-label="Annotation date" type="date" value={date} onChange={e => setDate(e.target.value)} className="input text-sm" />
            <input aria-label="Annotation note" value={note} onChange={e => setNote(e.target.value)} placeholder="What happened on this date?" className="input flex-1 text-sm" />
            <Button
              variant="primary"
              size="sm"
              disabled={!date || !note.trim()}
              onClick={() => {
                onAddAnnotation(date, note.trim());
                setDate("");
                setNote("");
                setAdding(false);
              }}
            >
              Save
            </Button>
          </div>
        )}

        {annotations.length > 0 && (
          <div className="mt-4 space-y-1.5">
            {annotations.map(annotation => (
              <div key={annotation.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-background/60 px-3 py-2 text-xs">
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">{new Date(annotation.date).toLocaleDateString()}</span> — {annotation.note}{" "}
                  <span className="text-muted-foreground/70">by {annotation.author}</span>
                </span>
                {onRemoveAnnotation && (
                  <button aria-label="Remove annotation" onClick={() => onRemoveAnnotation(annotation.id)} className="flex-shrink-0 rounded p-1 text-muted-foreground hover:bg-accent">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}