/**
 * Calixo Platform - Reports Scheduler Types
 *
 * Architecture only — schedules are stored, never executed here.
 */

import type { ExportFormat } from "./export";

export type ScheduleFrequency = "manual" | "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export const SCHEDULE_FREQUENCIES: { id: ScheduleFrequency; label: string }[] = [
  { id: "manual", label: "Manual" },
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
  { id: "yearly", label: "Yearly" },
];

export type DeliveryMethod = "email" | "link" | "workspace";

export const DELIVERY_METHODS: { id: DeliveryMethod; label: string }[] = [
  { id: "email", label: "Email" },
  { id: "link", label: "Downloadable Link" },
  { id: "workspace", label: "Workspace Delivery" },
];

export type ReportRecipientType = "user" | "team" | "email";

export interface ReportRecipient {
  type: ReportRecipientType;
  id: string;
  label: string;
}

export interface ReportSchedule {
  id: string;
  reportId: string;
  frequency: ScheduleFrequency;
  active: boolean;
  recipients: ReportRecipient[];
  deliveryMethod: DeliveryMethod;
  exportFormat: ExportFormat;
  timezone: string;
  nextRunAt?: string;
  lastRunAt?: string;
  createdAt: string;
  updatedAt: string;
}
