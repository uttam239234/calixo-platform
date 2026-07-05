/**
 * Calixo Reports Center - UI-only view types.
 *
 * These describe presentation state the platform foundation has no
 * opinion on (which right-panel tab is active, KPI trend direction for
 * display). Nothing here duplicates a platform type.
 */

import type { ReportExecutionRecord } from "@/core/reports";

export type ReportsCenterMode = "view" | "build";

export type RightPanelTab = "properties" | "filters" | "export" | "schedule" | "metadata";

export type KpiStatus = "good" | "warning" | "critical" | "neutral";

export interface KpiCardView {
  metricId: string;
  label: string;
  value: number;
  formattedValue: string;
  trend: number;
  status: KpiStatus;
  sparkline: number[];
}

/** An execution record enriched with the (client-side only) user who triggered it — the platform's ReportExecutionRecord has no user field. */
export interface HistoryRecordView extends ReportExecutionRecord {
  user?: string;
}
