/**
 * Calixo Platform - Memory Engine
 *
 * Supports conversation memory, workspace memory, organization memory,
 * user memory, AI output history, and generated asset history.
 */

import { appLogger } from '@/logging';
import { generateId } from '@/shared/utils/string';
import type { MemoryEntry, MemoryScope, ConversationMemory, AIMessage } from '@/aios/types';

export class MemoryEngine {
  private entries: Map<string, MemoryEntry> = new Map();
  private conversations: Map<string, ConversationMemory> = new Map();

  async store(params: {
    scope: MemoryScope;
    scopeId: string;
    key: string;
    value: string;
    type?: MemoryEntry['type'];
    importance?: number;
    expiresAt?: string;
  }): Promise<MemoryEntry> {
    const now = new Date().toISOString();
    const entry: MemoryEntry = {
      id: generateId(16),
      scope: params.scope,
      scopeId: params.scopeId,
      key: params.key,
      value: params.value,
      type: params.type || 'fact',
      importance: params.importance || 1,
      expiresAt: params.expiresAt,
      createdAt: now,
      updatedAt: now,
    };
    this.entries.set(entry.id, entry);
    return { ...entry };
  }

  async recall(scope: MemoryScope, scopeId: string, key: string): Promise<MemoryEntry | null> {
    return Array.from(this.entries.values())
      .find(e => e.scope === scope && e.scopeId === scopeId && e.key === key && !this.isExpired(e)) || null;
  }

  async search(scope: MemoryScope, scopeId: string, query: string): Promise<MemoryEntry[]> {
    const q = query.toLowerCase();
    return Array.from(this.entries.values())
      .filter(e => e.scope === scope && e.scopeId === scopeId && !this.isExpired(e) &&
        (e.key.toLowerCase().includes(q) || e.value.toLowerCase().includes(q)))
      .sort((a, b) => b.importance - a.importance);
  }

  async getByScope(scope: MemoryScope, scopeId: string): Promise<MemoryEntry[]> {
    return Array.from(this.entries.values())
      .filter(e => e.scope === scope && e.scopeId === scopeId && !this.isExpired(e))
      .sort((a, b) => b.importance - a.importance);
  }

  async delete(id: string): Promise<boolean> {
    return this.entries.delete(id);
  }

  async storeConversation(params: {
    sessionId: string;
    userId: string;
    organizationId?: string;
    workspaceId?: string;
    messages: AIMessage[];
  }): Promise<ConversationMemory> {
    const now = new Date().toISOString();
    const existing = this.conversations.get(params.sessionId);
    if (existing) {
      existing.messages = params.messages;
      existing.tokenCount = this.countTokens(params.messages);
      existing.updatedAt = now;
      return { ...existing };
    }
    const memory: ConversationMemory = {
      id: generateId(16),
      sessionId: params.sessionId,
      userId: params.userId,
      organizationId: params.organizationId,
      workspaceId: params.workspaceId,
      messages: params.messages,
      tokenCount: this.countTokens(params.messages),
      createdAt: now,
      updatedAt: now,
    };
    this.conversations.set(memory.sessionId, memory);
    return { ...memory };
  }

  async getConversation(sessionId: string): Promise<ConversationMemory | null> {
    return this.conversations.get(sessionId) || null;
  }

  async summarizeConversation(sessionId: string, summary: string): Promise<ConversationMemory> {
    const conv = this.conversations.get(sessionId);
    if (!conv) throw new Error('Conversation not found');
    conv.summary = summary;
    conv.updatedAt = new Date().toISOString();
    return { ...conv };
  }

  async deleteConversation(sessionId: string): Promise<boolean> {
    return this.conversations.delete(sessionId);
  }

  private isExpired(entry: MemoryEntry): boolean {
    if (!entry.expiresAt) return false;
    return new Date(entry.expiresAt) < new Date();
  }

  private countTokens(messages: AIMessage[]): number {
    return messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
  }
}

export const memoryEngine = new MemoryEngine();