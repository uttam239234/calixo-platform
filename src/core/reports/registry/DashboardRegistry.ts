/**
 * Calixo Platform - Dashboard Registry
 *
 * Dashboards are named arrangements of existing reports. This registry
 * holds no dashboard rendering or layout logic — only bookkeeping.
 */

import { appLogger } from "@/logging";
import type { ModuleCategory } from "@/core/modules/ModuleTypes";
import type { ReportDashboard } from "../types";

export class DashboardRegistry {
  private dashboards: Map<string, ReportDashboard> = new Map();

  register(dashboard: ReportDashboard): void {
    if (this.dashboards.has(dashboard.id)) {
      appLogger.warn("Reports.DashboardRegistry", `Dashboard ${dashboard.id} already registered`);
      return;
    }
    this.dashboards.set(dashboard.id, dashboard);
    appLogger.info("Reports.DashboardRegistry", `Dashboard registered: ${dashboard.id}`);
  }

  registerMany(dashboards: ReportDashboard[]): void {
    for (const dashboard of dashboards) this.register(dashboard);
  }

  unregister(id: string): void {
    this.dashboards.delete(id);
  }

  lookup(id: string): ReportDashboard | undefined {
    return this.dashboards.get(id);
  }

  list(params: { module?: ModuleCategory; favorite?: boolean } = {}): ReportDashboard[] {
    return Array.from(this.dashboards.values())
      .filter(d => !params.module || d.module === params.module)
      .filter(d => params.favorite === undefined || d.favorite === params.favorite);
  }

  discover(query: string): ReportDashboard[] {
    const q = query.toLowerCase();
    return this.list().filter(d => d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));
  }

  count(): number {
    return this.dashboards.size;
  }
}

export const dashboardRegistry = new DashboardRegistry();
