/**
 * Calixo Platform - Report Scheduler
 *
 * Architecture only. Stores schedules and computes their next run time —
 * it never actually triggers a report run or delivery.
 */

import { generateId } from "@/shared/utils/string";
import type { ExportFormat, ReportSchedule, ScheduleFrequency } from "../types";

const DAY_MS = 24 * 60 * 60 * 1000;

export class ReportScheduler {
  private schedules: Map<string, ReportSchedule> = new Map();

  create(params: {
    reportId: string;
    frequency: ScheduleFrequency;
    recipients: string[];
    exportFormat?: ExportFormat;
    timezone?: string;
  }): ReportSchedule {
    const now = new Date().toISOString();
    const schedule: ReportSchedule = {
      id: generateId(14),
      reportId: params.reportId,
      frequency: params.frequency,
      active: true,
      recipients: params.recipients,
      exportFormat: params.exportFormat ?? "pdf",
      timezone: params.timezone ?? "UTC",
      nextRunAt: this.computeNextRunAt(params.frequency),
      createdAt: now,
      updatedAt: now,
    };
    this.schedules.set(schedule.id, schedule);
    return { ...schedule };
  }

  update(id: string, updates: Partial<Pick<ReportSchedule, "frequency" | "recipients" | "exportFormat" | "timezone" | "active">>): ReportSchedule {
    const schedule = this.mustGet(id);
    Object.assign(schedule, updates);
    if (updates.frequency) schedule.nextRunAt = this.computeNextRunAt(updates.frequency);
    schedule.updatedAt = new Date().toISOString();
    return { ...schedule };
  }

  pause(id: string): ReportSchedule {
    return this.update(id, { active: false });
  }

  resume(id: string): ReportSchedule {
    return this.update(id, { active: true });
  }

  delete(id: string): boolean {
    return this.schedules.delete(id);
  }

  lookup(id: string): ReportSchedule | undefined {
    const schedule = this.schedules.get(id);
    return schedule ? { ...schedule } : undefined;
  }

  list(params: { reportId?: string; active?: boolean; frequency?: ScheduleFrequency } = {}): ReportSchedule[] {
    return Array.from(this.schedules.values())
      .filter(s => !params.reportId || s.reportId === params.reportId)
      .filter(s => params.active === undefined || s.active === params.active)
      .filter(s => !params.frequency || s.frequency === params.frequency);
  }

  /** Pure date math — "manual" schedules never auto-advance. */
  computeNextRunAt(frequency: ScheduleFrequency, from: Date = new Date()): string | undefined {
    switch (frequency) {
      case "manual":
        return undefined;
      case "daily":
        return new Date(from.getTime() + DAY_MS).toISOString();
      case "weekly":
        return new Date(from.getTime() + 7 * DAY_MS).toISOString();
      case "monthly": {
        const next = new Date(from);
        next.setMonth(next.getMonth() + 1);
        return next.toISOString();
      }
      case "quarterly": {
        const next = new Date(from);
        next.setMonth(next.getMonth() + 3);
        return next.toISOString();
      }
      default:
        return undefined;
    }
  }

  seed(schedules: ReportSchedule[]): void {
    for (const schedule of schedules) this.schedules.set(schedule.id, schedule);
  }

  count(): number {
    return this.schedules.size;
  }

  private mustGet(id: string): ReportSchedule {
    const schedule = this.schedules.get(id);
    if (!schedule) throw new Error("Schedule not found");
    return schedule;
  }
}

export const reportScheduler = new ReportScheduler();
