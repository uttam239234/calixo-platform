"use client";

/**
 * Calixo Users & Teams Center - activity feed/history state.
 * The only place allowed to call ActivityEngine — components never
 * import it directly.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { activityEngine } from "@/core/users";
import type { ActivityEvent, ActivityType } from "@/core/users";

export function useActivity() {
  const [recentEvents, setRecentEvents] = useState<ActivityEvent[]>([]);

  const refresh = useCallback((limit = 50) => {
    setRecentEvents(activityEngine.recent(limit));
  }, []);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const historyFor = useCallback((userId: string, limit?: number) => activityEngine.history(userId, limit), []);
  const byType = useCallback((type: ActivityType, limit?: number) => activityEngine.byType(type, limit), []);

  const recentlyActiveUserIds = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const event of recentEvents) {
      if (seen.has(event.userId)) continue;
      seen.add(event.userId);
      ordered.push(event.userId);
      if (ordered.length >= 10) break;
    }
    return ordered;
  }, [recentEvents]);

  return {
    recentEvents,
    historyFor,
    byType,
    recentlyActiveUserIds,
    refresh,
  };
}

export type UseActivityResult = ReturnType<typeof useActivity>;
