/**
 * Calixo Platform - Copilot Session Types
 *
 * A Session is the lifecycle wrapper (rename/archive/pin/delete/restore)
 * around exactly one Conversation.
 */

export interface Session {
  id: string;
  workspaceId: string;
  userId: string;
  conversationId: string;
  title: string;
  pinned: boolean;
  archived: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
}
