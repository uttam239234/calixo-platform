/**
 * Calixo Platform - Presence Engine
 *
 * Tracks live presence state per user: status (online/offline/away/busy/
 * do-not-disturb), last-active timestamp, and concurrent session count.
 * Architecture only — no websocket/real-time transport lives here.
 */

import { generateId } from "@/shared/utils/string";
import type { PresenceRecord, PresenceSession, PresenceStatus } from "../types/index";

export class PresenceEngine {
  private records: Map<string, PresenceRecord> = new Map();

  private ensure(userId: string): PresenceRecord {
    let record = this.records.get(userId);
    if (!record) {
      record = { userId, status: "offline", lastActiveAt: new Date().toISOString(), sessions: [] };
      this.records.set(userId, record);
    }
    return record;
  }

  setStatus(userId: string, status: PresenceStatus): PresenceRecord {
    const record = this.ensure(userId);
    record.status = status;
    record.lastActiveAt = new Date().toISOString();
    return record;
  }

  getStatus(userId: string): PresenceStatus {
    return this.records.get(userId)?.status ?? "offline";
  }

  touch(userId: string): void {
    this.ensure(userId).lastActiveAt = new Date().toISOString();
  }

  startSession(userId: string, device?: string): PresenceSession {
    const record = this.ensure(userId);
    const session: PresenceSession = { sessionId: generateId(12), device, startedAt: new Date().toISOString(), lastActiveAt: new Date().toISOString() };
    record.sessions.push(session);
    if (record.status === "offline") record.status = "online";
    return session;
  }

  endSession(userId: string, sessionId: string): void {
    const record = this.records.get(userId);
    if (!record) return;
    record.sessions = record.sessions.filter(s => s.sessionId !== sessionId);
    if (record.sessions.length === 0) record.status = "offline";
  }

  sessionCount(userId: string): number {
    return this.records.get(userId)?.sessions.length ?? 0;
  }

  getRecord(userId: string): PresenceRecord | undefined {
    return this.records.get(userId);
  }

  list(params: { status?: PresenceStatus } = {}): PresenceRecord[] {
    return Array.from(this.records.values()).filter(r => !params.status || r.status === params.status);
  }
}

export const presenceEngine = new PresenceEngine();
