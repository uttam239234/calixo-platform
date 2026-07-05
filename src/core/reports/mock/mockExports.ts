/**
 * Calixo Platform - Mock Exports Generator
 */

import { generateId } from "@/shared/utils/string";
import { EXPORT_FORMATS } from "../types";
import type { ExportRecord, ExportStatus } from "../types";
import { MOCK_OWNERS, daysAgoISO, pick, pseudoRandomInt } from "./data";

const STATUSES: ExportStatus[] = ["completed", "completed", "completed", "processing", "failed"];

export function generateMockExports(reportIds: string[], count = 100): ExportRecord[] {
  if (reportIds.length === 0) return [];
  const exports: ExportRecord[] = [];

  for (let i = 0; i < count; i++) {
    const format = EXPORT_FORMATS[i % EXPORT_FORMATS.length];
    const status = pick(STATUSES, i);
    const requestedAt = daysAgoISO(90 - (i % 90));
    const completed = status === "completed";

    exports.push({
      id: generateId(14),
      reportId: pick(reportIds, i),
      format: format.id,
      status,
      requestedBy: pick(MOCK_OWNERS, i),
      requestedAt,
      completedAt: completed ? requestedAt : undefined,
      fileSizeBytes: completed ? pseudoRandomInt(20_000, 4_500_000, i) : undefined,
      downloadUrl: completed ? `mock://exports/${pick(reportIds, i)}/${generateId(8)}.${format.extension}` : undefined,
      error: status === "failed" ? "Mock export failure for demo data" : undefined,
    });
  }

  return exports;
}
