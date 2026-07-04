/**
 * Calixo Platform - AIOS Repository Implementations
 *
 * In-memory implementations of repository interfaces.
 * In production, these would use Prisma for PostgreSQL persistence.
 */

import { generateId } from '@/shared/utils/string';
import type {
  Prompt, PromptVersion, CreatePromptRequest,
  Agent, AgentExecution,
  KnowledgeDocument, KnowledgeChunk,
  AIAnalyticsRecord, AIAnalyticsSummary,
  ConversationMemory, MemoryEntry,
  PaginatedPrompts, PaginatedAgents, PaginatedAnalytics,
  PaginatedKnowledge, PaginatedMemory,
  AIModel, AIProvider,
} from '@/aios/types';
import type {
  PromptRepository, PromptVersionRepository,
  AgentRepository, AgentExecutionRepository,
  KnowledgeRepository, KnowledgeChunkRepository,
  MemoryRepository, ConversationMemoryRepository,
  AIAnalyticsRepository,
} from '@/aios/repositories/interfaces';

// ============================================================================
// In-Memory Prompt Repository
// ============================================================================

export class InMemoryPromptRepository implements PromptRepository {
  private data: Map<string, Prompt> = new Map();

  async getById(id: string): Promise<Prompt | null> { return this.data.get(id) ?? null; }
  async getByKey(key: string): Promise<Prompt | null> {
    return Array.from(this.data.values()).find(p => p.key === key && !p.isDeleted) ?? null;
  }
  async getAll(): Promise<Prompt[]> {
    return Array.from(this.data.values()).filter(p => !p.isDeleted);
  }
  async getByCategory(category: string): Promise<Prompt[]> {
    return Array.from(this.data.values()).filter(p => p.category === category && !p.isDeleted);
  }
  async getPaginated(params: {
    page?: number; limit?: number; category?: string; status?: string; search?: string;
  }): Promise<PaginatedPrompts> {
    let filtered = Array.from(this.data.values()).filter(p => !p.isDeleted);
    if (params.category) filtered = filtered.filter(p => p.category === params.category);
    if (params.status) filtered = filtered.filter(p => p.status === params.status);
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = filtered.length;
    return { data: filtered.slice((page - 1) * limit, page * limit), total, page, limit, totalPages: Math.ceil(total / limit) };
  }
  async create(data: CreatePromptRequest): Promise<Prompt> {
    const now = new Date().toISOString();
    const prompt: Prompt = {
      id: generateId(16), key: data.key, name: data.name,
      description: data.description, category: data.category,
      content: data.content, variables: data.variables || [], version: 1,
      status: 'active', isSystem: data.tags?.includes('system') ?? false,
      tags: data.tags || [], metadata: data.metadata,
      isDeleted: false, createdAt: now, updatedAt: now,
    };
    this.data.set(prompt.id, prompt);
    return { ...prompt };
  }
  async update(id: string, content: string, variables: string[]): Promise<Prompt> {
    const p = this.data.get(id); if (!p) throw new Error('Prompt not found');
    p.content = content; p.variables = variables; p.version++; p.updatedAt = new Date().toISOString();
    return { ...p };
  }
  async approve(id: string, approvedBy: string): Promise<Prompt> {
    const p = this.data.get(id); if (!p) throw new Error('Prompt not found');
    p.status = 'active'; p.approvedBy = approvedBy; p.approvedAt = new Date().toISOString(); p.updatedAt = p.approvedAt;
    return { ...p };
  }
  async softDelete(id: string): Promise<boolean> {
    const p = this.data.get(id); if (!p) return false;
    p.isDeleted = true; p.deletedAt = new Date().toISOString();
    return true;
  }
  async existsByKey(key: string): Promise<boolean> {
    return Array.from(this.data.values()).some(p => p.key === key && !p.isDeleted);
  }
}

