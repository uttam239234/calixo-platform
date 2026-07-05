/**
 * Calixo Platform - Copilot Knowledge Service
 *
 * Lightweight, categorized store for marketing domain knowledge, platform
 * documentation, module documentation, and FAQs. This is preparation for a
 * future RAG pipeline — it deliberately does not call any LLM or embedding
 * provider. When real semantic search is needed, a later phase can layer
 * that on top of (or delegate to) the enterprise AIOS Knowledge Engine
 * without changing this service's public API.
 */

import { generateId } from "@/shared/utils/string";
import type { KnowledgeDomain, KnowledgeItem } from "../types/index";

export class KnowledgeService {
  private items: Map<string, KnowledgeItem> = new Map();

  add(params: { domain: KnowledgeDomain; title: string; content: string; tags?: string[]; sourceModule?: string }): KnowledgeItem {
    const now = new Date().toISOString();
    const item: KnowledgeItem = {
      id: generateId(16),
      domain: params.domain,
      title: params.title,
      content: params.content,
      tags: params.tags ?? [],
      sourceModule: params.sourceModule,
      createdAt: now,
      updatedAt: now,
    };
    this.items.set(item.id, item);
    return { ...item };
  }

  update(id: string, updates: Partial<Pick<KnowledgeItem, "title" | "content" | "tags">>): KnowledgeItem {
    const item = this.items.get(id);
    if (!item) throw new Error("Knowledge item not found");
    Object.assign(item, updates, { updatedAt: new Date().toISOString() });
    return { ...item };
  }

  remove(id: string): boolean {
    return this.items.delete(id);
  }

  get(id: string): KnowledgeItem | undefined {
    const item = this.items.get(id);
    return item ? { ...item } : undefined;
  }

  list(filters: { domain?: KnowledgeDomain; sourceModule?: string; tag?: string } = {}): KnowledgeItem[] {
    return Array.from(this.items.values())
      .filter(i => !filters.domain || i.domain === filters.domain)
      .filter(i => !filters.sourceModule || i.sourceModule === filters.sourceModule)
      .filter(i => !filters.tag || i.tags.includes(filters.tag))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getByDomain(domain: KnowledgeDomain): KnowledgeItem[] {
    return this.list({ domain });
  }

  search(query: string): KnowledgeItem[] {
    const q = query.toLowerCase();
    return Array.from(this.items.values()).filter(
      i => i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q) || i.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  count(): number {
    return this.items.size;
  }
}

export const knowledgeService = new KnowledgeService();
