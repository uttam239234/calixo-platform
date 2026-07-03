/**
 * Calixo Platform - Workspace Types
 * 
 * Core types for workspace management within organizations.
 */

export interface WorkspaceProfile {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description?: string;
  type: WorkspaceType;
  isDefault: boolean;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  settings: WorkspaceSettings;
  branding: WorkspaceBranding;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export type WorkspaceType = 'team' | 'client' | 'project' | 'personal';

export interface WorkspaceSettings {
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  weekStartsOn: 'monday' | 'sunday';
  language: string;
  currency: string;
  preferences: {
    defaultView: string;
    itemsPerPage: number;
    enableNotifications: boolean;
    enableAutomation: boolean;
  };
}

export interface WorkspaceBranding {
  logo?: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  icon?: string;
  coverImage?: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  role: WorkspaceMemberRole;
  joinedAt: string;
  isActive: boolean;
}

export type WorkspaceMemberRole = 'admin' | 'editor' | 'viewer' | 'guest';

export interface CreateWorkspaceRequest {
  organizationId: string;
  name: string;
  slug?: string;
  description?: string;
  type?: WorkspaceType;
  settings?: Partial<WorkspaceSettings>;
}

export interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
  type?: WorkspaceType;
  settings?: Partial<WorkspaceSettings>;
  branding?: Partial<WorkspaceBranding>;
}

// ============================================================================
// Workspace Context
// ============================================================================

export interface WorkspaceContextValue {
  workspace: WorkspaceProfile | null;
  workspaces: WorkspaceProfile[];
  isLoading: boolean;
  isSwitching: boolean;
  error: string | null;
  switchWorkspace: (wsId: string) => Promise<void>;
  createWorkspace: (request: CreateWorkspaceRequest) => Promise<WorkspaceProfile>;
  updateWorkspace: (wsId: string, data: UpdateWorkspaceRequest) => Promise<WorkspaceProfile>;
  archiveWorkspace: (wsId: string) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
}

export interface WorkspaceSwitcherProps {
  align?: 'start' | 'end';
  side?: 'top' | 'bottom';
  showCreateButton?: boolean;
  onSwitch?: (wsId: string) => void;
}