export class InMemoryPromptVersionRepository implements PromptVersionRepository {
  private data: Map<string, PromptVersion[]> = new Map();
  async getByPromptId(promptId: string): Promise<PromptVersion[]> { return this.data.get(promptId) || []; }
  async getByVersion(promptId: string, version: number): Promise<PromptVersion | null> {
    return (this.data.get(promptId) || []).find(v => v.version === version) ?? null;
  }
  async create(version: PromptVersion): Promise<PromptVersion> {
    const versions = this.data.get(version.promptId) || [];
    versions.push(version);
    this.data.set(version.promptId, versions);
    return version;
  }
  async deleteByPromptId(promptId: string): Promise<number> {
    const len = (this.data.get(promptId) || []).length;
    this.data.delete(promptId);
    return len;
  }
}

// ============================================================================
// In-Memory Agent Repository
// ============================================================================

export class InMemoryAgentRepository implements AgentRepository {
  private data: Map<string, Agent> = new Map();
  async getById(id: string): Promise<Agent | null> { return this.data.get(id) ?? null; }
  async getByName(name: string): Promise<Agent | null> {
    return Array.from(this.data.values()).find(a => a.name === name) ?? null;
  }
  async getAll(): Promise<Agent[]> { return Array.from(this.data.values()); }
  async getActive(): Promise<Agent[]> { return Array.from(this.data.values()).filter(a => a.status === 'active'); }
  async getPaginated(params: {
    page?: number; limit?: number; status?: string; search?: string;
  }): Promise<PaginatedAgents> {
    let filtered = Array.from(this.data.values());
    if (params.status) filtered = filtered.filter(a => a.status === params.status);
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(a => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
    }
    const page = params.page || 1; const limit = params.limit || 20; const total = filtered.length;
    return { data: filtered.slice((page - 1) * limit, page * limit), total, page, limit, totalPages: Math.ceil(total / limit) };
  }
  async create(agent: Agent): Promise<Agent> { this.data.set(agent.id, agent); return { ...agent }; }
  async update(id: string, updates: Partial<Agent>): Promise<Agent> {
    const a = this.data.get(id); if (!a) throw new Error('Agent not found');
    Object.assign(a, updates, { updatedAt: new Date().toISOString() });
    return { ...a };
  }
  async delete(id: string): Promise<boolean> { return this.data.delete(id); }
  async setStatus(id: string, status: string): Promise<Agent> {
    return this.update(id, { status: status as Agent['status'] });
  }
  async existsByName(name: string): Promise<boolean> {
    return Array.from(this.data.values()).some(a => a.name === name);
  }
}

export class InMemoryAgentExecutionRepository implements AgentExecutionRepository {
  private data: Map<string, AgentExecution> = new Map();
  async getById(id: string): Promise<AgentExecution | null> { return this.data.get(id) ?? null; }
  async getByAgent(agentId: string): Promise<AgentExecution[]> {
    return Array.from(this.data.values()).filter(e => e.agentId === agentId);
  }
  async getByUser(userId: string): Promise<AgentExecution[]> {
    return Array.from(this.data.values()).filter(e => e.userId === userId);
  }
  async create(execution: AgentExecution): Promise<AgentExecution> {
    this.data.set(execution.id, execution); return { ...execution };
  }
  async update(id: string, updates: Partial<AgentExecution>): Promise<AgentExecution> {
    const e = this.data.get(id); if (!e) throw new Error('Execution not found');
    Object.assign(e, updates); return { ...e };
  }
  async complete(id: string, output: string, usage: AgentExecution['usage'], latency: number): Promise<AgentExecution> {
    const e = this.data.get(id); if (!e) throw new Error('Execution not found');
    e.output = output; e.usage = usage; e.latency = latency; e.status = 'completed'; e.completedAt = new Date().toISOString();
    return { ...e };
  }
  async fail(id: string, error: string): Promise<AgentExecution> {
    const e = this.data.get(id); if (!e) throw new Error('Execution not found');
    e.error = error; e.status = 'failed'; e.completedAt = new Date().toISOString();
    return { ...e };
  }
}

// ============================================================================
// In-Memory Knowledge Repository
// ============================================================================

