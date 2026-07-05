"use client";

/**
 * Calixo Settings Center - ranked settings search state.
 * The only place allowed to call SettingsSearchEngine.
 */

import { useCallback, useState } from "react";
import { settingsSearchEngine } from "@/core/settings";
import type { SettingsSearchParams, SettingsSearchResult } from "@/core/settings";
import type { ModuleCategory } from "@/core/modules/ModuleTypes";

export function useSettingsSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SettingsSearchResult[]>([]);

  const runSearch = useCallback((params: SettingsSearchParams): SettingsSearchResult[] => {
    const next = settingsSearchEngine.search(params);
    setResults(next);
    return next;
  }, []);

  const searchKeyword = useCallback(
    (keyword: string) => {
      setQuery(keyword);
      return runSearch({ query: keyword });
    },
    [runSearch]
  );

  const searchByModule = useCallback((module: ModuleCategory) => runSearch({ module }), [runSearch]);
  const searchByCategory = useCallback((category: string) => runSearch({ category }), [runSearch]);
  const searchByTag = useCallback((tag: string) => runSearch({ tag }), [runSearch]);

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
  }, []);

  return { query, results, runSearch, searchKeyword, searchByModule, searchByCategory, searchByTag, clear };
}
