/**
 * Calixo Platform - Copilot Conversation Engine
 *
 * Manages conversation lifecycle: creation, message history, metadata,
 * archiving, and pinning. Pure data layer — no AI calls, no UI.
 */

import { appLogger } from "@/logging";
import { generateId } from "@/shared/utils/string";
import type { Conversation, ConversationMessage, ConversationMetadata, MessageRole } from "../types/index";

export class ConversationEngine {
  private conversations: Map<string, Conversation> = new Map();

  create(params: { workspaceId: string; userId: string; sessionId?: string; title?: string }): Conversation {
    const now = new Date().toISOString();
    const conversation: Conversation = {
      id: generateId(16),
      sessionId: params.sessionId,
      workspaceId: params.workspaceId,
      userId: params.userId,
      metadata: { title: params.title || "New Conversation", tags: [] },
      messages: [],
      archived: false,
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };
    this.conversations.set(conversation.id, conversation);
    appLogger.info("ConversationEngine", `Conversation created: ${conversation.id}`);
    return this.clone(conversation);
  }

  get(id: string): Conversation | undefined {
    const conversation = this.conversations.get(id);
    return conversation ? this.clone(conversation) : undefined;
  }

  findBySession(sessionId: string): Conversation | undefined {
    const conversation = Array.from(this.conversations.values()).find(c => c.sessionId === sessionId);
    return conversation ? this.clone(conversation) : undefined;
  }

  list(params: { workspaceId?: string; userId?: string; includeArchived?: boolean } = {}): Conversation[] {
    return Array.from(this.conversations.values())
      .filter(c => !params.workspaceId || c.workspaceId === params.workspaceId)
      .filter(c => !params.userId || c.userId === params.userId)
      .filter(c => params.includeArchived || !c.archived)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .map(c => this.clone(c));
  }

  addMessage(
    conversationId: string,
    message: { role: MessageRole; content: string; toolCallId?: string; metadata?: Record<string, unknown> }
  ): ConversationMessage {
    const conversation = this.mustGet(conversationId);
    const entry: ConversationMessage = {
      id: generateId(16),
      role: message.role,
      content: message.content,
      toolCallId: message.toolCallId,
      metadata: message.metadata,
      createdAt: new Date().toISOString(),
    };
    conversation.messages.push(entry);
    conversation.updatedAt = entry.createdAt;
    return { ...entry };
  }

  removeMessage(conversationId: string, messageId: string): boolean {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return false;
    const before = conversation.messages.length;
    conversation.messages = conversation.messages.filter(m => m.id !== messageId);
    if (conversation.messages.length === before) return false;
    conversation.updatedAt = new Date().toISOString();
    return true;
  }

  getMessages(conversationId: string): ConversationMessage[] {
    return [...(this.conversations.get(conversationId)?.messages ?? [])];
  }

  updateMetadata(conversationId: string, updates: Partial<ConversationMetadata>): Conversation {
    const conversation = this.mustGet(conversationId);
    conversation.metadata = { ...conversation.metadata, ...updates };
    conversation.updatedAt = new Date().toISOString();
    return this.clone(conversation);
  }

  archive(conversationId: string): Conversation {
    return this.setFlag(conversationId, "archived", true);
  }

  unarchive(conversationId: string): Conversation {
    return this.setFlag(conversationId, "archived", false);
  }

  pin(conversationId: string): Conversation {
    return this.setFlag(conversationId, "pinned", true);
  }

  unpin(conversationId: string): Conversation {
    return this.setFlag(conversationId, "pinned", false);
  }

  delete(conversationId: string): boolean {
    return this.conversations.delete(conversationId);
  }

  private setFlag(conversationId: string, flag: "archived" | "pinned", value: boolean): Conversation {
    const conversation = this.mustGet(conversationId);
    conversation[flag] = value;
    conversation.updatedAt = new Date().toISOString();
    return this.clone(conversation);
  }

  private mustGet(conversationId: string): Conversation {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) throw new Error("Conversation not found");
    return conversation;
  }

  private clone(conversation: Conversation): Conversation {
    return { ...conversation, metadata: { ...conversation.metadata }, messages: [...conversation.messages] };
  }
}

export const conversationEngine = new ConversationEngine();