export class InMemoryKnowledgeRepository implements KnowledgeRepository {
  private data: Map<string, KnowledgeDocument> = new Map();
  async getById(id: string): Promise<KnowledgeDocument | null> { return this.data.get(id) ?? null; }
  async getByOrganization(organizationId: string): Promise<KnowledgeDocument[]> {
    return Array.from(this.data.values()).filter(d => d.organizationId === organizationId && !d.isDeleted)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
  async getPaginated(params: {
    organizationId: string; page?: number; limit?: number; status?: string; source?: string; search?: string;
  }): Promise<PaginatedKnowledge> {
    let filtered = Array.from(this.data.values()).filter(d => d.organizationId === params.organizationId && !d.isDeleted);
    if (params.status) filtered = filtered.filter(d => d.status === params.status);
    if (params.source) filtered = filtered.filter(d => d.source === params.source);
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(d => d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q) || d.tags.some(t => t.toLowerCase().includes(q)));
    }
    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const page = params.page || 1; const limit = params.limit || 20; const total = filtered.length;
    return { data: filtered.slice((page - 1) * limit, page * limit), total, page, limit, totalPages: Math.ceil(total / limit) };
  }
  async create(doc: KnowledgeDocument): Promise<KnowledgeDocument> { this.data.set(doc.id, doc); return { ...doc }; }
  async update(id: string, updates: Partial<KnowledgeDocument>): Promise<KnowledgeDocument> {
    const d = this.data.get(id); if (!d) throw new Error('Document not found');
    Object.assign(d, updates, { updatedAt: new Date().toISOString() });
    return { ...d };
  }
  async softDelete(id: string): Promise<boolean> {
    const d = this.data.get(id); if (!d) return false;
    d.isDeleted = true; d.deletedAt = new Date().toISOString();
    return true;
  }
  async hardDelete(id: string): Promise<boolean> { return this.data.delete(id); }
  async countByOrganization(organizationId: string): Promise<number> {
    return Array.from(this.data.values()).filter(d => d.organizationId === organizationId && !d.isDeleted).length;
  }
}

export class InMemoryKnowledgeChunkRepository implements KnowledgeChunkRepository {
  private data: Map<string, KnowledgeChunk[]> = new Map();
  async getByDocument(documentId: string): Promise<KnowledgeChunk[]> { return this.data.get(documentId) || []; }
  async createMany(chunks: KnowledgeChunk[]): Promise<number> {
    if (chunks.length === 0) return 0;
    const docId = chunks[0].documentId;
    const existing = this.data.get(docId) || [];
    this.data.set(docId, [...existing, ...chunks]);
    return chunks.length;
  }
  async deleteByDocument(documentId: string): Promise<number> {
    const len = (this.data.get(documentId) || []).length;
    this.data.delete(documentId);
    return len;
  }
  async searchByContent(query: string, limit: number = 10): Promise<KnowledgeChunk[]> {
    const q = query.toLowerCase();
    const results: KnowledgeChunk[] = [];
    for (const chunks of this.data.values()) {
      for (const c of chunks) {
        if (c.content.toLowerCase().includes(q)) results.push(c);
        if (results.length >= limit) return results;
      }
    }
    return results;
  }
}

// ============================================================================
// In-Memory Memory Repository
// ============================================================================

