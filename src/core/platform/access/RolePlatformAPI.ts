/**
 * Calixo Platform - Role Platform API
 *
 * Wraps `roleService` (`src/access`, unmodified) and adds
 * `RoleAssigned`/`RoleRemoved` platform events plus permission-cache
 * invalidation on every assignment change.
 */
import { roleService } from "@/access/services/RoleService";
import type { CreateRoleRequest, PaginatedRoles, Role, UpdateRoleRequest, UserRoleAssignment } from "@/access/types";
import { platformEventBus } from "../events/PlatformEventBus";
import { permissionCache } from "./PermissionCache";

export class RolePlatformAPI {
  async getAllRoles(): Promise<Role[]> {
    return roleService.getAllRoles();
  }

  async getRole(id: string): Promise<Role> {
    return roleService.getRole(id);
  }

  async getPaginatedRoles(params: { page?: number; limit?: number; search?: string; isSystem?: boolean }): Promise<PaginatedRoles> {
    return roleService.getPaginatedRoles(params);
  }

  async createRole(data: CreateRoleRequest): Promise<Role> {
    return roleService.createRole(data);
  }

  /** Role permission edits affect every current assignee across every organization — `PermissionCache`'s 60s TTL self-heals rather than tracking that fan-out here. */
  async updateRole(id: string, data: UpdateRoleRequest): Promise<Role> {
    return roleService.updateRole(id, data);
  }

  /** "Archive Role" in the UI — `roleService.deleteRole()` is already a soft delete (`isDeleted=true`), never a hard removal. */
  async archiveRole(id: string): Promise<boolean> {
    return roleService.deleteRole(id);
  }

  async getRolePermissions(roleId: string): Promise<string[]> {
    return roleService.getRolePermissions(roleId);
  }

  async assignPermissionToRole(roleId: string, permissionName: string): Promise<void> {
    await roleService.assignPermissionToRole(roleId, permissionName);
  }

  async removePermissionFromRole(roleId: string, permissionName: string): Promise<void> {
    await roleService.removePermissionFromRole(roleId, permissionName);
  }

  async assignRoleToUser(data: { userId: string; roleId: string; organizationId?: string; workspaceId?: string; teamId?: string; grantedBy?: string; expiresAt?: string }): Promise<UserRoleAssignment> {
    const assignment = await roleService.assignRoleToUser(data);
    permissionCache.invalidateUser(data.userId, data.organizationId);
    void platformEventBus.publish({ type: "RoleAssigned", organizationId: data.organizationId, workspaceId: data.workspaceId, userId: data.userId, payload: { roleId: data.roleId, grantedBy: data.grantedBy } });
    return assignment;
  }

  async removeRoleFromUser(userId: string, roleId: string, organizationId?: string): Promise<boolean> {
    const removed = await roleService.removeRoleFromUser(userId, roleId);
    permissionCache.invalidateUser(userId, organizationId);
    void platformEventBus.publish({ type: "RoleRemoved", organizationId, userId, payload: { roleId } });
    return removed;
  }

  async getUserRoles(userId: string, organizationId?: string): Promise<UserRoleAssignment[]> {
    return roleService.getUserRoles(userId, organizationId);
  }

  async hasWildcardAccess(userId: string, organizationId?: string): Promise<boolean> {
    return roleService.hasWildcardAccess(userId, organizationId);
  }
}

export const rolePlatformAPI = new RolePlatformAPI();
