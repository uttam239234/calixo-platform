/**
 * Calixo Platform - Canonical Workspace Platform Types
 *
 * Supersedes the orphaned `src/workspaces/` prototype. Every Workspace
 * belongs to exactly one Organization (`organizationId`) — the isolation
 * boundary `WorkspaceEngine.assertBelongsToOrganization()` enforces.
 */

export type WorkspaceType = "team" | "client" | "project" | "personal";

export interface WorkspaceBranding {
  logo?: string;
  icon?: string;
  theme: { primary: string; secondary: string; accent: string };
}

export interface WorkspaceSettings {
  timezone: string;
  language: string;
  defaultView: string;
  itemsPerPage: number;
}

export type WorkspaceMemberRole = "admin" | "editor" | "viewer" | "guest";

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceMemberRole;
  joinedAt: string;
  isActive: boolean;
}

/** A workspace-level permission override layered on top of a member's organization role (e.g. a workspace guest promoted to editor for this workspace only). */
export interface WorkspacePermissionOverride {
  workspaceId: string;
  userId: string;
  permission: string;
  granted: boolean;
}

export interface WorkspaceAuditEntry {
  id: string;
  workspaceId: string;
  actorId: string;
  action: string;
  target?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Workspace {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  type: WorkspaceType;
  isDefault: boolean;
  isArchived: boolean;
  settings: WorkspaceSettings;
  branding: WorkspaceBranding;
  featureFlagOverrides: Record<string, boolean>;
  metadata: Record<string, unknown>;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface CreateWorkspaceInput {
  organizationId: string;
  name: string;
  slug?: string;
  type?: WorkspaceType;
  isDefault?: boolean;
  settings?: Partial<WorkspaceSettings>;
}

export interface UpdateWorkspaceInput {
  name?: string;
  settings?: Partial<WorkspaceSettings>;
  branding?: Partial<WorkspaceBranding>;
}
