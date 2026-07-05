"use client";

import { Search, X } from "lucide-react";
import type { SettingsSearchResult } from "@/core/settings";

interface SettingsSearchProps {
  query: string;
  results: SettingsSearchResult[];
  onSearch: (query: string) => void;
  onClear: () => void;
  onSelectResult: (settingKey: string) => void;
}

export function SettingsSearch({ query, results, onSearch, onClear, onSelectResult }: SettingsSearchProps) {
  return (
    <div>
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search settings..."
          className="h-8.5 w-full rounded-xl border border-border bg-accent/30 pl-8 pr-7 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40"
        />
        {query && (
          <button type="button" onClick={onClear} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Clear search">
            <X size={13} />
          </button>
        )}
      </div>

      {query && (
        <div className="mt-2 space-y-1">
          <p className="px-1 text-[10px] uppercase tracking-wide text-muted-foreground">{results.length} result{results.length === 1 ? "" : "s"}</p>
          {results.length === 0 ? (
            <p className="px-1 py-2 text-xs text-muted-foreground">No matches</p>
          ) : (
            results.slice(0, 30).map(result => (
              <button
                key={result.setting.id}
                type="button"
                onClick={() => onSelectResult(result.setting.key)}
                className="flex w-full flex-col items-start rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-accent"
              >
                <span className="truncate text-xs font-medium text-foreground">{result.setting.label}</span>
                <span className="text-[10px] text-muted-foreground">
                  {result.setting.group} · {result.setting.category}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
