/**
 * Calixo Platform - Knowledge Engine
 *
 * Enterprise knowledge base with document management, semantic search,
 * chunking, embeddings, and RAG (Retrieval-Augmented Generation) pipeline.
 * Supports manual, integration, upload, web, and API sources.
 */

import { appLogger } from '@/logging';
import { generateId } from '@/shared/utils/string';
import type {
  KnowledgeDocument, KnowledgeChunk, KnowledgeSource, KnowledgeStatus,
  PaginatedKnowledge,
} from '@/aios/types';
// Deliberately does NOT import `@/aios/gateway/AIGateway` here (this round
// made it depend, transitively, on real `server-only` provider keys) —
// `KnowledgeEngine` is reachable from client-safe call chains (via
// `registerCoreExecutionWiring.ts` -> `core/platform/index.ts`), so pulling
// in that dependency would break every client bundle reaching this file,
// the same bug class Round 23 found in the dashboard widget registry.
// Real embeddings for the Knowledge Base are out of this round's scope
// (not named in the brief); `generateEmbedding()` always uses the
// deterministic fallback below until a server-only-safe embedding path
// is built specifically for this engine.

export class KnowledgeEngine {
  private documents: Map<string, KnowledgeDocument> = new Map();
  private chunks: Map<string, KnowledgeChunk[]> = new Map();

  async addDocument(params: {
    organizationId: string;
    title: string;
    content: string;
    source: KnowledgeSource;
    tags?: string[];
    metadata?: Record<string, unknown>;
  }): Promise<KnowledgeDocument> {
    const now = new Date().toISOString();
    const doc: KnowledgeDocument = {
      id: generateId(16),
      organizationId: params.organizationId,
      title: params.title,
      content: params.content,
      source: params.source,
      status: 'processing',
      chunkCount: 0,
      tags: params.tags || [],
      metadata: params.metadata,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };

    this.documents.set(doc.id, doc);

    // Chunk the document
    const docChunks = await this.chunkDocument(doc);
    this.chunks.set(doc.id, docChunks);
    doc.chunkCount = docChunks.length;
    doc.status = 'ready';
    doc.updatedAt = new Date().toISOString();

    appLogger.info('KnowledgeEngine', `Document added: ${doc.title} (${docChunks.length} chunks)`);
    return { ...doc };
  }

  async getDocument(id: string): Promise<KnowledgeDocument | null> {
    const doc = this.documents.get(id);
    if (!doc || doc.isDeleted) return null;
    return { ...doc };
  }

