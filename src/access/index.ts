/**
 * Calixo Platform - Enterprise Access Management Module
 *
 * Central export for the entire Access Management Platform.
 * Import from here for all access management functionality.
 *
 * Architecture: Enterprise-grade authorization supporting:
 * - Single Organization
 * - Multi Organization
 * - Multiple Workspaces
 * - Departments
 * - Teams
 * - Roles
 * - Permissions
 * - Policies
 * - Subscription Permissions
 * - Enterprise Expansion
 */

// ============================================================================
// Types
// ============================================================================
export * from './types';

// ============================================================================
// Configuration
// ============================================================================
export * from './config';

// ============================================================================
// Repositories
// ============================================================================
export * from './repositories';

// ============================================================================
// Services
// ============================================================================
export * from './services';

// ============================================================================
// Engine
// ============================================================================
export * from './engine';

// ============================================================================
// Middleware
// ============================================================================
export * from './middleware';

// ============================================================================
// Audit
// ============================================================================
export * from './audit';

// ============================================================================
// Context
// ============================================================================
export * from './context';

// ============================================================================
// Initialization
// ============================================================================

import { appLogger } from '@/logging';
import { permissionService } from '@/access/services/PermissionService';
import { roleService } from '@/access/services/RoleService';

/**
 * Initialize the access management platform.
 * Seeds permissions and system roles into the repositories.
 */
export async function initializeAccessPlatform(): Promise<void> {
  appLogger.info('AccessPlatform', 'Initializing Enterprise Access Management Platform...');

  // Initialize permissions from the registry
  const permissionCount = await permissionService.initializePermissions();
  appLogger.info('AccessPlatform', `Initialized ${permissionCount} permissions`);

  // Initialize system roles
  const roles = await roleService.initializeSystemRoles();
  appLogger.info('AccessPlatform', `Initialized ${roles.length} system roles`);

  appLogger.info('AccessPlatform', 'Enterprise Access Management Platform initialized successfully');
}