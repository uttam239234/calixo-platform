"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SettingDefinition } from "@/core/settings";

interface FeatureFlagsPanelProps {
  flaggedSettings: SettingDefinition[];
  isEnabled: (flag: string) => boolean;
  onToggle: (flag: string) => void;
}

export function FeatureFlagsPanel({ flaggedSettings, isEnabled, onToggle }: FeatureFlagsPanelProps) {
  if (flaggedSettings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <Sparkles size={18} className="text-muted-foreground" />
        <p className="text-xs text-muted-foreground">No feature-flagged settings registered.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {flaggedSettings.map(setting => {
        const flag = setting.featureFlag!;
        const enabled = isEnabled(flag);
        return (
          <div key={setting.id} className="flex items-center justify-between gap-2 rounded-xl bg-accent/30 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">{setting.label}</p>
              <p className="truncate text-[10px] text-muted-foreground">{flag}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={() => onToggle(flag)}
              className={cn("relative h-5.5 w-10 flex-shrink-0 rounded-full transition-colors", enabled ? "bg-primary" : "bg-border")}
            >
              <span className={cn("absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-transform", enabled ? "translate-x-[19px]" : "translate-x-0.5")} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
