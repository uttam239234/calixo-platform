"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { SettingDefinition } from "@/core/settings";

interface SettingsCategoryTabsProps {
  settings: SettingDefinition[];
  currentCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function SettingsCategoryTabs({ settings, currentCategory, onSelectCategory }: SettingsCategoryTabsProps) {
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const setting of settings) counts.set(setting.category, (counts.get(setting.category) ?? 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [settings]);

  if (categories.length === 0) return null;

  return (
    <div className="scrollbar-thin flex gap-1.5 overflow-x-auto pb-1">
      <button
        type="button"
        onClick={() => onSelectCategory(null)}
        className={cn(
          "flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
          currentCategory === null ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
        )}
      >
        All ({settings.length})
      </button>
      {categories.map(([category, count]) => (
        <button
          key={category}
          type="button"
          onClick={() => onSelectCategory(category)}
          className={cn(
            "flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
            currentCategory === category ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
          )}
        >
          {category} ({count})
        </button>
      ))}
    </div>
  );
}