export class InMemoryMemoryRepository implements MemoryRepository {
  private data: Map<string, MemoryEntry> = new Map();
  async getById(id: string): Promise<MemoryEntry | null> { return this.data.get(id) ?? null; }
  async getByScope(scope: string, scopeId: string): Promise<MemoryEntry[]> {
    return Array.from(this.data.values()).filter(e => e.scope === scope && e.scopeId === scopeId && !this.isExpired(e))
      .sort((a, b) => b.importance - a.importance);
  }
  async getByScopeAndKey(scope: string, scopeId: string, key: string): Promise<MemoryEntry | null> {
    return Array.from(this.data.values()).find(e => e.scope === scope && e.scopeId === scopeId && e.key === key && !this.isExpired(e)) ?? null;
  }
  async getPaginated(params: { scope?: string; scopeId?: string; page?: number; limit?: number }): Promise<PaginatedMemory> {
    let filtered = Array.from(this.data.values()).filter(e => !this.isExpired(e));
    if (params.scope) filtered = filtered.filter(e => e.scope === params.scope);
    if (params.scopeId) filtered = filtered.filter(e => e.scopeId === params.scopeId);
    filtered.sort((a, b) => b.importance - a.importance);
    const page = params.page || 1; const limit = params.limit || 20; const total = filtered.length;
    return { data: filtered.slice((page - 1) * limit, page * limit), total, page, limit, totalPages: Math.ceil(total / limit) };
  }
  async create(entry: MemoryEntry): Promise<MemoryEntry> { this.data.set(entry.id, entry); return { ...entry }; }
  async update(id: string, updates: Partial<MemoryEntry>): Promise<MemoryEntry> {
    const e = this.data.get(id); if (!e) throw new Error('Memory entry not found');
    Object.assign(e, updates, { updatedAt: new Date().toISOString() });
    return { ...e };
  }
  async delete(id: string): Promise<boolean> { return this.data.delete(id); }
  async deleteExpired(): Promise<number> {
    let count = 0;
    for (const [id, e] of this.data.entries()) { if (this.isExpired(e)) { this.data.delete(id); count++; } }
    return count;
  }
  async search(scope: string, scopeId: string, query: string): Promise<MemoryEntry[]> {
    const q = query.toLowerCase();
    return Array.from(this.data.values()).filter(e => e.scope === scope && e.scopeId === scopeId && !this.isExpired(e) &&
      (e.key.toLowerCase().includes(q) || e.value.toLowerCase().includes(q)))
      .sort((a, b) => b.importance - a.importance);
  }
  private isExpired(e: MemoryEntry): boolean {
    if (!e.expiresAt) return false;
    return new Date(e.expiresAt) < new Date();
  }
}

