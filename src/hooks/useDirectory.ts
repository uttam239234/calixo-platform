"use client";

/**
 * Calixo Users & Teams Center - ranked directory search state.
 * The only place allowed to call DirectorySearchEngine — components
 * never import it directly.
 */

import { useCallback, useState } from "react";
import { directorySearchEngine } from "@/core/users";
import type { DirectorySearchParams, DirectorySearchResult } from "@/core/users";

const EMPTY_RESULT: DirectorySearchResult = { query: {}, total: 0, items: [] };

export function useDirectory() {
  const [query, setQuery] = useState<DirectorySearchParams>({});
  const [result, setResult] = useState<DirectorySearchResult>(EMPTY_RESULT);

  const search = useCallback((params: DirectorySearchParams) => {
    setQuery(params);
    setResult(directorySearchEngine.search(params));
  }, []);

  const searchKeyword = useCallback(
    (keyword: string) => {
      if (!keyword) {
        setQuery({});
        setResult(EMPTY_RESULT);
        return;
      }
      search({ keyword });
    },
    [search]
  );

  const clear = useCallback(() => {
    setQuery({});
    setResult(EMPTY_RESULT);
  }, []);

  const isActive = Object.keys(query).length > 0;

  return {
    query,
    result,
    isActive,
    search,
    searchKeyword,
    clear,
  };
}

export type UseDirectoryResult = ReturnType<typeof useDirectory>;
