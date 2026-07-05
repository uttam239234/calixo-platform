/**
 * Calixo Platform - Reports Scheduler Types
 *
 * Architecture only — schedules are stored, never executed here.
 */

import type { ExportFormat } from "./export";

export type ScheduleFrequency = "manual" | "daily" | "weekly" | "monthly" | "quarterly";

export const SCHEDULE_FREQUENCIES: { id: ScheduleFrequency; label: string }[] = [
  { id: "manual", label: "Manual" },
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
];

export interface ReportSchedule {
  id: string;
  reportId: string;
  frequency: ScheduleFrequency;
  active: boolean;
  recipients: string[];
  exportFormat: ExportFormat;
  timezone: string;
  nextRunAt?: string;
  lastRunAt?: string;
  createdAt: string;
  updatedAt: string;
}
