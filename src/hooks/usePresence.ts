"use client";

/**
 * Calixo Users & Teams Center - presence read state.
 * The only place allowed to call PresenceEngine — components never
 * import it directly.
 */

import { useCallback, useEffect, useState } from "react";
import { presenceEngine } from "@/core/users";
import type { PresenceRecord, PresenceStatus } from "@/core/users";

export function usePresence() {
  const [records, setRecords] = useState<PresenceRecord[]>([]);

  const refresh = useCallback(() => {
    setRecords(presenceEngine.list());
  }, []);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const statusFor = useCallback((userId: string): PresenceStatus => presenceEngine.getStatus(userId), []);
  const recordFor = useCallback((userId: string) => presenceEngine.getRecord(userId), []);
  const sessionCountFor = useCallback((userId: string) => presenceEngine.sessionCount(userId), []);

  const onlineUserIds = useCallback(() => presenceEngine.list({ status: "online" }).map(r => r.userId), []);

  return {
    records,
    statusFor,
    recordFor,
    sessionCountFor,
    onlineUserIds,
    refresh,
  };
}

export type UsePresenceResult = ReturnType<typeof usePresence>;
