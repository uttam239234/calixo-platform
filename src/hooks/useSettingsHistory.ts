"use client";

/**
 * Calixo Settings Center - change history state.
 * The only place allowed to call SettingsEngine for history.
 */

import { useCallback } from "react";
import { settingsEngine } from "@/core/settings";
import { DEMO_OWNER } from "@/components/settings/constants";
import type { SettingsHistoryRecordView } from "@/components/settings/types";

export function useSettingsHistory() {
  const getHistory = useCallback((key?: string): SettingsHistoryRecordView[] => {
    return settingsEngine.getHistory(key).map(record => ({ ...record, user: DEMO_OWNER }));
  }, []);

  return { getHistory };
}
