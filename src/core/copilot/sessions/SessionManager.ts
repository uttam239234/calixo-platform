/**
 * Calixo Platform - Copilot Session Manager
 *
 * Manages the lifecycle of Copilot sessions (rename, archive, pin, delete,
 * restore) and links each session to its underlying Conversation. A
 * workspace can hold many sessions; each session wraps exactly one
 * conversation and delegates message/metadata storage to the
 * ConversationEngine rather than duplicating it.
 */

import { generateId } from "@/shared/utils/string";
import { conversationEngine, ConversationEngine } from "../conversation/ConversationEngine";
import type { Conversation, Session } from "../types/index";

export class SessionManager {
  constructor(private conversations: ConversationEngine = conversationEngine) {}

  private sessions: Map<string, Session> = new Map();

  create(params: { workspaceId: string; userId: string; title?: string }): Session {
    const now = new Date().toISOString();
    const title = params.title || "New Conversation";
    const conversation = this.conversations.create({ workspaceId: params.workspaceId, userId: params.userId, title });

    const session: Session = {
      id: generateId(16),
      workspaceId: params.workspaceId,
      userId: params.userId,
      conversationId: conversation.id,
      title,
      pinned: false,
      archived: false,
      deleted: false,
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
    };
    this.sessions.set(session.id, session);
    return { ...session };
  }

  get(id: string): Session | undefined {
    const session = this.sessions.get(id);
    return session ? { ...session } : undefined;
  }

  getConversation(id: string): Conversation | undefined {
    const session = this.sessions.get(id);
    return session ? this.conversations.get(session.conversationId) : undefined;
  }

  list(params: { workspaceId?: string; userId?: string; includeArchived?: boolean; includeDeleted?: boolean } = {}): Session[] {
    return Array.from(this.sessions.values())
      .filter(s => !params.workspaceId || s.workspaceId === params.workspaceId)
      .filter(s => !params.userId || s.userId === params.userId)
      .filter(s => params.includeArchived || !s.archived)
      .filter(s => params.includeDeleted || !s.deleted)
      .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
      .map(s => ({ ...s }));
  }

  rename(id: string, title: string): Session {
    const session = this.mustGet(id);
    session.title = title;
    this.conversations.updateMetadata(session.conversationId, { title });
    return this.touch(id);
  }

  archive(id: string): Session {
    const session = this.mustGet(id);
    session.archived = true;
    this.conversations.archive(session.conversationId);
    return this.touch(id);
  }

  unarchive(id: string): Session {
    const session = this.mustGet(id);
    session.archived = false;
    this.conversations.unarchive(session.conversationId);
    return this.touch(id);
  }

  pin(id: string): Session {
    const session = this.mustGet(id);
    session.pinned = true;
    this.conversations.pin(session.conversationId);
    return this.touch(id);
  }

  unpin(id: string): Session {
    const session = this.mustGet(id);
    session.pinned = false;
    this.conversations.unpin(session.conversationId);
    return this.touch(id);
  }

  delete(id: string): Session {
    const session = this.mustGet(id);
    session.deleted = true;
    return this.touch(id);
  }

  restore(id: string): Session {
    const session = this.mustGet(id);
    session.deleted = false;
    return this.touch(id);
  }

  touch(id: string): Session {
    const session = this.mustGet(id);
    const now = new Date().toISOString();
    session.updatedAt = now;
    session.lastActivityAt = now;
    return { ...session };
  }

  private mustGet(id: string): Session {
    const session = this.sessions.get(id);
    if (!session) throw new Error("Session not found");
    return session;
  }
}

export const sessionManager = new SessionManager();
