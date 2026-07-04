/**
 * Calixo Platform - Knowledge Service
 *
 * Manages the enterprise knowledge base: document lifecycle, chunking,
 * semantic search, embeddings, and RAG pipeline.
 */

import { appLogger } from '@/logging';
import { NotFoundError, ValidationError } from '@/errors';
import type { KnowledgeDocument, KnowledgeChunk, KnowledgeSource, PaginatedKnowledge } from '@/aios/types';
import { knowledgeEngine } from '@/aios/knowledge/KnowledgeEngine';
import type { KnowledgeRepository, KnowledgeChunkRepository } from '@/aios/repositories/interfaces';
import { InMemoryKnowledgeRepository, InMemoryKnowledgeChunkRepository } from '@/aios/repositories/implementations';

export class KnowledgeService {
  private knowledgeRepo: KnowledgeRepository;
  private chunkRepo: KnowledgeChunkRepository;

  constructor(
    knowledgeRepo?: KnowledgeRepository,
    chunkRepo?: KnowledgeChunkRepository,
  ) {
    this.knowledgeRepo = knowledgeRepo || new InMemoryKnowledgeRepository();
    this.chunkRepo = chunkRepo || new InMemoryKnowledgeChunkRepository();
  }

  async getDocument(id: string): Promise<KnowledgeDocument> {
    const doc = await this.knowledgeRepo.getById(id);
    if (!doc) throw new NotFoundError('Knowledge Document');
    return doc;
  }

  async getDocumentsByOrganization(organizationId: string): Promise<KnowledgeDocument[]> {
    return this.knowledgeRepo.getByOrganization(organizationId);
  }

  async getPaginatedDocuments(params: {
    organizationId: string;
    page?: number;
    limit?: number;
    status?: string;
    source?: string;
    search?: string;
  }): Promise<PaginatedKnowledge> {
    return this.knowledgeRepo.getPaginated(params);
  }

  async addDocument(params: {
    organizationId: string;
    title: string;
    content: string;
    source: KnowledgeSource;
    tags?: string[];
    metadata?: Record<string, unknown>;
  }): Promise<KnowledgeDocument> {
    if (!params.title || !params.title.trim()) {
      throw new ValidationError('Document title is required');
    }
    if (!params.content || !params.content.trim()) {
      throw new ValidationError('Document content is required');
    }
    if (!params.organizationId) {
      throw new ValidationError('Organization ID is required');
    }

    const doc = await knowledgeEngine.addDocument({
      organizationId: params.organizationId,
      title: params.title,
      content: params.content,
      source: params.source,
      tags: params.tags,
      metadata: params.metadata,
    });

    // Persist to repository
    await this.knowledgeRepo.create(doc);

    // Persist chunks
    const chunks = await knowledgeEngine.getChunks(doc.id);
    if (chunks.length > 0) {
      await this.chunkRepo.createMany(chunks);
    }

    appLogger.info('KnowledgeService', `Document added: ${doc.title} (${doc.chunkCount} chunks)`);
    return doc;
  }

  async updateDocument(id: string, updates: {
    title?: string;
    content?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
  }): Promise<KnowledgeDocument> {
    const doc = await this.knowledgeRepo.getById(id);
    if (!doc) throw new NotFoundError('Knowledge Document');

    const updated = await knowledgeEngine.updateDocument(id, updates);
    await this.knowledgeRepo.update(id, updated);

    if (updates.content) {
      // Re-chunk and update
      await this.chunkRepo.deleteByDocument(id);
      const chunks = await knowledgeEngine.getChunks(id);
      if (chunks.length > 0) {
        await this.chunkRepo.createMany(chunks);
      }
    }

    appLogger.info('KnowledgeService', `Document updated: ${updated.title}`);
    return updated;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const doc = await this.knowledgeRepo.getById(id);
    if (!doc) throw new NotFoundError('Knowledge Document');

    await knowledgeEngine.deleteDocument(id);
    await this.chunkRepo.deleteByDocument(id);

    appLogger.info('KnowledgeService', `Document deleted: ${doc.title}`);
    return this.knowledgeRepo.softDelete(id);
  }

  async hardDeleteDocument(id: string): Promise<boolean> {
    const doc = await this.knowledgeRepo.getById(id);
    if (!doc) throw new NotFoundError('Knowledge Document');

    await this.chunkRepo.deleteByDocument(id);
    return this.knowledgeRepo.hardDelete(id);
  }

  async getChunks(documentId: string): Promise<KnowledgeChunk[]> {
    return this.chunkRepo.getByDocument(documentId);
  }

  async search(params: {
    organizationId: string;
    query: string;
    limit?: number;
    minSimilarity?: number;
  }): Promise<Array<{ document: KnowledgeDocument; chunks: KnowledgeChunk[]; relevance: number }>> {
    if (!params.query || !params.query.trim()) {
      throw new ValidationError('Search query is required');
    }

    return knowledgeEngine.search({
      organizationId: params.organizationId,
      query: params.query,
      limit: params.limit,
      minSimilarity: params.minSimilarity,
    });
  }

  async retrieveContext(params: {
    organizationId: string;
    query: string;
    maxTokens?: number;
  }): Promise<string> {
    return knowledgeEngine.retrieveContext({
      organizationId: params.organizationId,
      query: params.query,
      maxTokens: params.maxTokens,
    });
  }

  async getDocumentCount(organizationId: string): Promise<number> {
    return this.knowledgeRepo.countByOrganization(organizationId);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return knowledgeEngine.generateEmbedding(text);
  }
}

export const knowledgeService = new KnowledgeService();