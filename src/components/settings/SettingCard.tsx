"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, FileWarning, FlaskConical, Lock, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SettingDefinition, SettingsValidationResult } from "@/core/settings";

interface SettingCardProps {
  setting: SettingDefinition;
  value: unknown;
  isDirty: boolean;
  isSelected: boolean;
  validation?: SettingsValidationResult;
  onChange: (value: unknown) => void;
  onSelect: () => void;
  onReset: () => void;
}

function SettingControl({ setting, value, onChange }: { setting: SettingDefinition; value: unknown; onChange: (value: unknown) => void }) {
  const disabled = setting.readonly;
  const baseInputClass = "input";

  switch (setting.type) {
    case "textarea":
      return (
        <textarea
          className={cn(baseInputClass, "min-h-20 resize-y")}
          value={typeof value === "string" ? value : ""}
          disabled={disabled}
          onChange={e => onChange(e.target.value)}
        />
      );

    case "number":
      return (
        <input
          type="number"
          className={baseInputClass}
          value={typeof value === "number" ? value : ""}
          disabled={disabled}
          onChange={e => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
      );

    case "boolean":
      return (
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={!!value} disabled={disabled} onChange={e => onChange(e.target.checked)} />
          {value ? "Enabled" : "Disabled"}
        </label>
      );

    case "switch":
      return (
        <button
          type="button"
          role="switch"
          aria-checked={!!value}
          disabled={disabled}
          onClick={() => onChange(!value)}
          className={cn(
            "relative h-6 w-11 flex-shrink-0 rounded-full transition-colors disabled:opacity-50",
            value ? "bg-primary" : "bg-border"
          )}
        >
          <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", value ? "translate-x-5" : "translate-x-0.5")} />
        </button>
      );

    case "select":
      return (
        <select className={baseInputClass} value={String(value ?? "")} disabled={disabled} onChange={e => onChange(e.target.value)}>
          {(setting.options ?? []).map(opt => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case "multiselect": {
      const selected = Array.isArray(value) ? value.map(String) : [];
      return (
        <div className="flex flex-wrap gap-2">
          {(setting.options ?? []).map(opt => {
            const optValue = String(opt.value);
            const checked = selected.includes(optValue);
            return (
              <label key={optValue} className="flex items-center gap-1.5 rounded-lg border border-border px-2 py-1 text-xs text-foreground">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={e => {
                    const next = e.target.checked ? [...selected, optValue] : selected.filter(v => v !== optValue);
                    onChange(next);
                  }}
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      );
    }

    case "color":
      return (
        <div className="flex items-center gap-2">
          <input type="color" value={typeof value === "string" ? value : "#000000"} disabled={disabled} onChange={e => onChange(e.target.value)} className="h-9 w-12 rounded-lg border border-border" />
          <input type="text" className={baseInputClass} value={typeof value === "string" ? value : ""} disabled={disabled} onChange={e => onChange(e.target.value)} />
        </div>
      );

    case "json":
      return <JsonControl value={value} disabled={disabled} onChange={onChange} />;

    case "url":
      return <input type="url" className={baseInputClass} value={typeof value === "string" ? value : ""} disabled={disabled} onChange={e => onChange(e.target.value)} />;

    case "email":
      return <input type="email" className={baseInputClass} value={typeof value === "string" ? value : ""} disabled={disabled} onChange={e => onChange(e.target.value)} />;

    case "password":
      return <input type="password" className={baseInputClass} value={typeof value === "string" ? value : ""} disabled={disabled} onChange={e => onChange(e.target.value)} />;

    case "date":
      return <input type="date" className={baseInputClass} value={typeof value === "string" ? value : ""} disabled={disabled} onChange={e => onChange(e.target.value)} />;

    case "time":
      return <input type="time" className={baseInputClass} value={typeof value === "string" ? value : ""} disabled={disabled} onChange={e => onChange(e.target.value)} />;

    case "file":
      return (
        <div className="flex items-center justify-between rounded-2xl border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
          <span>{typeof value === "string" && value ? value : "No file selected"}</span>
          <span className="italic">Upload not available in this preview</span>
        </div>
      );

    case "directory":
      return (
        <div className="flex items-center justify-between rounded-2xl border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
          <span>{typeof value === "string" && value ? value : "No directory selected"}</span>
          <span className="italic">Browse not available in this preview</span>
        </div>
      );

    case "text":
    default:
      return <input type="text" className={baseInputClass} value={typeof value === "string" ? value : ""} disabled={disabled} onChange={e => onChange(e.target.value)} />;
  }
}

function JsonControl({ value, disabled, onChange }: { value: unknown; disabled?: boolean; onChange: (value: unknown) => void }) {
  const [raw, setRaw] = useState(() => JSON.stringify(value ?? {}, null, 2));
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    (async () => {
      setRaw(JSON.stringify(value ?? {}, null, 2));
      setInvalid(false);
    })();
  }, [value]);

  return (
    <div>
      <textarea
        className={cn("input min-h-24 resize-y font-mono text-xs", invalid && "input-error")}
        value={raw}
        disabled={disabled}
        onChange={e => {
          setRaw(e.target.value);
          try {
            const parsed = JSON.parse(e.target.value);
            setInvalid(false);
            onChange(parsed);
          } catch {
            setInvalid(true);
          }
        }}
      />
      {invalid && <p className="mt-1 text-[11px] text-destructive">Invalid JSON — changes won&apos;t be saved until this is fixed.</p>}
    </div>
  );
}

function Badge({ icon: Icon, label, tone }: { icon: typeof Lock; label: string; tone: "warning" | "info" | "destructive" | "ai" | "outline" }) {
  return (
    <span className={cn("badge gap-1", `badge-${tone}`)}>
      <Icon size={10} /> {label}
    </span>
  );
}

export function SettingCard({ setting, value, isDirty, isSelected, validation, onChange, onSelect, onReset }: SettingCardProps) {
  const isDefault = JSON.stringify(value) === JSON.stringify(setting.defaultValue);

  return (
    <div
      className={cn("card cursor-pointer p-4 transition-colors", isSelected && "border-primary/50 ring-1 ring-primary/30")}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === "Enter") onSelect();
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{setting.label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{setting.description}</p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap justify-end gap-1">
          {isDirty && <Badge icon={AlertCircle} label="Unsaved" tone="warning" />}
          {setting.readonly && <Badge icon={Lock} label="Read-only" tone="outline" />}
          {setting.experimental && <Badge icon={FlaskConical} label="Experimental" tone="ai" />}
          {setting.restartRequired && <Badge icon={FileWarning} label="Restart" tone="destructive" />}
          {setting.featureFlag && <Badge icon={Sparkles} label={setting.featureFlag} tone="info" />}
        </div>
      </div>

      <div className="mt-3" onClick={e => e.stopPropagation()}>
        <SettingControl setting={setting} value={value} onChange={onChange} />
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{isDefault ? "Using default value" : "Customized"}</span>
        <div className="flex items-center gap-2">
          {validation && (
            <span className={cn("flex items-center gap-1", validation.valid ? "text-success" : "text-destructive")}>
              {validation.valid ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
              {validation.valid ? "Valid" : `${validation.issues.length} issue(s)`}
            </span>
          )}
          {!isDefault && !setting.readonly && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onReset();
              }}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw size={11} /> Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
