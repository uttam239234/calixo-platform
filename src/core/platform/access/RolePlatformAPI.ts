/**
 * Calixo Platform - Role Platform API
 *
 * Wraps `roleService` (`src/access`, unmodified) and adds
 * `RoleAssigned`/`RoleRemoved` platform events plus permission-cache
 * invalidation on every assignment change.
 */
import { roleService } from "@/access/services/RoleService";
import type { CreateRoleRequest, Role, UserRoleAssignment } from "@/access/types";
import { platformEventBus } from "../events/PlatformEventBus";
import { permissionCache } from "./PermissionCache";

export class RolePlatformAPI {
  async getAllRoles(): Promise<Role[]> {
    return roleService.getAllRoles();
  }

  async createRole(data: CreateRoleRequest): Promise<Role> {
    return roleService.createRole(data);
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
