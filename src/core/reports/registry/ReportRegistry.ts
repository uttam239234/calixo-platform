/**
 * Calixo Platform - Report Registry
 *
 * The central registry for every report in the enterprise platform.
 * Reports are contributed by modules (present or future) — nothing here
 * is hardcoded to a specific module.
 */

import { appLogger } from "@/logging";
import type { ModuleCategory } from "@/core/modules/ModuleTypes";
import type { ReportCategory, ReportDefinition } from "../types";

export class ReportRegistry {
  private reports: Map<string, ReportDefinition> = new Map();

  register(report: ReportDefinition): void {
    if (this.reports.has(report.id)) {
      appLogger.warn("Reports.ReportRegistry", `Report ${report.id} already registered`);
      return;
    }
    this.reports.set(report.id, report);
    appLogger.info("Reports.ReportRegistry", `Report registered: ${report.id} (${report.module}/${report.category})`);
  }

  registerMany(reports: ReportDefinition[]): void {
    for (const report of reports) this.register(report);
  }

  unregister(id: string): void {
    this.reports.delete(id);
  }

  lookup(id: string): ReportDefinition | undefined {
    return this.reports.get(id);
  }

  list(params: { module?: ModuleCategory; category?: ReportCategory; owner?: string; favorite?: boolean } = {}): ReportDefinition[] {
    return Array.from(this.reports.values())
      .filter(r => !params.module || r.module === params.module)
      .filter(r => !params.category || r.category === params.category)
      .filter(r => !params.owner || r.owner === params.owner)
      .filter(r => params.favorite === undefined || r.favorite === params.favorite);
  }

  discover(query: string): ReportDefinition[] {
    const q = query.toLowerCase();
    return this.list().filter(
      r => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  groupByCategory(): Partial<Record<ReportCategory, ReportDefinition[]>> {
    const groups: Partial<Record<ReportCategory, ReportDefinition[]>> = {};
    for (const report of this.reports.values()) {
      (groups[report.category] ??= []).push(report);
    }
    return groups;
  }

  groupByModule(): Partial<Record<ModuleCategory, ReportDefinition[]>> {
    const groups: Partial<Record<ModuleCategory, ReportDefinition[]>> = {};
    for (const report of this.reports.values()) {
      (groups[report.module] ??= []).push(report);
    }
    return groups;
  }

  markFavorite(id: string, favorite = true): ReportDefinition | undefined {
    const report = this.reports.get(id);
    if (!report) return undefined;
    report.favorite = favorite;
    report.updatedAt = new Date().toISOString();
    return { ...report };
  }

  count(): number {
    return this.reports.size;
  }
}

export const reportRegistry = new ReportRegistry();

/**
 * The single integration point future modules use to contribute reports —
 * no Reports platform code needs to change when a new module calls this.
 */
export function registerReports(reports: ReportDefinition[], registry: ReportRegistry = reportRegistry): void {
  registry.registerMany(reports);
}
