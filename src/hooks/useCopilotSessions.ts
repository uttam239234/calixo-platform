"use client";

/**
 * Calixo AI Copilot Workspace - session list state.
 * Thin React binding over the platform's SessionManager — all lifecycle
 * logic (rename/pin/archive/delete/restore) lives there, not here.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { sessionManager } from "@/core/copilot";
import type { Session } from "@/core/copilot";

export function useCopilotSessions(workspaceId: string, userId: string) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [deletedSessions, setDeletedSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setSessions(sessionManager.list({ workspaceId, userId, includeArchived: true }));
    setDeletedSessions(sessionManager.list({ workspaceId, userId, includeArchived: true, includeDeleted: true }).filter(s => s.deleted));
  }, [workspaceId, userId]);

  useEffect(() => {
    (async () => {
      const existing = sessionManager.list({ workspaceId, userId });
      if (existing.length === 0) {
        const created = sessionManager.create({ workspaceId, userId, title: "New Conversation" });
        setCurrentSessionId(created.id);
      } else {
        setCurrentSessionId(existing[0].id);
      }
      refresh();
    })();
  }, [workspaceId, userId, refresh]);

  const createSession = useCallback(
    (title?: string) => {
      const created = sessionManager.create({ workspaceId, userId, title });
      refresh();
      setCurrentSessionId(created.id);
      return created;
    },
    [workspaceId, userId, refresh]
  );

  const selectSession = useCallback((id: string) => {
    sessionManager.touch(id);
    setCurrentSessionId(id);
  }, []);

  const renameSession = useCallback(
    (id: string, title: string) => {
      sessionManager.rename(id, title);
      refresh();
    },
    [refresh]
  );

  const pinSession = useCallback(
    (id: string) => {
      sessionManager.pin(id);
      refresh();
    },
    [refresh]
  );

  const unpinSession = useCallback(
    (id: string) => {
      sessionManager.unpin(id);
      refresh();
    },
    [refresh]
  );

  const archiveSession = useCallback(
    (id: string) => {
      sessionManager.archive(id);
      refresh();
    },
    [refresh]
  );

  const unarchiveSession = useCallback(
    (id: string) => {
      sessionManager.unarchive(id);
      refresh();
    },
    [refresh]
  );

  const restoreSession = useCallback(
    (id: string) => {
      sessionManager.restore(id);
      refresh();
    },
    [refresh]
  );

  const deleteSession = useCallback(
    (id: string) => {
      sessionManager.delete(id);
      const remaining = sessionManager.list({ workspaceId, userId });
      if (currentSessionId === id) {
        if (remaining.length > 0) {
          setCurrentSessionId(remaining[0].id);
        } else {
          const created = sessionManager.create({ workspaceId, userId, title: "New Conversation" });
          setCurrentSessionId(created.id);
        }
      }
      refresh();
    },
    [workspaceId, userId, currentSessionId, refresh]
  );

  const pinned = useMemo(() => sessions.filter(s => s.pinned && !s.archived), [sessions]);
  const active = useMemo(() => sessions.filter(s => !s.pinned && !s.archived), [sessions]);
  const archived = useMemo(() => sessions.filter(s => s.archived), [sessions]);

  const currentSession = useMemo(() => {
    if (!currentSessionId) return null;
    return sessions.find(s => s.id === currentSessionId) ?? sessionManager.get(currentSessionId) ?? null;
  }, [sessions, currentSessionId]);

  return {
    sessions,
    pinned,
    active,
    archived,
    deletedSessions,
    currentSessionId,
    currentSession,
    createSession,
    selectSession,
    renameSession,
    pinSession,
    unpinSession,
    archiveSession,
    unarchiveSession,
    deleteSession,
    restoreSession,
  };
}
