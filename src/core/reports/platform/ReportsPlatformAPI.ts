/** Calixo Platform - Reports Platform API. The sanctioned way another module reads report metadata — wraps `ReportRegistry` instead of exposing it for direct cross-module reads. */
import { reportRegistry } from "../registry/ReportRegistry";
import type { ModuleCategory } from "@/core/modules/ModuleTypes";
import type { ReportCategory } from "../types";
import type { ReportSummary } from "@/core/platform/contracts";

export class ReportsPlatformAPI {
  listReportSummaries(params: { module?: ModuleCategory; category?: ReportCategory } = {}): ReportSummary[] {
    return reportRegistry.list(params).map(r => ({ id: r.id, name: r.name, category: r.category, lastRunAt: undefined }));
  }
}

export const reportsPlatformAPI = new ReportsPlatformAPI();
