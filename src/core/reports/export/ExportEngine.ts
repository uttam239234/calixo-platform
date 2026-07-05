/**
 * Calixo Platform - Export Engine
 *
 * Architecture only. Produces export metadata records for PDF, Excel,
 * CSV, PowerPoint, and JSON — it never generates an actual file.
 */

import { generateId } from "@/shared/utils/string";
import { EXPORT_FORMATS } from "../types";
import type { ExportFormat, ExportRecord } from "../types";

export class ExportEngine {
  private records: Map<string, ExportRecord> = new Map();

  getSupportedFormats(): ExportFormat[] {
    return EXPORT_FORMATS.map(f => f.id);
  }

  /** Returns a completed export's metadata immediately — no file is ever produced. */
  requestExport(params: { reportId: string; format: ExportFormat; requestedBy: string }): ExportRecord {
    const formatMeta = EXPORT_FORMATS.find(f => f.id === params.format);
    const now = new Date().toISOString();
    const record: ExportRecord = {
      id: generateId(14),
      reportId: params.reportId,
      format: params.format,
      status: "completed",
      requestedBy: params.requestedBy,
      requestedAt: now,
      completedAt: now,
      fileSizeBytes: 1024 * (50 + Math.floor(Math.random() * 950)),
      downloadUrl: `mock://exports/${params.reportId}/${generateId(8)}.${formatMeta?.extension ?? "bin"}`,
    };
    this.records.set(record.id, record);
    return { ...record };
  }

  getExport(id: string): ExportRecord | undefined {
    const record = this.records.get(id);
    return record ? { ...record } : undefined;
  }

  getHistory(reportId?: string): ExportRecord[] {
    const all = Array.from(this.records.values());
    return (reportId ? all.filter(r => r.reportId === reportId) : all).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  }

  seed(records: ExportRecord[]): void {
    for (const record of records) this.records.set(record.id, record);
  }

  count(): number {
    return this.records.size;
  }
}

export const exportEngine = new ExportEngine();
