/**
 * Calixo Settings Center - UI-only view types.
 *
 * These describe presentation state the platform foundation has no
 * opinion on (which right-panel tab is active, a mock history user).
 * Nothing here duplicates a platform type.
 */

import type { SettingsChangeRecord } from "@/core/settings";

export type SettingsRightPanelTab = "properties" | "validation" | "history" | "dependencies" | "restart" | "flags" | "metadata";

/** A change record enriched with a (client-side only) mock user — the platform's SettingsChangeRecord has no user field. */
export interface SettingsHistoryRecordView extends SettingsChangeRecord {
  user: string;
}
