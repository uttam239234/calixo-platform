/**
 * Calixo Platform - Permission Service
 *
 * Manages permission lifecycle and provides permission lookup.
 * Integrates with the centralized Permission Registry.
 */

import { appLogger } from '@/logging';
import { NotFoundError } from '@/errors';
import type { Permission, PaginatedPermissions } from '@/access/types';
import type { PermissionRepository } from '@/access/repositories/interfaces';
import { InMemoryPermissionRepository } from '@/access/repositories/implementations';
import { permissionRegistry, PERMISSION_REGISTRY } from '@/access/config/permissions';

export class PermissionService {
  private permRepo: PermissionRepository;

  constructor(permRepo?: PermissionRepository) {
    this.permRepo = permRepo || new InMemoryPermissionRepository();
  }

  async initializePermissions(): Promise<number> {
    const existing = await this.permRepo.getAll();
    if (existing.length > 0) {
      return existing.length;
    }

    const now = new Date().toISOString();
    let count = 0;

    for (const def of PERMISSION_REGISTRY) {
      const exists = await this.permRepo.exists(def.name);
      if (!exists) {
        const permission: Permission = {
          id: def.name, // Use permission name as ID for simplicity
          name: def.name,
          description: def.description,
          module: def.module,
          resource: def.resource,
          action: def.action,
          isSystem: true,
          isDeleted: false,
          createdAt: now,
          updatedAt: now,
        };
        await this.permRepo.create(permission);
        count++;
      }
    }

    appLogger.info('PermissionService', `Permissions initialized: ${count} permissions`);
    return count;
  }

  async getPermission(id: string): Promise<Permission> {
    const perm = await this.permRepo.getById(id);
    if (!perm) throw new NotFoundError('Permission');
    return perm;
  }

  async getPermissionByName(name: string): Promise<Permission | null> {
    return this.permRepo.getByName(name);
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.permRepo.getAll();
  }

  async getPermissionsByModule(module: string): Promise<Permission[]> {
    return this.permRepo.getByModule(module);
  }

  async getPaginatedPermissions(params: {
    page?: number;
    limit?: number;
    search?: string;
    module?: string;
  }): Promise<PaginatedPermissions> {
    return this.permRepo.getPaginated(params);
  }

  async hasPermission(name: string): Promise<boolean> {
    return this.permRepo.exists(name);
  }

  validatePermissionName(name: string): boolean {
    return permissionRegistry.validatePermission(name);
  }

  getModules(): string[] {
    return permissionRegistry.getModules();
  }

  getResources(module: string): string[] {
    return permissionRegistry.getResources(module);
  }
}

export const permissionService = new PermissionService();