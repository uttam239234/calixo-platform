/**
 * Calixo Platform - AIOS Repository Interfaces
 *
 * Repository pattern interfaces for AIOS data access.
 * Abstracts Prisma/DB access from business logic.
 */

import type {
  Prompt, PromptVersion, CreatePromptRequest,
  Agent, AgentExecution,
  KnowledgeDocument, KnowledgeChunk,
  AIAnalyticsRecord, AIAnalyticsSummary,
  ConversationMemory, MemoryEntry,
  PaginatedPrompts, PaginatedAgents, PaginatedAnalytics,
  PaginatedKnowledge, PaginatedMemory,
} from '@/aios/types';
import type { AIModel, AIProvider, AIAction } from '@/aios/types';

// ============================================================================
// Prompt Repository
// ============================================================================

export interface PromptRepository {
  getById(id: string): Promise<Prompt | null>;
  getByKey(key: string): Promise<Prompt | null>;
  getAll(): Promise<Prompt[]>;
  getByCategory(category: string): Promise<Prompt[]>;
  getPaginated(params: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedPrompts>;
  create(data: CreatePromptRequest): Promise<Prompt>;
  update(id: string, content: string, variables: string[]): Promise<Prompt>;
  approve(id: string, approvedBy: string): Promise<Prompt>;
  softDelete(id: string): Promise<boolean>;
  existsByKey(key: string): Promise<boolean>;
}

export interface PromptVersionRepository {
  getByPromptId(promptId: string): Promise<PromptVersion[]>;
  getByVersion(promptId: string, version: number): Promise<PromptVersion | null>;
  create(version: PromptVersion): Promise<PromptVersion>;
  deleteByPromptId(promptId: string): Promise<number>;
}

// ============================================================================
// Agent Repository
// ============================================================================

export interface AgentRepository {
  getById(id: string): Promise<Agent | null>;
  getByName(name: string): Promise<Agent | null>;
  getAll(): Promise<Agent[]>;
  getActive(): Promise<Agent[]>;
  getPaginated(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedAgents>;
  create(agent: Agent): Promise<Agent>;
  update(id: string, updates: Partial<Agent>): Promise<Agent>;
  delete(id: string): Promise<boolean>;
  setStatus(id: string, status: string): Promise<Agent>;
  existsByName(name: string): Promise<boolean>;
}

export interface AgentExecutionRepository {
  getById(id: string): Promise<AgentExecution | null>;
  getByAgent(agentId: string): Promise<AgentExecution[]>;
  getByUser(userId: string): Promise<AgentExecution[]>;
  create(execution: AgentExecution): Promise<AgentExecution>;
  update(id: string, updates: Partial<AgentExecution>): Promise<AgentExecution>;
  complete(id: string, output: string, usage: AgentExecution['usage'], latency: number): Promise<AgentExecution>;
  fail(id: string, error: string): Promise<AgentExecution>;
}

// ============================================================================
// Knowledge Repository
// ============================================================================

export interface KnowledgeRepository {
  getById(id: string): Promise<KnowledgeDocument | null>;
  getByOrganization(organizationId: string): Promise<KnowledgeDocument[]>;
  getPaginated(params: {
    organizationId: string;
    page?: number;
    limit?: number;
    status?: string;
    source?: string;
    search?: string;
  }): Promise<PaginatedKnowledge>;
  create(doc: KnowledgeDocument): Promise<KnowledgeDocument>;
  update(id: string, updates: Partial<KnowledgeDocument>): Promise<KnowledgeDocument>;
  softDelete(id: string): Promise<boolean>;
  hardDelete(id: string): Promise<boolean>;
  countByOrganization(organizationId: string): Promise<number>;
}

export interface KnowledgeChunkRepository {
  getByDocument(documentId: string): Promise<KnowledgeChunk[]>;
  createMany(chunks: KnowledgeChunk[]): Promise<number>;
  deleteByDocument(documentId: string): Promise<number>;
  searchByContent(query: string, limit?: number): Promise<KnowledgeChunk[]>;
}

// ============================================================================
// Memory Repository
// ============================================================================

export interface MemoryRepository {
  getById(id: string): Promise<MemoryEntry | null>;
  getByScope(scope: string, scopeId: string): Promise<MemoryEntry[]>;
  getByScopeAndKey(scope: string, scopeId: string, key: string): Promise<MemoryEntry | null>;
  getPaginated(params: {
    scope?: string;
    scopeId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedMemory>;
  create(entry: MemoryEntry): Promise<MemoryEntry>;
  update(id: string, updates: Partial<MemoryEntry>): Promise<MemoryEntry>;
  delete(id: string): Promise<boolean>;
  deleteExpired(): Promise<number>;
  search(scope: string, scopeId: string, query: string): Promise<MemoryEntry[]>;
}

export interface ConversationMemoryRepository {
  getBySessionId(sessionId: string): Promise<ConversationMemory | null>;
  getByUser(userId: string): Promise<ConversationMemory[]>;
  getByOrganization(organizationId: string): Promise<ConversationMemory[]>;
  create(memory: ConversationMemory): Promise<ConversationMemory>;
  update(sessionId: string, updates: Partial<ConversationMemory>): Promise<ConversationMemory>;
  delete(sessionId: string): Promise<boolean>;
  deleteExpired(maxAgeMinutes: number): Promise<number>;
}

// ============================================================================
// Analytics Repository
// ============================================================================

export interface AIAnalyticsRepository {
  getById(id: string): Promise<AIAnalyticsRecord | null>;
  getByOrganization(organizationId: string): Promise<AIAnalyticsRecord[]>;
  getByUser(userId: string): Promise<AIAnalyticsRecord[]>;
  getByModel(model: AIModel): Promise<AIAnalyticsRecord[]>;
  getByDateRange(startDate: string, endDate: string): Promise<AIAnalyticsRecord[]>;
  getPaginated(params: {
    organizationId?: string;
    model?: AIModel;
    module?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedAnalytics>;
  create(record: AIAnalyticsRecord): Promise<AIAnalyticsRecord>;
  getSummary(params: {
    organizationId?: string;
    periodStart?: string;
    periodEnd?: string;
  }): Promise<AIAnalyticsSummary>;
  deleteOlderThan(date: string): Promise<number>;
}

// ============================================================================
// Gateway Repository
// ============================================================================

export interface AIGatewayRequestLog {
  getById(id: string): Promise<AIAnalyticsRecord | null>;
  create(log: AIAnalyticsRecord): Promise<AIAnalyticsRecord>;
  getStats(params: {
    organizationId?: string;
    periodStart?: string;
    periodEnd?: string;
  }): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    averageLatency: number;
    successRate: number;
  }>;
}