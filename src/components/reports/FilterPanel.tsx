"use client";

import { useEffect, useState } from "react";
import { Filter as FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import type { ReportFilter } from "@/core/reports";

interface FilterPanelProps {
  filters: ReportFilter[];
  onApply: (filters: ReportFilter[]) => void;
}

export function FilterPanel({ filters, onApply }: FilterPanelProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      setValues(Object.fromEntries(filters.map(f => [f.id, String(f.value ?? "")])));
    })();
  }, [filters]);

  if (filters.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <FilterIcon size={18} className="text-muted-foreground" />
        <p className="text-xs text-muted-foreground">This report has no filters defined.</p>
      </div>
    );
  }

  const handleApply = () => {
    onApply(filters.map(f => ({ ...f, value: values[f.id] ?? f.value })));
  };

  return (
    <div className="space-y-3">
      {filters.map(filter => (
        <div key={filter.id}>
          <label className="mb-1 flex items-center justify-between text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            <span>{filter.label || filter.field}</span>
            <span className="normal-case text-muted-foreground/70">{filter.operator.replace("_", " ")}</span>
          </label>
          <Input inputSize="sm" value={values[filter.id] ?? ""} onChange={e => setValues(prev => ({ ...prev, [filter.id]: e.target.value }))} />
        </div>
      ))}
      <Button size="sm" onClick={handleApply} className="w-full">
        Apply Filters
      </Button>
    </div>
  );
}
