/**
 * Calixo Users & Teams Center - UI constants.
 */

import type { PresenceStatus, UserStatus } from "@/core/users";

export const CURRENT_ACTOR = "Uttam";

export const STATUS_BADGE_TONE: Record<UserStatus, "success" | "info" | "warning" | "destructive" | "outline" | "secondary"> = {
  active: "success",
  invited: "info",
  suspended: "warning",
  disabled: "destructive",
  archived: "outline",
  pending: "secondary",
};

export const PRESENCE_DOT_CLASS: Record<PresenceStatus, string> = {
  online: "bg-success",
  away: "bg-warning",
  busy: "bg-destructive",
  "do-not-disturb": "bg-destructive",
  offline: "bg-muted-foreground/40",
};

export const PRESENCE_LABEL: Record<PresenceStatus, string> = {
  online: "Online",
  away: "Away",
  busy: "Busy",
  "do-not-disturb": "Do Not Disturb",
  offline: "Offline",
};

export const TEAM_COLOR_FALLBACK = "#4F46E5";
