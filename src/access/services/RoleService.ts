/**
 * Calixo Platform - Role Service
 *
 * Manages role lifecycle: create, update, delete, assign permissions.
 * Supports system roles and custom roles.
 */

import { appLogger } from '@/logging';
import { NotFoundError, ValidationError } from '@/errors';
import type { Role, CreateRoleRequest, UpdateRoleRequest, UserRoleAssignment, PaginatedRoles } from '@/access/types';
import type { RoleRepository, UserRoleAssignmentRepository, RolePermissionAssignmentRepository } from '@/access/repositories/interfaces';
import { InMemoryRoleRepository, InMemoryRolePermissionAssignmentRepository } from '@/access/repositories/implementations';
import { sharedUserRoleAssignmentRepository } from '@/access/repositories/sharedInstances';
import { createSystemRoles, SYSTEM_ROLES } from '@/access/config/roles';

export class RoleService {
  private roleRepo: RoleRepository;
  private userAssignmentRepo: UserRoleAssignmentRepository;
  private rolePermissionRepo: RolePermissionAssignmentRepository;

  constructor(
    roleRepo?: RoleRepository,
    userAssignmentRepo?: UserRoleAssignmentRepository,
    rolePermissionRepo?: RolePermissionAssignmentRepository
  ) {
    this.roleRepo = roleRepo || new InMemoryRoleRepository();
    // Shared with `AuthorizationEngine`'s default instance — see `sharedInstances.ts`.
    this.userAssignmentRepo = userAssignmentRepo || sharedUserRoleAssignmentRepository;
    this.rolePermissionRepo = rolePermissionRepo || new InMemoryRolePermissionAssignmentRepository();
  }

  async initializeSystemRoles(): Promise<Role[]> {
    const existing = await this.roleRepo.getSystemRoles();
    if (existing.length > 0) {
      return existing;
    }

    const roles = createSystemRoles();
    const systemRoleDefs = new Map(SYSTEM_ROLES.map(def => [def.name, def.permissions]));
    const created: Role[] = [];

    for (const role of roles) {
      const existingRole = await this.roleRepo.getBySlug(role.slug);
      if (!existingRole) {
        // `createSystemRole()` (not `create()`) — `create()` always stamps
        // `isSystem: false`, which silently mis-flagged every system role as
        // custom (`getSystemRoles()` always returned empty, and the
        // `isSystem` modify/delete guard in `updateRole()`/`deleteRole()`
        // never actually protected them). Found via live integration
        // testing while building the Enterprise Integration & Connector
        // Platform (Track 1 Phase 5).
        const createdRole = await this.roleRepo.createSystemRole({
          name: role.name,
          description: role.description,
          priority: role.priority,
        });
        // System roles carry their permission list in `SYSTEM_ROLES` (config/roles.ts),
        // not on the `Role` entity itself — assign + sync it the same way `createRole()` does.
        const permissions = systemRoleDefs.get(role.name) ?? [];
        for (const permName of permissions) {
          await this.rolePermissionRepo.assign(createdRole.id, permName);
        }
        this.userAssignmentRepo.setRolePermissions(createdRole.id, permissions);
        created.push(createdRole);
      }
    }

    appLogger.info('RoleService', `System roles initialized: ${created.length} roles`);
    return created;
  }

  async getRole(id: string): Promise<Role> {
    const role = await this.roleRepo.getById(id);
    if (!role) throw new NotFoundError('Role');
    return role;
  }

  async getRoleBySlug(slug: string): Promise<Role | null> {
    return this.roleRepo.getBySlug(slug);
  }

  async getAllRoles(): Promise<Role[]> {
    return this.roleRepo.getAll();
  }

  async getSystemRoles(): Promise<Role[]> {
    return this.roleRepo.getSystemRoles();
  }

  async getCustomRoles(): Promise<Role[]> {
    return this.roleRepo.getCustomRoles();
  }

  async getPaginatedRoles(params: {
    page?: number;
    limit?: number;
    search?: string;
    isSystem?: boolean;
  }): Promise<PaginatedRoles> {
    return this.roleRepo.getPaginated(params);
  }

  async createRole(data: CreateRoleRequest): Promise<Role> {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('Role name is required');
    }

    const existing = await this.roleRepo.getByName(data.name);
    if (existing) {
      throw new ValidationError('A role with this name already exists');
    }

