/**
 * Calixo Platform - Users Core Types
 */

export type UserStatus = "active" | "invited" | "suspended" | "disabled" | "archived" | "pending";

export const USER_STATUSES: UserStatus[] = ["active", "invited", "suspended", "disabled", "archived", "pending"];

export type PresenceStatus = "online" | "offline" | "away" | "busy" | "do-not-disturb";

export const PRESENCE_STATUSES: PresenceStatus[] = ["online", "offline", "away", "busy", "do-not-disturb"];

/**
 * The business-facing "who can access this" tier shown in People/Teams/Invitations.
 * Deliberately distinct from `OrganizationMemberRole` (owner/admin/member/guest —
 * an org-*switching* relationship, see `core/platform/organizations`) and from
 * `roleIds` below (the granular permission-catalog FK, reserved for a future
 * Roles & Permissions phase). Internal values stay lowercase; always display
 * via `ACCESS_LEVEL_LABELS`, never the raw value.
 */
export type PeopleAccessLevel = "owner" | "administrator" | "manager" | "member" | "viewer";

export const PEOPLE_ACCESS_LEVELS: PeopleAccessLevel[] = ["owner", "administrator", "manager", "member", "viewer"];

export const ACCESS_LEVEL_LABELS: Record<PeopleAccessLevel, string> = {
  owner: "Owner",
  administrator: "Administrator",
  manager: "Manager",
  member: "Member",
  viewer: "Viewer",
};

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
  organizationId: string;
  workspaceId: string;
  teamIds: string[];
  managerId?: string;
  accessLevel: PeopleAccessLevel;
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
