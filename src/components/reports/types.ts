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

export interface KpiCardView {
  metricId: string;
  label: string;
  formattedValue: string;
  /** Only present when a real facade supplied a genuine prior-period comparison (`ReportDataset.summary`) — never fabricated for a formula-generated fallback dataset. */
  change?: string;
  tone?: "positive" | "negative" | "neutral";
}

/** An execution record enriched with the (client-side only) user who triggered it — the platform's ReportExecutionRecord has no user field. */
export interface HistoryRecordView extends ReportExecutionRecord {
  user?: string;
}
