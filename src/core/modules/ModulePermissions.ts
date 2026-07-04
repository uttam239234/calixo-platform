/**
 * Calixo Platform - Enterprise Module SDK
 * ModulePermissions - Aggregates permissions from all registered modules.
 */

import { ModuleRegistry } from "./ModuleRegistry";
import type { ModulePermissionDefinition } from "./ModuleTypes";

export const ModulePermissions = {
  /**
   * Get all permissions across all enabled modules.
   */
  getAll(): ModulePermissionDefinition[] {
    return ModuleRegistry.getAllPermissions();
  },

  /**
   * Get permissions for a specific module.
   */
  getByModule(moduleId: string): ModulePermissionDefinition[] {
    const mod = ModuleRegistry.get(moduleId);
    return mod?.permissions ?? [];
  },

  /**
   * Check if a specific permission name exists across any module.
   */
  exists(permissionName: string): boolean {
    return this.getAll().some((p) => p.name === permissionName);
  },

  /**
   * Get all permission names as a flat string array.
   */
  getPermissionNames(): string[] {
    return this.getAll().map((p) => p.name);
  },
};