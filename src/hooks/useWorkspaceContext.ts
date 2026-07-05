"use client";

/**
 * Calixo AI Copilot Workspace - workspace context state.
 * Thin React binding over the platform's CopilotMemoryEngine.
 */

import { useCallback, useEffect, useState } from "react";
import { copilotMemoryEngine } from "@/core/copilot";
import type { WorkspaceContext } from "@/core/copilot";

const EMPTY_CONTEXT: WorkspaceContext = {
  recentAssets: [],
  recentReports: [],
  recentWorkflows: [],
  pinnedResources: [],
  recentChats: [],
};

export function useWorkspaceContext(sessionId: string | null) {
  const [context, setContext] = useState<WorkspaceContext>(EMPTY_CONTEXT);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    if (!sessionId) {
      setContext(EMPTY_CONTEXT);
      return;
    }
    setContext(await copilotMemoryEngine.getContext(sessionId));
  }, [sessionId]);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const save = useCallback(
    async (patch: Partial<WorkspaceContext>) => {
      if (!sessionId) return;
      setSaving(true);
      try {
        setContext(await copilotMemoryEngine.updateContext(sessionId, patch));
      } finally {
        setSaving(false);
      }
    },
    [sessionId]
  );

  const setCurrentModule = useCallback(
    async (moduleId: string) => {
      if (!sessionId) return;
      setContext(await copilotMemoryEngine.updateContext(sessionId, { currentModule: moduleId }));
    },
    [sessionId]
  );

  const pushRecentChat = useCallback(
    async (label: string) => {
      if (!sessionId) return;
      setContext(await copilotMemoryEngine.pushRecent(sessionId, "recentChats", label));
    },
    [sessionId]
  );

  return { context, saving, save, setCurrentModule, pushRecentChat, refresh };
}
