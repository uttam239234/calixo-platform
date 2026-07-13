/**
 * Calixo Platform - Workspace Platform API
 *
 * Added during the Track 1 Enterprise Platform Certification, mirroring
 * `OrganizationPlatformAPI` — a thin wrapper, not new logic; every method
 * already existed on `WorkspaceEngine`/`WorkspaceRegistry` (both untouched).
 */
import { workspaceEngine } from "./WorkspaceEngine";
import { workspaceRegistry, type WorkspaceListParams } from "./WorkspaceRegistry";
import type { CreateWorkspaceInput, UpdateWorkspaceInput, Workspace, WorkspaceAuditEntry, WorkspaceMember, WorkspaceMemberRole } from "./types";

export class WorkspacePlatformAPI {
  create(input: CreateWorkspaceInput, actorId: string): Workspace {
    return workspaceEngine.create(input, actorId);
  }

  update(id: string, input: UpdateWorkspaceInput, actorId: string): Workspace | undefined {
    return workspaceEngine.update(id, input, actorId);
  }

  archive(id: string, actorId: string): Workspace | undefined {
    return workspaceEngine.archive(id, actorId);
  }

  assertBelongsToOrganization(workspaceId: string, organizationId: string): Workspace {
    return workspaceEngine.assertBelongsToOrganization(workspaceId, organizationId);
  }

  get(id: string): Workspace | undefined {
    return workspaceRegistry.lookup(id);
  }

  list(params?: WorkspaceListParams): Workspace[] {
    return workspaceRegistry.list(params);
  }

  getDefaultForOrganization(organizationId: string): Workspace | undefined {
    return workspaceRegistry.getDefaultForOrganization(organizationId);
  }

  getForUser(userId: string): Workspace[] {
    return workspaceEngine.getWorkspacesForUser(userId);
  }

  addMember(workspaceId: string, userId: string, role?: WorkspaceMemberRole): WorkspaceMember {
    return workspaceEngine.addMember(workspaceId, userId, role);
  }

  removeMember(workspaceId: string, userId: string, actorId: string): boolean {
    return workspaceEngine.removeMember(workspaceId, userId, actorId);
  }

  getMembers(workspaceId: string): WorkspaceMember[] {
    return workspaceEngine.getMembers(workspaceId);
  }

  count(): number {
    return workspaceRegistry.count();
  }

  getAuditTrail(workspaceId: string): WorkspaceAuditEntry[] {
    return workspaceEngine.getAuditTrail(workspaceId);
  }
}

export const workspacePlatformAPI = new WorkspacePlatformAPI();
