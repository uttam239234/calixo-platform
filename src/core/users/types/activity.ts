/**
 * Calixo Platform - Activity Types
 *
 * Metadata only — an append-only event log, no analytics/audit engine here.
 */

export type ActivityType =
  | "login"
  | "logout"
  | "profile-update"
  | "team-join"
  | "team-leave"
  | "password-change"
  | "workspace-switch"
  | "organization-joined"
  | "invite-accepted"
  | "role-changed"
  | "suspended"
  | "reinstated";

export const ACTIVITY_TYPES: ActivityType[] = [
  "login",
  "logout",
  "profile-update",
  "team-join",
  "team-leave",
  "password-change",
  "workspace-switch",
  "organization-joined",
  "invite-accepted",
  "role-changed",
  "suspended",
  "reinstated",
];

export interface ActivityEvent {
  id: string;
  userId: string;
  organizationId: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  device?: string;
  createdAt: string;
}
