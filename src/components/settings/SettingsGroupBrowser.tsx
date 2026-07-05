"use client";

import { cn } from "@/lib/utils";
import type { SettingsGroupDefinition, SettingsGroupId } from "@/core/settings";

interface SettingsGroupBrowserProps {
  groups: SettingsGroupDefinition[];
  currentGroupId: SettingsGroupId | null;
  countsByGroup: Partial<Record<SettingsGroupId, number>>;
  onSelectGroup: (id: SettingsGroupId) => void;
}

export function SettingsGroupBrowser({ groups, currentGroupId, countsByGroup, onSelectGroup }: SettingsGroupBrowserProps) {
  return (
    <div className="space-y-0.5">
      {groups.map(group => (
        <button
          key={group.id}
          type="button"
          onClick={() => onSelectGroup(group.id)}
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition-colors",
            currentGroupId === group.id ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
          )}
        >
          <span className="truncate">{group.label}</span>
          <span className="flex-shrink-0 text-[10px] text-muted-foreground">{countsByGroup[group.id] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}
