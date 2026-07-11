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

  record(userId: string, organizationId: string, type: ActivityType, description: string, metadata?: Record<string, unknown>, createdAt?: string): ActivityEvent {
    const event: ActivityEvent = { id: generateId(12), userId, organizationId, type, description, metadata, createdAt: createdAt ?? new Date().toISOString() };
    this.events.push(event);
    return event;
  }

  history(params: { userId?: string; organizationId?: string; limit?: number } = {}): ActivityEvent[] {
    const scoped = this.events
      .filter(e => !params.userId || e.userId === params.userId)
      .filter(e => !params.organizationId || e.organizationId === params.organizationId);
    const ordered = this.byRecency(scoped);
    return params.limit ? ordered.slice(0, params.limit) : ordered;
  }

  byType(organizationId: string, type: ActivityType, limit?: number): ActivityEvent[] {
    const ordered = this.byRecency(this.events.filter(e => e.organizationId === organizationId && e.type === type));
    return limit ? ordered.slice(0, limit) : ordered;
  }

  recent(organizationId: string, limit = 20): ActivityEvent[] {
    return this.byRecency(this.events.filter(e => e.organizationId === organizationId)).slice(0, limit);
  }

  private byRecency(events: ActivityEvent[]): ActivityEvent[] {
    return events.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  count(): number {
    return this.events.length;
  }
}

export const activityEngine = new ActivityEngine();
