/**
 * Calixo Platform - Reports Export Types
 *
 * Architecture only — export metadata, never file generation.
 */

export type ExportFormat = "pdf" | "excel" | "csv" | "powerpoint" | "json";

export const EXPORT_FORMATS: { id: ExportFormat; label: string; mimeType: string; extension: string }[] = [
  { id: "pdf", label: "PDF", mimeType: "application/pdf", extension: "pdf" },
  { id: "excel", label: "Excel", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", extension: "xlsx" },
  { id: "csv", label: "CSV", mimeType: "text/csv", extension: "csv" },
  { id: "powerpoint", label: "PowerPoint", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", extension: "pptx" },
  { id: "json", label: "JSON", mimeType: "application/json", extension: "json" },
];

export type ExportStatus = "queued" | "processing" | "completed" | "failed";

export interface ExportRecord {
  id: string;
  reportId: string;
  format: ExportFormat;
  status: ExportStatus;
  requestedBy: string;
  requestedAt: string;
  completedAt?: string;
  fileSizeBytes?: number;
  downloadUrl?: string;
  error?: string;
}
