/**
 * Calixo Platform - Copilot Conversation Types
 */

export type MessageRole = "user" | "assistant" | "system" | "tool";

export interface ConversationMessage {
  id: string;
  role: MessageRole;
  content: string;
  toolCallId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ConversationMetadata {
  title: string;
  tags: string[];
  module?: string;
}

export interface Conversation {
  id: string;
  sessionId?: string;
  workspaceId: string;
  userId: string;
  metadata: ConversationMetadata;
  messages: ConversationMessage[];
  archived: boolean;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}