export class InMemoryConversationMemoryRepository implements ConversationMemoryRepository {
  private data: Map<string, ConversationMemory> = new Map();
  async getBySessionId(sessionId: string): Promise<ConversationMemory | null> { return this.data.get(sessionId) ?? null; }
  async getByUser(userId: string): Promise<ConversationMemory[]> {
    return Array.from(this.data.values()).filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
  async getByOrganization(organizationId: string): Promise<ConversationMemory[]> {
    return Array.from(this.data.values()).filter(c => c.organizationId === organizationId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
  async create(memory: ConversationMemory): Promise<ConversationMemory> { this.data.set(memory.sessionId, memory); return { ...memory }; }
  async update(sessionId: string, updates: Partial<ConversationMemory>): Promise<ConversationMemory> {
    const c = this.data.get(sessionId); if (!c) throw new Error('Conversation not found');
    Object.assign(c, updates, { updatedAt: new Date().toISOString() });
    return { ...c };
  }
  async delete(sessionId: string): Promise<boolean> { return this.data.delete(sessionId); }
  async deleteExpired(maxAgeMinutes: number): Promise<number> {
    const cutoff = new Date(Date.now() - maxAgeMinutes * 60000).toISOString();
    let count = 0;
    for (const [id, c] of this.data.entries()) { if (c.updatedAt < cutoff) { this.data.delete(id); count++; } }
    return count;
  }
}

// ============================================================================
// In-Memory Analytics Repository
// ============================================================================

export class InMemoryAIAnalyticsRepository implements AIAnalyticsRepository {
  private data: Map<string, AIAnalyticsRecord> = new Map();
  async getById(id: string): Promise<AIAnalyticsRecord | null> { return this.data.get(id) ?? null; }
  async getByOrganization(organizationId: string): Promise<AIAnalyticsRecord[]> {
    return Array.from(this.data.values()).filter(r => r.organizationId === organizationId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  async getByUser(userId: string): Promise<AIAnalyticsRecord[]> {
    return Array.from(this.data.values()).filter(r => r.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  async getByModel(model: AIModel): Promise<AIAnalyticsRecord[]> {
    return Array.from(this.data.values()).filter(r => r.model === model)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  async getByDateRange(startDate: string, endDate: string): Promise<AIAnalyticsRecord[]> {
    return Array.from(this.data.values()).filter(r =>
      new Date(r.timestamp) >= new Date(startDate) && new Date(r.timestamp) <= new Date(endDate)
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  async getPaginated(params: {
    organizationId?: string; model?: AIModel; module?: string; page?: number; limit?: number;
  }): Promise<PaginatedAnalytics> {
    let filtered = Array.from(this.data.values());
    if (params.organizationId) filtered = filtered.filter(r => r.organizationId === params.organizationId);
    if (params.model) filtered = filtered.filter(r => r.model === params.model);
    if (params.module) filtered = filtered.filter(r => r.module === params.module);
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const page = params.page || 1; const limit = params.limit || 20; const total = filtered.length;
    return { data: filtered.slice((page - 1) * limit, page * limit), total, page, limit, totalPages: Math.ceil(total / limit) };
  }
  async create(record: AIAnalyticsRecord): Promise<AIAnalyticsRecord> { this.data.set(record.id, record); return { ...record }; }
  async getSummary(params: {
    organizationId?: string; periodStart?: string; periodEnd?: string;
  }): Promise<AIAnalyticsSummary> {
    let filtered = Array.from(this.data.values());
    if (params.organizationId) filtered = filtered.filter(r => r.organizationId === params.organizationId);
    if (params.periodStart) filtered = filtered.filter(r => new Date(r.timestamp) >= new Date(params.periodStart!));
    if (params.periodEnd) filtered = filtered.filter(r => new Date(r.timestamp) <= new Date(params.periodEnd!));
    const total = filtered.length;
    if (total === 0) return { totalTokens: 0, totalCost: 0, totalRequests: 0, successRate: 0, averageLatency: 0, topModels: [], topModules: [], errorsByType: {}, periodStart: params.periodStart || '', periodEnd: params.periodEnd || '' };
    const totalTokens = filtered.reduce((s, r) => s + r.totalTokens, 0);
    const totalCost = filtered.reduce((s, r) => s + r.cost, 0);
    const successCount = filtered.filter(r => r.success).length;
    const totalLatency = filtered.reduce((s, r) => s + r.latency, 0);
    // Top models
    const mc: Record<string, { count: number; cost: number }> = {};
    for (const r of filtered) { if (!mc[r.model]) mc[r.model] = { count: 0, cost: 0 }; mc[r.model].count++; mc[r.model].cost += r.cost; }
    const topModels = Object.entries(mc).sort(([, a], [, b]) => b.count - a.count).slice(0, 5).map(([model, data]) => ({ model: model as AIModel, count: data.count, cost: data.cost }));
    // Top modules
    const modc: Record<string, { count: number; tokens: number }> = {};
    for (const r of filtered) { const mod = r.module || 'unknown'; if (!modc[mod]) modc[mod] = { count: 0, tokens: 0 }; modc[mod].count++; modc[mod].tokens += r.totalTokens; }
    const topModules = Object.entries(modc).sort(([, a], [, b]) => b.count - a.count).slice(0, 5).map(([module, data]) => ({ module, count: data.count, tokens: data.tokens }));
    // Errors
    const errByType: Record<string, number> = {};
    for (const r of filtered) { if (!r.success && r.error) { errByType[r.error] = (errByType[r.error] || 0) + 1; } }
    return { totalTokens, totalCost, totalRequests: total, successRate: (successCount / total) * 100, averageLatency: totalLatency / total, topModels, topModules, errorsByType: errByType, periodStart: params.periodStart || new Date(Math.min(...filtered.map(r => new Date(r.timestamp).getTime()))).toISOString(), periodEnd: params.periodEnd || new Date(Math.max(...filtered.map(r => new Date(r.timestamp).getTime()))).toISOString() };
  }
  async deleteOlderThan(date: string): Promise<number> {
    const cutoff = new Date(date);
    let count = 0;
    for (const [id, r] of this.data.entries()) { if (new Date(r.timestamp) < cutoff) { this.data.delete(id); count++; } }
    return count;
  }
}