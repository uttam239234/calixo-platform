/**
 * Calixo Platform - Copilot Knowledge Types
 *
 * Categorized knowledge storage — preparation for a future RAG pipeline.
 */

export type KnowledgeDomain = "marketing" | "platform" | "module" | "faq" | "custom";

export interface KnowledgeItem {
  id: string;
  domain: KnowledgeDomain;
  title: string;
  content: string;
  tags: string[];
  sourceModule?: string;
  createdAt: string;
  updatedAt: string;
}
