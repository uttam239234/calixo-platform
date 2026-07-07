/**
 * Calixo Platform - Search Platform API
 */
import type { SearchDocument, SearchMode, SearchQuery, SearchResult } from "./types";
import { searchRegistry } from "./SearchEngine";

const DEFAULT_INDEX = "global";

export class SearchPlatformAPI {
  async index(document: SearchDocument, indexName = DEFAULT_INDEX): Promise<void> {
    await searchRegistry.index(indexName).index(document);
  }

  remove(id: string, indexName = DEFAULT_INDEX): boolean {
    return searchRegistry.index(indexName).remove(id);
  }

  search(query: SearchQuery, mode: SearchMode = "full_text", indexName = DEFAULT_INDEX): SearchResult[] {
    return searchRegistry.index(indexName).query(query, mode);
  }

  count(indexName = DEFAULT_INDEX): number {
    return searchRegistry.index(indexName).count();
  }
}

export const searchPlatformAPI = new SearchPlatformAPI();
