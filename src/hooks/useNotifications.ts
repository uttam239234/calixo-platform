"use client";

/**
 * Calixo Platform - global notification bell/panel state.
 * The only place allowed to call DashboardEngine's notification methods
 * (and, through it, the Communication Platform) — components never
 * import either directly. Used by the global Header as well as the
 * Dashboard landing page.
 */

import { useCallback, useEffect, useState } from "react";
import { dashboardEngine, DASHBOARD_CURRENT_USER_ID } from "@/core/dashboard";
import type { DashboardNotificationEntry } from "@/core/dashboard";

export function useNotifications(userId: string = DASHBOARD_CURRENT_USER_ID) {
  const [notifications, setNotifications] = useState<DashboardNotificationEntry[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [items, count] = await Promise.all([dashboardEngine.getNotifications(userId, 10), dashboardEngine.getUnreadNotificationCount(userId)]);
    setNotifications(items);
    setUnreadCount(count);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    (async () => {
      await refresh();
    })();
  }, [refresh]);

  const markRead = useCallback(
    async (id: string) => {
      await dashboardEngine.markNotificationRead(id);
      await refresh();
    },
    [refresh]
  );

  const markAllRead = useCallback(async () => {
    await dashboardEngine.markAllNotificationsRead(userId);
    await refresh();
  }, [userId, refresh]);

  return { notifications, unreadCount, loading, refresh, markRead, markAllRead };
}

export type UseNotificationsResult = ReturnType<typeof useNotifications>;
