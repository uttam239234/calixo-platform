/**
 * Calixo Platform - Dashboard Activity Log
 *
 * Records real, in-session events for actions that happen entirely within
 * the Dashboard module (layout created/switched, widget pinned, goal
 * updated) and have no other engine of record. Merged with WorkflowEngine
 * activity and AssetEngine history in `DashboardEngine.getActivityFeed()`
 * — this log only owns Dashboard-native events, never approval or asset
 * activity that already has a real source of truth elsewhere.
 */

import { generateId } from "@/shared/utils/string";
import type { DashboardActivityEntry } from "../types";

class DashboardActivityLog {
  private entries: DashboardActivityEntry[] = [];

  record(actor: string, action: string, target: string): DashboardActivityEntry {
    const entry: DashboardActivityEntry = { id: generateId(12), actor, action, target, timestamp: new Date().toISOString() };
    this.entries.unshift(entry);
    this.entries = this.entries.slice(0, 50);
    return entry;
  }

  list(limit = 20): DashboardActivityEntry[] {
    return this.entries.slice(0, limit);
  }
}

export const dashboardActivityLog = new DashboardActivityLog();
