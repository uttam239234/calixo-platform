"use client";

import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { EXPORT_FORMATS, REPORT_CATEGORIES, SCHEDULE_FREQUENCIES } from "@/core/reports";
import type {
  ExportFormat,
  ReportBuilderSaveInput,
  ReportBuilderStage,
  ReportCategory,
  ReportDimension,
  ReportFilter,
  ReportLayout,
  ReportMetric,
  ReportWidget,
  ScheduleFrequency,
  WidgetTypeDefinition,
} from "@/core/reports";
import type { ModuleCategory } from "@/core/modules/ModuleTypes";
import { AGGREGATION_OPTIONS, DEMO_OWNER, DIMENSION_TYPE_OPTIONS, FILTER_OPERATOR_OPTIONS, LAYOUT_TYPE_OPTIONS, MODULE_OPTIONS } from "./constants";

const STEPS: { id: ReportBuilderStage; label: string }[] = [
  { id: "data", label: "Select Data" },
  { id: "metrics", label: "Select Metrics" },
  { id: "filters", label: "Filters" },
  { id: "visualization", label: "Widgets" },
  { id: "layout", label: "Layout" },
  { id: "export-options", label: "Export Options" },
  { id: "save", label: "Save" },
];

interface ReportBuilderPanelProps {
  stage: ReportBuilderStage;
  widgetTypes: WidgetTypeDefinition[];
  onSelectData: (input: { module: ModuleCategory; category: ReportCategory; dimensions?: ReportDimension[] }) => void;
  onSelectMetrics: (metrics: ReportMetric[]) => void;
  onApplyFilters: (filters: ReportFilter[]) => void;
  onApplyVisualization: (widgets: ReportWidget[]) => void;
  onApplyLayout: (layout: ReportLayout) => void;
  onApplyExportOptions: (options: { supportedExports: ExportFormat[]; supportedSchedules?: ScheduleFrequency[] }) => void;
  onCreateWidget: (params: { type: WidgetTypeDefinition["type"]; title: string; metricIds?: string[]; dimensionIds?: string[] }) => ReportWidget;
  onSave: (input: ReportBuilderSaveInput) => void;
  onCancel: () => void;
}

