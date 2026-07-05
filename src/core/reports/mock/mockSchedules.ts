/**
 * Calixo Platform - Mock Schedules Generator
 */

import { generateId } from "@/shared/utils/string";
import { SCHEDULE_FREQUENCIES } from "../types";
import type { ExportFormat, ReportSchedule } from "../types";
import { reportScheduler } from "../scheduler/ReportScheduler";
import { MOCK_OWNERS, daysAgoISO, pick } from "./data";

const FORMATS: ExportFormat[] = ["pdf", "excel", "csv"];

export function generateMockSchedules(reportIds: string[], count = 30): ReportSchedule[] {
  if (reportIds.length === 0) return [];
  const schedules: ReportSchedule[] = [];

  for (let i = 0; i < count; i++) {
    const frequency = SCHEDULE_FREQUENCIES[(i + 1) % SCHEDULE_FREQUENCIES.length].id; // skew away from "manual" at index 0
    schedules.push({
      id: generateId(14),
      reportId: pick(reportIds, i),
      frequency,
      active: i % 5 !== 0,
      recipients: [pick(MOCK_OWNERS, i), pick(MOCK_OWNERS, i + 3)].map(name => `${name.toLowerCase().replace(/\s+/g, ".")}@calixo.io`),
      exportFormat: pick(FORMATS, i),
      timezone: "UTC",
      nextRunAt: reportScheduler.computeNextRunAt(frequency, new Date()),
      lastRunAt: frequency === "manual" ? undefined : daysAgoISO(1 + (i % 14)),
      createdAt: daysAgoISO(30 - (i % 30)),
      updatedAt: daysAgoISO(i % 10),
    });
  }

  return schedules;
}
