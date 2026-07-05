"use client";

import { GitBranch } from "lucide-react";
import type { SettingDefinition } from "@/core/settings";

interface DependencyPanelProps {
  setting: SettingDefinition | null;
}

/**
 * Architecture only — no SettingsDependencyRegistry exists yet. This
 * shows where dependency relationships (e.g. "requires X to be enabled")
 * will render once that registry is built; it never fabricates real
 * dependency data.
 */
export function DependencyPanel({ setting }: DependencyPanelProps) {
  if (!setting) return <p className="text-xs text-muted-foreground">Select a setting to see its dependencies.</p>;

  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <GitBranch size={18} className="text-muted-foreground" />
      <p className="text-xs font-medium text-foreground">No dependency data yet</p>
      <p className="max-w-[220px] text-[11px] text-muted-foreground">
        A future <span className="font-medium text-foreground">SettingsDependencyRegistry</span> will populate relationships for <span className="font-medium text-foreground">{setting.key}</span> here.
      </p>
    </div>
  );
}