function genLocalId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function ReportBuilderPanel({
  stage,
  widgetTypes,
  onSelectData,
  onSelectMetrics,
  onApplyFilters,
  onApplyVisualization,
  onApplyLayout,
  onApplyExportOptions,
  onCreateWidget,
  onSave,
  onCancel,
}: ReportBuilderPanelProps) {
  const [activeStep, setActiveStep] = useState(0);

  const [module, setModule] = useState<ModuleCategory>("analytics");
  const [category, setCategory] = useState<ReportCategory>("analytics");
  const [dimensions, setDimensions] = useState<ReportDimension[]>([]);
  const [dimensionDraft, setDimensionDraft] = useState({ name: "", field: "", type: "time" as ReportDimension["type"] });

  const [metrics, setMetrics] = useState<ReportMetric[]>([]);
  const [metricDraft, setMetricDraft] = useState({ name: "", field: "", aggregation: "sum" as ReportMetric["aggregation"], format: "number" as ReportMetric["format"] });

  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [filterDraft, setFilterDraft] = useState({ field: "", label: "", operator: "equals" as ReportFilter["operator"], value: "" });

  const [widgets, setWidgets] = useState<ReportWidget[]>([]);
  const [widgetDraft, setWidgetDraft] = useState<{ type: WidgetTypeDefinition["type"]; title: string; metricIds: string[]; dimensionIds: string[] }>({
    type: widgetTypes[0]?.type ?? "kpi-card",
    title: "",
    metricIds: [],
    dimensionIds: [],
  });

  const [layoutType, setLayoutType] = useState<ReportLayout["type"]>("grid");
  const [exportFormats, setExportFormats] = useState<Set<ExportFormat>>(new Set(["pdf", "csv"]));
  const [scheduleFreqs, setScheduleFreqs] = useState<Set<ScheduleFrequency>>(new Set(["manual"]));

  const [saveMeta, setSaveMeta] = useState({ name: "", description: "", owner: DEMO_OWNER, tags: "" });

  const goTo = (index: number) => setActiveStep(Math.max(0, Math.min(STEPS.length - 1, index)));

  const commitAndNext = () => {
    switch (STEPS[activeStep].id) {
      case "data":
        onSelectData({ module, category, dimensions });
        break;
      case "metrics":
        onSelectMetrics(metrics);
        break;
      case "filters":
        onApplyFilters(filters);
        break;
      case "visualization":
        onApplyVisualization(widgets);
        break;
      case "layout": {
        const placements = widgets.map((w, i) => ({ widgetId: w.id, x: (i % 2) * 6, y: Math.floor(i / 2) * 4, w: 6, h: 4 }));
        onApplyLayout({ type: layoutType, widgetPlacements: placements });
        break;
      }
      case "export-options":
        onApplyExportOptions({ supportedExports: Array.from(exportFormats), supportedSchedules: Array.from(scheduleFreqs) });
        break;
      case "save":
        onSave({
          name: saveMeta.name || "Untitled Report",
          description: saveMeta.description,
          owner: saveMeta.owner || DEMO_OWNER,
          tags: saveMeta.tags
            .split(",")
            .map(t => t.trim())
            .filter(Boolean),
        });
        return;
    }
    goTo(activeStep + 1);
  };

  return (
    <div className="card p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground">Build a Report</p>
        <span className="badge badge-outline">Builder stage: {stage}</span>
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {STEPS.map((step, i) => (
          <button
            key={step.id}
            type="button"
            onClick={() => goTo(i)}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition-colors",
              i === activeStep ? "bg-primary/10 text-primary" : i < activeStep ? "text-success" : "text-muted-foreground hover:bg-accent"
            )}
          >
            {i < activeStep && <Check size={11} />}
            {i + 1}. {step.label}
          </button>
        ))}
      </div>

      {STEPS[activeStep].id === "data" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Module</label>
              <select value={module} onChange={e => setModule(e.target.value as ModuleCategory)} className="input">
                {MODULE_OPTIONS.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value as ReportCategory)} className="input">
                {REPORT_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Dimensions</label>
            <div className="mb-2 flex gap-1.5">
              <Input inputSize="sm" placeholder="Name" value={dimensionDraft.name} onChange={e => setDimensionDraft(p => ({ ...p, name: e.target.value }))} />
              <Input inputSize="sm" placeholder="Field" value={dimensionDraft.field} onChange={e => setDimensionDraft(p => ({ ...p, field: e.target.value }))} />
              <select
                value={dimensionDraft.type}
                onChange={e => setDimensionDraft(p => ({ ...p, type: e.target.value as ReportDimension["type"] }))}
                className="input w-32"
              >
                {DIMENSION_TYPE_OPTIONS.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => {
                  if (!dimensionDraft.name.trim() || !dimensionDraft.field.trim()) return;
                  setDimensions(prev => [...prev, { id: genLocalId("dim"), name: dimensionDraft.name, field: dimensionDraft.field, type: dimensionDraft.type }]);
                  setDimensionDraft({ name: "", field: "", type: "time" });
                }}
              >
                <Plus size={13} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {dimensions.map(d => (
                <span key={d.id} className="badge badge-secondary gap-1">
                  {d.name}
                  <button type="button" onClick={() => setDimensions(prev => prev.filter(x => x.id !== d.id))}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {STEPS[activeStep].id === "metrics" && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            <Input inputSize="sm" placeholder="Name" value={metricDraft.name} onChange={e => setMetricDraft(p => ({ ...p, name: e.target.value }))} />
            <Input inputSize="sm" placeholder="Field" value={metricDraft.field} onChange={e => setMetricDraft(p => ({ ...p, field: e.target.value }))} />
            <select value={metricDraft.aggregation} onChange={e => setMetricDraft(p => ({ ...p, aggregation: e.target.value as ReportMetric["aggregation"] }))} className="input w-28">
              {AGGREGATION_OPTIONS.map(o => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <select value={metricDraft.format} onChange={e => setMetricDraft(p => ({ ...p, format: e.target.value as ReportMetric["format"] }))} className="input w-28">
              {["number", "percent", "currency", "duration"].map(f => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => {
                if (!metricDraft.name.trim() || !metricDraft.field.trim()) return;
                setMetrics(prev => [...prev, { id: genLocalId("met"), ...metricDraft }]);
                setMetricDraft({ name: "", field: "", aggregation: "sum", format: "number" });
              }}
            >
              <Plus size={13} />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {metrics.map(m => (
              <span key={m.id} className="badge badge-secondary gap-1">
                {m.name}
                <button type="button" onClick={() => setMetrics(prev => prev.filter(x => x.id !== m.id))}>
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {STEPS[activeStep].id === "filters" && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            <Input inputSize="sm" placeholder="Field" value={filterDraft.field} onChange={e => setFilterDraft(p => ({ ...p, field: e.target.value }))} />
            <Input inputSize="sm" placeholder="Label" value={filterDraft.label} onChange={e => setFilterDraft(p => ({ ...p, label: e.target.value }))} />
            <select value={filterDraft.operator} onChange={e => setFilterDraft(p => ({ ...p, operator: e.target.value as ReportFilter["operator"] }))} className="input w-36">
              {FILTER_OPERATOR_OPTIONS.map(o => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <Input inputSize="sm" placeholder="Value" value={filterDraft.value} onChange={e => setFilterDraft(p => ({ ...p, value: e.target.value }))} />
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => {
                if (!filterDraft.field.trim()) return;
                setFilters(prev => [...prev, { id: genLocalId("flt"), ...filterDraft }]);
                setFilterDraft({ field: "", label: "", operator: "equals", value: "" });
              }}
            >
              <Plus size={13} />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filters.map(f => (
              <span key={f.id} className="badge badge-secondary gap-1">
                {f.label || f.field} {f.operator} {String(f.value)}
                <button type="button" onClick={() => setFilters(prev => prev.filter(x => x.id !== f.id))}>
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {STEPS[activeStep].id === "visualization" && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <select value={widgetDraft.type} onChange={e => setWidgetDraft(p => ({ ...p, type: e.target.value as WidgetTypeDefinition["type"] }))} className="input w-40">
              {widgetTypes.map(w => (
                <option key={w.type} value={w.type}>
                  {w.label}
                </option>
              ))}
            </select>
            <Input inputSize="sm" placeholder="Widget title" value={widgetDraft.title} onChange={e => setWidgetDraft(p => ({ ...p, title: e.target.value }))} />
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => {
                if (!widgetDraft.title.trim()) return;
                const widget = onCreateWidget({ type: widgetDraft.type, title: widgetDraft.title, metricIds: metrics.map(m => m.id), dimensionIds: dimensions.map(d => d.id) });
                setWidgets(prev => [...prev, widget]);
                setWidgetDraft(p => ({ ...p, title: "" }));
              }}
            >
              <Plus size={13} /> Add Widget
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">New widgets bind to all metrics/dimensions selected in earlier steps.</p>
          <div className="space-y-1.5">
            {widgets.map(w => (
              <div key={w.id} className="flex items-center justify-between rounded-xl bg-accent/30 px-3 py-1.5 text-xs">
                <span className="text-foreground">
                  {w.title} <span className="text-muted-foreground">({w.type})</span>
                </span>
                <button type="button" onClick={() => setWidgets(prev => prev.filter(x => x.id !== w.id))} className="text-muted-foreground hover:text-destructive">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {STEPS[activeStep].id === "layout" && (
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Layout Type</label>
          <select value={layoutType} onChange={e => setLayoutType(e.target.value as ReportLayout["type"])} className="input max-w-xs">
            {LAYOUT_TYPE_OPTIONS.map(o => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-[11px] text-muted-foreground">Widget positions are arranged automatically in a two-column grid.</p>
        </div>
      )}

      {STEPS[activeStep].id === "export-options" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Supported Exports</p>
            <div className="space-y-1">
              {EXPORT_FORMATS.map(f => (
                <label key={f.id} className="flex items-center gap-2 text-xs text-foreground">
                  <input
                    type="checkbox"
                    checked={exportFormats.has(f.id)}
                    onChange={e =>
                      setExportFormats(prev => {
                        const next = new Set(prev);
                        if (e.target.checked) next.add(f.id);
                        else next.delete(f.id);
                        return next;
                      })
                    }
                  />
                  {f.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Supported Schedules</p>
            <div className="space-y-1">
              {SCHEDULE_FREQUENCIES.map(f => (
                <label key={f.id} className="flex items-center gap-2 text-xs text-foreground">
                  <input
                    type="checkbox"
                    checked={scheduleFreqs.has(f.id)}
                    onChange={e =>
                      setScheduleFreqs(prev => {
                        const next = new Set(prev);
                        if (e.target.checked) next.add(f.id);
                        else next.delete(f.id);
                        return next;
                      })
                    }
                  />
                  {f.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {STEPS[activeStep].id === "save" && (
        <div className="space-y-2.5">
          <Input label="Name" value={saveMeta.name} onChange={e => setSaveMeta(p => ({ ...p, name: e.target.value }))} />
          <Input label="Description" value={saveMeta.description} onChange={e => setSaveMeta(p => ({ ...p, description: e.target.value }))} />
          <Input label="Owner" value={saveMeta.owner} onChange={e => setSaveMeta(p => ({ ...p, owner: e.target.value }))} />
          <Input label="Tags (comma separated)" value={saveMeta.tags} onChange={e => setSaveMeta(p => ({ ...p, tags: e.target.value }))} />
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex gap-1.5">
          {activeStep > 0 && (
            <Button size="sm" variant="outline" onClick={() => goTo(activeStep - 1)}>
              Back
            </Button>
          )}
          <Button size="sm" onClick={commitAndNext}>
            {STEPS[activeStep].id === "save" ? "Save Report" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
