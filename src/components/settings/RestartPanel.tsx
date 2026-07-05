"use client";

import { useMemo } from "react";
import { RefreshCcw } from "lucide-react";
import type { SettingDefinition } from "@/core/settings";
import { MODULE_OPTIONS } from "./constants";

interface RestartPanelProps {
  settings: SettingDefinition[];
}

export function RestartPanel({ settings }: RestartPanelProps) {
  const restartRequired = useMemo(() => settings.filter(s => s.restartRequired), [settings]);

  const grouped = useMemo(() => {
    const groups = new Map<string, SettingDefinition[]>();
    for (const setting of restartRequired) {
      const list = groups.get(setting.module) ?? [];
      list.push(setting);
      groups.set(setting.module, list);
    }
    return Array.from(groups.entries());
  }, [restartRequired]);

  if (restartRequired.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <RefreshCcw size={18} className="text-muted-foreground" />
        <p className="text-xs text-muted-foreground">No settings currently require a restart.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {grouped.map(([module, moduleSettings]) => (
        <div key={module}>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {MODULE_OPTIONS.find(m => m.id === module)?.label ?? module} ({moduleSettings.length})
          </p>
          <div className="space-y-1">
            {moduleSettings.map(setting => (
              <div key={setting.id} className="rounded-xl bg-accent/30 px-2.5 py-2">
                <p className="text-xs font-medium text-foreground">{setting.label}</p>
                <p className="text-[10px] text-muted-foreground">{setting.key}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
