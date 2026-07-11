/**
 * Calixo Platform - Mock Schedules Generator
 */

import { generateId } from "@/shared/utils/string";
import { SCHEDULE_FREQUENCIES, DELIVERY_METHODS } from "../types";
import type { ExportFormat, ReportRecipient, ReportSchedule } from "../types";
import { reportScheduler } from "../scheduler/ReportScheduler";
import { MOCK_OWNERS, daysAgoISO, pick } from "./data";

const FORMATS: ExportFormat[] = ["pdf", "excel", "csv"];

function mockRecipients(i: number): ReportRecipient[] {
  const owner = pick(MOCK_OWNERS, i);
  const email = `${owner.toLowerCase().replace(/\s+/g, ".")}@calixo.io`;
  return [{ type: "user", id: `user-${i % 40}`, label: owner }, { type: "email", id: email, label: email }];
}

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
      recipients: mockRecipients(i),
      deliveryMethod: pick(DELIVERY_METHODS, i).id,
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