  async getDocumentsByOrganization(organizationId: string): Promise<KnowledgeDocument[]> {
    return Array.from(this.documents.values())
      .filter(d => d.organizationId === organizationId && !d.isDeleted)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getPaginatedDocuments(params: {
    organizationId: string;
    page?: number;
    limit?: number;
    status?: KnowledgeStatus;
    source?: KnowledgeSource;
    search?: string;
  }): Promise<PaginatedKnowledge> {
    let filtered = Array.from(this.documents.values())
      .filter(d => d.organizationId === params.organizationId && !d.isDeleted);

    if (params.status) filtered = filtered.filter(d => d.status === params.status);
    if (params.source) filtered = filtered.filter(d => d.source === params.source);
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q) ||
        d.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = filtered.length;
    const start = (page - 1) * limit;

    return {
      data: filtered.slice(start, start + limit),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateDocument(id: string, updates: Partial<Pick<KnowledgeDocument, 'title' | 'content' | 'tags' | 'metadata'>>): Promise<KnowledgeDocument> {
    const doc = this.documents.get(id);
    if (!doc) throw new Error('Document not found');

    if (updates.title !== undefined) doc.title = updates.title;
    if (updates.content !== undefined) {
      doc.content = updates.content;
      doc.status = 'processing';
      const newChunks = await this.chunkDocument(doc);
      this.chunks.set(doc.id, newChunks);
      doc.chunkCount = newChunks.length;
      doc.status = 'ready';
    }
    if (updates.tags !== undefined) doc.tags = updates.tags;
    if (updates.metadata !== undefined) doc.metadata = updates.metadata;
    doc.updatedAt = new Date().toISOString();

    return { ...doc };
  }

  async deleteDocument(id: string): Promise<boolean> {
    const doc = this.documents.get(id);
    if (!doc) return false;
    doc.isDeleted = true;
    doc.deletedAt = new Date().toISOString();
    doc.updatedAt = doc.deletedAt;
    this.chunks.delete(id);
    return true;
  }

  async search(params: {
    organizationId: string;
    query: string;
    limit?: number;
    minSimilarity?: number;
  }): Promise<Array<{ document: KnowledgeDocument; chunks: KnowledgeChunk[]; relevance: number }>> {
    const queryLower = params.query.toLowerCase();
    const results: Array<{ document: KnowledgeDocument; chunks: KnowledgeChunk[]; relevance: number }> = [];

    for (const doc of this.documents.values()) {
      if (doc.organizationId !== params.organizationId || doc.isDeleted) continue;
      if (doc.status !== 'ready') continue;

      const docChunks = this.chunks.get(doc.id) || [];
      const matchingChunks = docChunks.filter(c =>
        c.content.toLowerCase().includes(queryLower)
      );

      if (matchingChunks.length > 0) {
        // Simple BM25-like relevance scoring
        const relevance = matchingChunks.length / docChunks.length;
        results.push({
          document: { ...doc },
          chunks: matchingChunks,
          relevance,
        });
      }
    }

    results.sort((a, b) => b.relevance - a.relevance);
    return results.slice(0, params.limit || 10);
  }

  async retrieveContext(params: {
    organizationId: string;
    query: string;
    maxTokens?: number;
  }): Promise<string> {
    const results = await this.search({
      organizationId: params.organizationId,
      query: params.query,
      limit: 5,
    });

    if (results.length === 0) return '';

    const contextParts: string[] = ['Relevant Knowledge Base Context:'];

    for (const result of results) {
      contextParts.push(`\n--- Document: ${result.document.title} ---`);
      for (const chunk of result.chunks) {
        contextParts.push(chunk.content);
      }
    }

    return contextParts.join('\n');
  }

  async getChunks(documentId: string): Promise<KnowledgeChunk[]> {
    return this.chunks.get(documentId) || [];
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return this.fallbackEmbed(text);
  }

  private async chunkDocument(doc: KnowledgeDocument): Promise<KnowledgeChunk[]> {
    const paragraphs = doc.content.split(/\n\s*\n/);
    const chunks: KnowledgeChunk[] = [];
    let index = 0;

    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      if (!trimmed) continue;

      // Split large paragraphs into smaller chunks
      if (trimmed.length > 2000) {
        const sentences = trimmed.match(/[^.!?\n]+[.!?]*\s*/g) || [trimmed];
        let currentChunk = '';

        for (const sentence of sentences) {
          if ((currentChunk + sentence).length > 1500 && currentChunk.length > 0) {
            chunks.push({
              id: generateId(16),
              documentId: doc.id,
              content: currentChunk.trim(),
              index,
              metadata: { position: index, charStart: 0, charEnd: currentChunk.length },
            });
            currentChunk = sentence;
            index++;
          } else {
            currentChunk += sentence;
          }
        }

        if (currentChunk.trim()) {
          chunks.push({
            id: generateId(16),
            documentId: doc.id,
            content: currentChunk.trim(),
            index,
            metadata: { position: index, charStart: 0, charEnd: currentChunk.length },
          });
          index++;
        }
      } else {
        chunks.push({
          id: generateId(16),
          documentId: doc.id,
          content: trimmed,
          index,
          metadata: { position: index, charStart: 0, charEnd: trimmed.length },
        });
        index++;
      }
    }

    // Generate embeddings for each chunk
    for (const chunk of chunks) {
      chunk.embedding = await this.generateEmbedding(chunk.content);
    }

    return chunks;
  }

  private fallbackEmbed(text: string): number[] {
    // Simple hash-based embedding fallback (128 dimensions)
    const embedding = new Array(128).fill(0);
    const normalized = text.toLowerCase().trim();

    for (let i = 0; i < normalized.length; i++) {
      const charCode = normalized.charCodeAt(i);
      const bucket = charCode % 128;
      embedding[bucket] += 1;
    }

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= magnitude;
      }
    }

    return embedding;
  }

  async getDocumentCount(organizationId: string): Promise<number> {
    return Array.from(this.documents.values())
      .filter(d => d.organizationId === organizationId && !d.isDeleted).length;
  }

  async getTotalChunks(organizationId: string): Promise<number> {
    let total = 0;
    for (const [docId, docChunks] of this.chunks.entries()) {
      const doc = this.documents.get(docId);
      if (doc && doc.organizationId === organizationId && !doc.isDeleted) {
        total += docChunks.length;
      }
    }
    return total;
  }
}

export const knowledgeEngine = new KnowledgeEngine();