"use client";

import { Download, RotateCcw, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SettingsGroupDefinition } from "@/core/settings";

interface SettingsHeaderProps {
  group: SettingsGroupDefinition | null;
  category: string | null;
  settingCount: number;
  changedCount: number;
  onSave: () => void;
  onResetGroup: () => void;
  onResetAll: () => void;
}

export function SettingsHeader({ group, category, settingCount, changedCount, onSave, onResetGroup, onResetAll }: SettingsHeaderProps) {
  return (
    <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5">
      <div className="min-w-0">
        <h1 className="truncate text-[15px] font-semibold text-foreground">{group ? group.label : "Settings"}</h1>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted-foreground">
          {category && <span className="badge badge-primary">{category}</span>}
          <span>{settingCount} setting{settingCount === 1 ? "" : "s"}</span>
          {changedCount > 0 && <span className="badge badge-warning">{changedCount} changed</span>}
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-1.5">
        <Button size="sm" variant="ghost" onClick={onResetAll} className="gap-1.5">
          <RotateCcw size={13} /> Reset All
        </Button>
        <Button size="sm" variant="ghost" onClick={onResetGroup} disabled={!group} className="gap-1.5">
          <RotateCcw size={13} /> Reset Group
        </Button>
        <Button size="sm" variant="outline" disabled title="Import (coming soon)" className="gap-1.5">
          <Upload size={13} /> Import
        </Button>
        <Button size="sm" variant="outline" disabled title="Export (coming soon)" className="gap-1.5">
          <Download size={13} /> Export
        </Button>
        <Button size="sm" onClick={onSave} disabled={changedCount === 0} className="gap-1.5">
          <Save size={13} /> Save {changedCount > 0 ? `(${changedCount})` : ""}
        </Button>
      </div>
    </div>
  );
}
