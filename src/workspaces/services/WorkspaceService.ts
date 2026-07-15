/**
 * Calixo Platform - Workspace Service
 *
 * A thin adapter, not a second workspace store. Delegates every method to
 * the canonical `workspacePlatformAPI` (`core/platform/workspaces` —
 * real, fully implemented, previously never consumed by the running app)
 * via a `toProfile()` mapper that translates the canonical `Workspace`
 * shape into this module's pre-existing `WorkspaceProfile` shape. Exists
 * so `useWorkspace.tsx`/`WorkspaceSwitcher.tsx`/`DashboardShell.tsx` (the
 * 12+ files' worth of precedent for this exact pattern is the Organizations
 * adapter from an earlier round) keep working unchanged — their public
 * contract, `WorkspaceProfile`, is untouched; only what backs it changed.
 */

import { NotFoundError } from '@/errors';
import { workspacePlatformAPI } from '@/core/platform/workspaces';
import type { Workspace } from '@/core/platform/workspaces';
import type {
  WorkspaceProfile,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
} from '@/workspaces/types';

function toProfile(workspace: Workspace): WorkspaceProfile {
  return {
    id: workspace.id,
    organizationId: workspace.organizationId,
    name: workspace.name,
    slug: workspace.slug,
    description: workspace.description,
    type: workspace.type,
    isDefault: workspace.isDefault,
    isActive: !workspace.isArchived,
    isDeleted: workspace.isArchived,
    deletedAt: workspace.archivedAt,
    settings: {
      timezone: workspace.settings.timezone,
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      weekStartsOn: 'monday',
      language: workspace.settings.language,
      currency: 'USD',
      preferences: {
        defaultView: workspace.settings.defaultView,
        itemsPerPage: workspace.settings.itemsPerPage,
        enableNotifications: true,
        enableAutomation: true,
      },
    },
    branding: {
      logo: workspace.branding.logo,
      icon: workspace.branding.icon,
      theme: workspace.branding.theme,
    },
    memberCount: workspace.memberCount,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
  };
}

export class WorkspaceService {
  async createWorkspace(request: CreateWorkspaceRequest, actorId: string): Promise<WorkspaceProfile> {
    const workspace = workspacePlatformAPI.create(
      { organizationId: request.organizationId, name: request.name, slug: request.slug, description: request.description, type: request.type, settings: request.settings },
      actorId
    );
    return toProfile(workspace);
  }

  async getWorkspace(wsId: string): Promise<WorkspaceProfile | null> {
    const workspace = workspacePlatformAPI.get(wsId);
    if (!workspace || workspace.isArchived) return null;
    return toProfile(workspace);
  }

  async getOrganizationWorkspaces(orgId: string): Promise<WorkspaceProfile[]> {
    return workspacePlatformAPI
      .list({ organizationId: orgId })
      .map(toProfile)
      .sort((a, b) => {
        if (a.isDefault) return -1;
        if (b.isDefault) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }

  async updateWorkspace(wsId: string, data: UpdateWorkspaceRequest, actorId: string): Promise<WorkspaceProfile> {
    const updated = workspacePlatformAPI.update(wsId, { name: data.name, description: data.description, settings: data.settings, branding: data.branding }, actorId);
    if (!updated) throw new NotFoundError('Workspace');
    return toProfile(updated);
  }

  async archiveWorkspace(wsId: string, actorId: string): Promise<void> {
    const archived = workspacePlatformAPI.archive(wsId, actorId);
    if (!archived) throw new NotFoundError('Workspace');
  }

  async switchWorkspace(wsId: string): Promise<WorkspaceProfile> {
    const workspace = await this.getWorkspace(wsId);
    if (!workspace) throw new NotFoundError('Workspace');
    return workspace;
  }

  async getDefaultWorkspace(orgId: string): Promise<WorkspaceProfile | null> {
    const workspaces = await this.getOrganizationWorkspaces(orgId);
    return workspaces.find(ws => ws.isDefault) || workspaces[0] || null;
  }
}

export const workspaceService = new WorkspaceService();
