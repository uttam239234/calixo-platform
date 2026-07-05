/**
 * Calixo Platform - Activity Engine
 *
 * An append-only event log for user lifecycle activity (login, logout,
 * profile updates, team join/leave, password change, workspace switch).
 * Metadata only — no analytics/audit engine lives here.
 */

import { generateId } from "@/shared/utils/string";
import type { ActivityEvent, ActivityType } from "../types/index";

export class ActivityEngine {
  private events: ActivityEvent[] = [];

  record(userId: string, type: ActivityType, description: string, metadata?: Record<string, unknown>, createdAt?: string): ActivityEvent {
    const event: ActivityEvent = { id: generateId(12), userId, type, description, metadata, createdAt: createdAt ?? new Date().toISOString() };
    this.events.push(event);
    return event;
  }

  history(userId?: string, limit?: number): ActivityEvent[] {
    const scoped = userId ? this.events.filter(e => e.userId === userId) : [...this.events];
    const ordered = this.byRecency(scoped);
    return limit ? ordered.slice(0, limit) : ordered;
  }

  byType(type: ActivityType, limit?: number): ActivityEvent[] {
    const ordered = this.byRecency(this.events.filter(e => e.type === type));
    return limit ? ordered.slice(0, limit) : ordered;
  }

  recent(limit = 20): ActivityEvent[] {
    return this.byRecency(this.events).slice(0, limit);
  }

  private byRecency(events: ActivityEvent[]): ActivityEvent[] {
    return events.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  count(): number {
    return this.events.length;
  }
}

export const activityEngine = new ActivityEngine();
