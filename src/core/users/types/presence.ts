/**
 * Calixo Platform - Presence Types
 */

import type { PresenceStatus } from "./user";

export interface PresenceSession {
  sessionId: string;
  device?: string;
  startedAt: string;
  lastActiveAt: string;
}

export interface PresenceRecord {
  userId: string;
  status: PresenceStatus;
  lastActiveAt: string;
  sessions: PresenceSession[];
}
