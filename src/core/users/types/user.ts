/**
 * Calixo Platform - Users Core Types
 */

export type UserStatus = "active" | "invited" | "suspended" | "disabled" | "archived" | "pending";

export const USER_STATUSES: UserStatus[] = ["active", "invited", "suspended", "disabled", "archived", "pending"];

export type PresenceStatus = "online" | "offline" | "away" | "busy" | "do-not-disturb";

export const PRESENCE_STATUSES: PresenceStatus[] = ["online", "offline", "away", "busy", "do-not-disturb"];

export interface UserPreferences {
  theme?: "light" | "dark" | "system";
  notifications?: Record<string, boolean>;
  [key: string]: unknown;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  phone?: string;
  avatar?: string;
  title: string;
  department: string;
  status: UserStatus;
  presence: PresenceStatus;
  timezone: string;
  locale: string;
  language: string;
  workspaceId: string;
  teamIds: string[];
  managerId?: string;
  roleIds: string[];
  permissions: string[];
  featureFlags: string[];
  tags: string[];
  preferences: UserPreferences;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface UserSaveResult {
  success: boolean;
  errors: string[];
  user?: User;
}

export type UserChangeAction = "create" | "update" | "status-change" | "reset";

export interface UserChangeRecord {
  id: string;
  userId: string;
  action: UserChangeAction;
  previousValue: Partial<User> | null;
  newValue: Partial<User>;
  timestamp: string;
}
