/**
 * Calixo Platform - Search Platform
 *
 * A real, working in-memory full-text/faceted search index — not a mock.
 * Documents are tokenized and scored by term-frequency overlap; facets
 * (`entityType`, `organizationId`, `workspaceId`, `tags`) are plain
 * pre-filters applied before scoring. Hybrid/vector/semantic search are
 * declared in `SearchMode` (types.ts) but NOT implemented here — there is
 * no embeddings/vector store in this codebase yet (see AI Persistence
 * Readiness in the final report); wiring a real one in without redesigning
 * this index's public shape is exactly what the `mode` parameter prepares.
 */
import { platformEventBus } from "../events/PlatformEventBus";
import type { SearchDocument, SearchMode, SearchQuery, SearchResult } from "./types";

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

export class SearchIndex {
  private documents = new Map<string, SearchDocument>();

  async index(document: SearchDocument): Promise<void> {
    this.documents.set(document.id, document);
    await platformEventBus.publish({
      type: "SearchIndexed",
      organizationId: document.organizationId,
      workspaceId: document.workspaceId,
      payload: { entityType: document.entityType, documentId: document.id },
    });
  }

  remove(id: string): boolean {
    return this.documents.delete(id);
  }

  query(query: SearchQuery, mode: SearchMode = "full_text"): SearchResult[] {
    if (mode !== "full_text") {
      throw new Error(`Search mode '${mode}' is prepared (see SearchMode) but not implemented this phase — full_text is the only working mode.`);
    }

    const queryTerms = tokenize(query.text);
    let candidates = Array.from(this.documents.values());

    if (query.entityType) candidates = candidates.filter(d => d.entityType === query.entityType);
    if (query.organizationId) candidates = candidates.filter(d => d.organizationId === query.organizationId);
    if (query.workspaceId) candidates = candidates.filter(d => d.workspaceId === query.workspaceId);
    if (query.tags && query.tags.length > 0) candidates = candidates.filter(d => query.tags!.some(t => d.tags?.includes(t)));

    const results: SearchResult[] = candidates
      .map(document => {
        const haystack = tokenize(`${document.title} ${document.body ?? ""}`);
        const score = queryTerms.reduce((acc, term) => acc + haystack.filter(word => word.includes(term)).length, 0);
        return { document, score };
      })
      .filter(result => queryTerms.length === 0 || result.score > 0)
      .sort((a, b) => b.score - a.score);

    return query.limit ? results.slice(0, query.limit) : results;
  }

  count(): number {
    return this.documents.size;
  }
}

/** Named registry of indices — mirrors `CacheEngine`'s "one per concern" convention (e.g. an index per entity type, or one global index). */
export class SearchRegistry {
  private indices = new Map<string, SearchIndex>();

  index(name: string): SearchIndex {
    let idx = this.indices.get(name);
    if (!idx) {
      idx = new SearchIndex();
      this.indices.set(name, idx);
    }
    return idx;
  }

  count(): number {
    return this.indices.size;
  }
}

export const searchRegistry = new SearchRegistry();
