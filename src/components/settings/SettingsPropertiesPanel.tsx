"use client";

import type { SettingDefinition } from "@/core/settings";
import { MODULE_OPTIONS } from "./constants";

interface SettingsPropertiesPanelProps {
  setting: SettingDefinition | null;
  section: "properties" | "metadata";
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function stringifyValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function SettingsPropertiesPanel({ setting, section }: SettingsPropertiesPanelProps) {
  if (!setting) return <p className="text-xs text-muted-foreground">Select a setting to see its details.</p>;

  const moduleLabel = MODULE_OPTIONS.find(m => m.id === setting.module)?.label ?? setting.module;

  if (section === "metadata") {
    return (
      <div className="divide-y divide-border/50">
        <Row label="Default Value" value={stringifyValue(setting.defaultValue)} />
        <Row label="Current Value" value={stringifyValue(setting.currentValue)} />
        <Row label="Options" value={setting.options?.length ?? 0} />
        <Row label="Validation Rules" value={setting.validation.length} />
        <Row label="Tags" value={setting.tags.length} />
        <Row label="Permissions" value={setting.permissions.length} />
        {setting.metadata && Object.keys(setting.metadata).length > 0 ? (
          <div className="py-1.5">
            <p className="mb-1 text-xs text-muted-foreground">Extra Metadata</p>
            <pre className="scrollbar-thin overflow-x-auto rounded-lg bg-accent/50 p-2 text-[10px] text-foreground">{JSON.stringify(setting.metadata, null, 2)}</pre>
          </div>
        ) : (
          <Row label="Extra Metadata" value="None" />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{setting.description}</p>
      <div className="divide-y divide-border/50">
        <Row label="Key" value={setting.key} />
        <Row label="Module" value={moduleLabel} />
        <Row label="Category" value={setting.category} />
        <Row label="Group" value={setting.group} />
        <Row label="Type" value={setting.type} />
        <Row label="Required" value={setting.required ? "Yes" : "No"} />
        <Row label="Read-only" value={setting.readonly ? "Yes" : "No"} />
        <Row label="Hidden" value={setting.hidden ? "Yes" : "No"} />
      </div>
      <div>
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Tags</p>
        <div className="flex flex-wrap gap-1.5">
          {setting.tags.length > 0 ? setting.tags.map(tag => <span key={tag} className="badge badge-secondary">{tag}</span>) : <span className="text-xs text-muted-foreground">None</span>}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Permissions</p>
        <div className="flex flex-wrap gap-1.5">
          {setting.permissions.length > 0 ? (
            setting.permissions.map(p => <span key={p} className="badge badge-outline">{p}</span>)
          ) : (
            <span className="text-xs text-muted-foreground">None</span>
          )}
        </div>
      </div>
    </div>
  );
}
