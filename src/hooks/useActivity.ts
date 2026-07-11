"use client";

/**
 * Calixo Users & Teams Center - activity feed/history state.
 * The only place allowed to call ActivityEngine — components never
 * import it directly. Scoped to a single organization.
 */

import { useCallback, useEffect, useState } from "react";
import { activityEngine } from "@/core/users";
import type { ActivityEvent, ActivityType } from "@/core/users";

export function useActivity(organizationId: string) {
  const [recentEvents, setRecentEvents] = useState<ActivityEvent[]>([]);

  const refresh = useCallback(
    (limit = 50) => {
      setRecentEvents(activityEngine.recent(organizationId, limit));
    },
    [organizationId]
  );

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const historyFor = useCallback((userId: string, limit?: number) => activityEngine.history({ userId, organizationId, limit }), [organizationId]);
  const byType = useCallback((type: ActivityType, limit?: number) => activityEngine.byType(organizationId, type, limit), [organizationId]);

  return {
    recentEvents,
    historyFor,
    byType,
    refresh,
  };
}

export type UseActivityResult = ReturnType<typeof useActivity>;
