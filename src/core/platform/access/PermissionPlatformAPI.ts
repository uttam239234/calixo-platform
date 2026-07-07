/** Calixo Platform - Permission Platform API. Wraps `permissionService`/`roleService` — no module should import them directly. */
import { permissionService } from "@/access/services/PermissionService";
import { roleService } from "@/access/services/RoleService";
import type { Permission } from "@/access/types";
import { permissionCache } from "./PermissionCache";
import { permissionRegistry } from "./PermissionRegistry";

export class PermissionPlatformAPI {
  async getAllPermissions(): Promise<Permission[]> {
    return permissionService.getAllPermissions();
  }

  async getPermissionsByModule(module: string): Promise<Permission[]> {
    return permissionService.getPermissionsByModule(module);
  }

  /** The canonical, matrix-conformant permission catalog (`"{resourceType}:{action}"`) — the recommended set for any NEW permission going forward. */
  getCanonicalPermissions(): string[] {
    return permissionRegistry.getAll();
  }

  async getEffectivePermissions(userId: string, organizationId?: string): Promise<string[]> {
    const cached = permissionCache.get(userId, organizationId);
    if (cached) return cached;
    const permissions = await roleService.getUserPermissions(userId, organizationId);
    permissionCache.set(userId, permissions, organizationId);
    return permissions;
  }

  async hasPermission(userId: string, permission: string, organizationId?: string): Promise<boolean> {
    const permissions = await this.getEffectivePermissions(userId, organizationId);
    return permissions.includes("*") || permissions.includes(permission);
  }
}

export const permissionPlatformAPI = new PermissionPlatformAPI();
