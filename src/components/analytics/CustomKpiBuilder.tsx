"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Calculator } from "lucide-react";
import type { AnalyticsMetricAggregation, AnalyticsMetricDefinition, AnalyticsMetricFormat } from "@/core/analytics";

interface ComputedMetric {
  metric: AnalyticsMetricDefinition;
  value: number;
  formatted: string;
}

interface CustomKpiBuilderProps {
  computed: ComputedMetric[];
  onCreate: (params: { label: string; field: AnalyticsMetricDefinition["field"]; aggregation: AnalyticsMetricAggregation; format: AnalyticsMetricFormat }) => void;
  onRemove: (id: string) => void;
}

const FIELD_OPTIONS: AnalyticsMetricDefinition["field"][] = ["revenue", "spend", "leads", "conversions", "sessions", "users", "clicks", "roas", "cpa", "conversionRate", "ctr", "bounceRate", "avgSessionDuration"];
const AGGREGATION_OPTIONS: AnalyticsMetricAggregation[] = ["sum", "avg", "count"];
const FORMAT_OPTIONS: AnalyticsMetricFormat[] = ["currency", "number", "percent", "ratio", "duration"];

export default function CustomKpiBuilder({ computed, onCreate, onRemove }: CustomKpiBuilderProps) {
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState("");
  const [field, setField] = useState<AnalyticsMetricDefinition["field"]>("revenue");
  const [aggregation, setAggregation] = useState<AnalyticsMetricAggregation>("sum");
  const [format, setFormat] = useState<AnalyticsMetricFormat>("number");

  return (
    <Card>
      <CardHeader
        title="Custom KPI Builder"
        description="Define calculated metrics computed live from the same fact table every default KPI uses"
        action={
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setCreating(v => !v)}>
            <Plus size={14} /> New Metric
          </Button>
        }
      />
      <CardContent>
        {creating && (
          <div className="mb-4 grid gap-3 rounded-xl border border-border/60 bg-card/50 p-4 sm:grid-cols-2 lg:grid-cols-5">
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Metric label" className="input text-sm" />
            <select value={field} onChange={e => setField(e.target.value as AnalyticsMetricDefinition["field"])} className="input text-sm">
              {FIELD_OPTIONS.map(f => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <select value={aggregation} onChange={e => setAggregation(e.target.value as AnalyticsMetricAggregation)} className="input text-sm">
              {AGGREGATION_OPTIONS.map(a => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <select value={format} onChange={e => setFormat(e.target.value as AnalyticsMetricFormat)} className="input text-sm">
              {FORMAT_OPTIONS.map(f => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <Button
              variant="primary"
              size="sm"
              disabled={!label.trim()}
              onClick={() => {
                onCreate({ label: label.trim(), field, aggregation, format });
                setLabel("");
                setCreating(false);
              }}
            >
              Create
            </Button>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {computed.map(({ metric, formatted }) => (
            <div key={metric.id} className="rounded-xl border border-border/50 bg-card/50 p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Calculator size={12} className="text-primary" />
                  {metric.label}
                </div>
                {metric.custom && (
                  <button aria-label="Remove metric" onClick={() => onRemove(metric.id)} className="rounded p-0.5 text-muted-foreground hover:bg-accent">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-xl font-bold tabular-nums text-foreground">{formatted}</p>
              {metric.custom && <span className="mt-1 inline-flex items-center rounded-full border border-ai/20 bg-ai/10 px-2 py-0.5 text-[10px] font-medium text-ai">Custom</span>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