    const role = await this.roleRepo.create(data);

    // Assign permissions if provided
    if (data.permissions && data.permissions.length > 0) {
      for (const permName of data.permissions) {
        // Permission IDs are stored as permission names in the assignment
        await this.rolePermissionRepo.assign(role.id, permName);
      }
    }
    // Keep `userAssignmentRepo`'s own roleId->permissions index in sync — this
    // is what `getPermissionNamesByUser()` (and therefore every RBAC check in
    // `AuthorizationEngine`) actually reads from; without this call a role's
    // permissions were assigned in `rolePermissionRepo` but never resolvable
    // for any user holding that role.
    this.userAssignmentRepo.setRolePermissions(role.id, data.permissions ?? []);

    appLogger.info('RoleService', `Role created: ${role.name} (${role.id})`);
    return role;
  }

  async updateRole(id: string, data: UpdateRoleRequest): Promise<Role> {
    const role = await this.roleRepo.getById(id);
    if (!role) throw new NotFoundError('Role');
    if (role.isSystem) {
      throw new ValidationError('Cannot modify system roles');
    }

    const updated = await this.roleRepo.update(id, data);

    // Update permissions if provided
    if (data.permissions) {
      await this.rolePermissionRepo.removeAllByRole(id);
      for (const permName of data.permissions) {
        await this.rolePermissionRepo.assign(id, permName);
      }
      this.userAssignmentRepo.setRolePermissions(id, data.permissions);
    }

    return updated;
  }

  async deleteRole(id: string): Promise<boolean> {
    const role = await this.roleRepo.getById(id);
    if (!role) throw new NotFoundError('Role');
    if (role.isSystem) {
      throw new ValidationError('Cannot delete system roles');
    }
    appLogger.info('RoleService', `Role deleted: ${role.name} (${id})`);
    return this.roleRepo.delete(id);
  }

  // ============================================================================
  // Role Permissions
  // ============================================================================

  async getRolePermissions(roleId: string): Promise<string[]> {
    return this.rolePermissionRepo.getPermissionNamesByRole(roleId);
  }

  async assignPermissionToRole(roleId: string, permissionName: string): Promise<void> {
    const role = await this.roleRepo.getById(roleId);
    if (!role) throw new NotFoundError('Role');
    await this.rolePermissionRepo.assign(roleId, permissionName);
    this.userAssignmentRepo.setRolePermissions(roleId, await this.rolePermissionRepo.getPermissionNamesByRole(roleId));
  }

  async removePermissionFromRole(roleId: string, permissionName: string): Promise<void> {
    const role = await this.roleRepo.getById(roleId);
    if (!role) throw new NotFoundError('Role');
    await this.rolePermissionRepo.remove(roleId, permissionName);
    this.userAssignmentRepo.setRolePermissions(roleId, await this.rolePermissionRepo.getPermissionNamesByRole(roleId));
  }

  // ============================================================================
  // User Role Assignments
  // ============================================================================

  async assignRoleToUser(data: {
    userId: string;
    roleId: string;
    organizationId?: string;
    workspaceId?: string;
    teamId?: string;
    grantedBy?: string;
    expiresAt?: string;
  }): Promise<UserRoleAssignment> {
    const role = await this.roleRepo.getById(data.roleId);
    if (!role) throw new NotFoundError('Role');

    appLogger.info('RoleService', `Role ${role.name} assigned to user ${data.userId}`);
    return this.userAssignmentRepo.assign(data);
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    appLogger.info('RoleService', `Role ${roleId} removed from user ${userId}`);
    return this.userAssignmentRepo.removeByUserAndRole(userId, roleId);
  }

  async getUserRoles(userId: string, organizationId?: string): Promise<UserRoleAssignment[]> {
    if (organizationId) {
      return this.userAssignmentRepo.getByUserAndOrganization(userId, organizationId);
    }
    return this.userAssignmentRepo.getByUser(userId);
  }

  async getUserPermissions(userId: string, organizationId?: string): Promise<string[]> {
    return this.userAssignmentRepo.getPermissionNamesByUser(userId, organizationId);
  }

  async hasWildcardAccess(userId: string, organizationId?: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId, organizationId);
    return permissions.includes('*');
  }
}

export const roleService = new RoleService();