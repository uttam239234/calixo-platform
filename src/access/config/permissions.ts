/**
 * Calixo Platform - Centralized Permission Registry
 *
 * Single source of truth for all permissions in the platform.
 * Naming convention: module.resource.action
 * Every module must register its permissions here.
 */

import type { PermissionDefinition } from '@/access/types';

// ============================================================================
// Permission Registry
// ============================================================================

export const PERMISSION_REGISTRY: PermissionDefinition[] = [
  // ============================================================================
  // Dashboard
  // ============================================================================
  { name: 'dashboard.view', description: 'View dashboard', module: 'dashboard', resource: 'dashboard', action: 'view' },
  { name: 'dashboard.export', description: 'Export dashboard data', module: 'dashboard', resource: 'dashboard', action: 'export' },

  // ============================================================================
  // Analytics
  // ============================================================================
  { name: 'analytics.view', description: 'View analytics', module: 'analytics', resource: 'analytics', action: 'view' },
  { name: 'analytics.export', description: 'Export analytics data', module: 'analytics', resource: 'analytics', action: 'export' },
  { name: 'analytics.manage', description: 'Manage analytics settings', module: 'analytics', resource: 'analytics', action: 'manage' },

  // ============================================================================
  // Ads / Campaigns
  // ============================================================================
  { name: 'ads.view', description: 'View ads and campaigns', module: 'ads', resource: 'campaigns', action: 'view' },
  { name: 'ads.create', description: 'Create ads and campaigns', module: 'ads', resource: 'campaigns', action: 'create' },
  { name: 'ads.edit', description: 'Edit ads and campaigns', module: 'ads', resource: 'campaigns', action: 'edit' },
  { name: 'ads.publish', description: 'Publish ads and campaigns', module: 'ads', resource: 'campaigns', action: 'publish' },
  { name: 'ads.pause', description: 'Pause ads and campaigns', module: 'ads', resource: 'campaigns', action: 'pause' },
  { name: 'ads.delete', description: 'Delete ads and campaigns', module: 'ads', resource: 'campaigns', action: 'delete' },
  { name: 'ads.approve', description: 'Approve ads and campaigns', module: 'ads', resource: 'campaigns', action: 'approve' },
  { name: 'ads.duplicate', description: 'Duplicate ads and campaigns', module: 'ads', resource: 'campaigns', action: 'duplicate' },

  // ============================================================================
  // Social Media
  // ============================================================================
  { name: 'social.view', description: 'View social media content', module: 'social', resource: 'posts', action: 'view' },
  { name: 'social.create', description: 'Create social media posts', module: 'social', resource: 'posts', action: 'create' },
  { name: 'social.edit', description: 'Edit social media posts', module: 'social', resource: 'posts', action: 'edit' },
  { name: 'social.publish', description: 'Publish social media posts', module: 'social', resource: 'posts', action: 'publish' },
  { name: 'social.schedule', description: 'Schedule social media posts', module: 'social', resource: 'posts', action: 'schedule' },
  { name: 'social.approve', description: 'Approve social media posts', module: 'social', resource: 'posts', action: 'approve' },
  { name: 'social.delete', description: 'Delete social media posts', module: 'social', resource: 'posts', action: 'delete' },
  { name: 'social.manage', description: 'Manage social media settings', module: 'social', resource: 'posts', action: 'manage' },

  // ============================================================================
  // Content Studio
  // ============================================================================
  { name: 'content.view', description: 'View content studio', module: 'content', resource: 'content', action: 'view' },
  { name: 'content.create', description: 'Create content', module: 'content', resource: 'content', action: 'create' },
  { name: 'content.edit', description: 'Edit content', module: 'content', resource: 'content', action: 'edit' },
  { name: 'content.generate', description: 'Generate AI content', module: 'content', resource: 'content', action: 'generate' },
  { name: 'content.publish', description: 'Publish content', module: 'content', resource: 'content', action: 'publish' },
  { name: 'content.delete', description: 'Delete content', module: 'content', resource: 'content', action: 'delete' },

  // ============================================================================
  // Brand Monitoring
  // ============================================================================
  { name: 'brand.view', description: 'View brand monitoring', module: 'brand', resource: 'mentions', action: 'view' },
  { name: 'brand.manage', description: 'Manage brand monitoring', module: 'brand', resource: 'mentions', action: 'manage' },
  { name: 'brand.export', description: 'Export brand monitoring data', module: 'brand', resource: 'mentions', action: 'export' },

  // ============================================================================
  // Reports
  // ============================================================================
  { name: 'reports.view', description: 'View reports', module: 'reports', resource: 'reports', action: 'view' },
  { name: 'reports.create', description: 'Create reports', module: 'reports', resource: 'reports', action: 'create' },
  { name: 'reports.edit', description: 'Edit reports', module: 'reports', resource: 'reports', action: 'edit' },
  { name: 'reports.export', description: 'Export reports', module: 'reports', resource: 'reports', action: 'export' },
  { name: 'reports.schedule', description: 'Schedule reports', module: 'reports', resource: 'reports', action: 'schedule' },
  { name: 'reports.delete', description: 'Delete reports', module: 'reports', resource: 'reports', action: 'delete' },

  // ============================================================================
  // AI
  // ============================================================================
  { name: 'ai.use', description: 'Use AI features', module: 'ai', resource: 'ai', action: 'use' },
  { name: 'ai.generate', description: 'Generate AI content', module: 'ai', resource: 'ai', action: 'generate' },
  { name: 'ai.train', description: 'Train AI models', module: 'ai', resource: 'ai', action: 'train' },
  { name: 'ai.manage', description: 'Manage AI settings', module: 'ai', resource: 'ai', action: 'manage' },

  // ============================================================================
  // Users & Teams
  // ============================================================================
  { name: 'users.view', description: 'View users', module: 'admin', resource: 'users', action: 'view' },
  { name: 'users.create', description: 'Create users', module: 'admin', resource: 'users', action: 'create' },
  { name: 'users.edit', description: 'Edit users', module: 'admin', resource: 'users', action: 'edit' },
  { name: 'users.delete', description: 'Delete users', module: 'admin', resource: 'users', action: 'delete' },
  { name: 'users.manage', description: 'Manage users', module: 'admin', resource: 'users', action: 'manage' },
  { name: 'users.invite', description: 'Invite users', module: 'admin', resource: 'users', action: 'invite' },
  { name: 'teams.view', description: 'View teams', module: 'admin', resource: 'teams', action: 'view' },
  { name: 'teams.create', description: 'Create teams', module: 'admin', resource: 'teams', action: 'create' },
  { name: 'teams.edit', description: 'Edit teams', module: 'admin', resource: 'teams', action: 'edit' },
  { name: 'teams.delete', description: 'Delete teams', module: 'admin', resource: 'teams', action: 'delete' },
  { name: 'teams.manage', description: 'Manage teams', module: 'admin', resource: 'teams', action: 'manage' },

  // ============================================================================
  // Roles & Permissions
  // ============================================================================
  { name: 'roles.view', description: 'View roles', module: 'admin', resource: 'roles', action: 'view' },
  { name: 'roles.create', description: 'Create roles', module: 'admin', resource: 'roles', action: 'create' },
  { name: 'roles.edit', description: 'Edit roles', module: 'admin', resource: 'roles', action: 'edit' },
  { name: 'roles.delete', description: 'Delete roles', module: 'admin', resource: 'roles', action: 'delete' },
  { name: 'roles.manage', description: 'Manage roles', module: 'admin', resource: 'roles', action: 'manage' },
  { name: 'roles.assign', description: 'Assign roles to users', module: 'admin', resource: 'roles', action: 'assign' },
  { name: 'permissions.view', description: 'View permissions', module: 'admin', resource: 'permissions', action: 'view' },
  { name: 'permissions.manage', description: 'Manage permissions', module: 'admin', resource: 'permissions', action: 'manage' },

  // ============================================================================
  // Departments
  // ============================================================================
  { name: 'departments.view', description: 'View departments', module: 'admin', resource: 'departments', action: 'view' },
  { name: 'departments.create', description: 'Create departments', module: 'admin', resource: 'departments', action: 'create' },
  { name: 'departments.edit', description: 'Edit departments', module: 'admin', resource: 'departments', action: 'edit' },
  { name: 'departments.delete', description: 'Delete departments', module: 'admin', resource: 'departments', action: 'delete' },
  { name: 'departments.manage', description: 'Manage departments', module: 'admin', resource: 'departments', action: 'manage' },

  // ============================================================================
  // Settings
  // ============================================================================
  { name: 'settings.view', description: 'View settings', module: 'admin', resource: 'settings', action: 'view' },
  { name: 'settings.manage', description: 'Manage settings', module: 'admin', resource: 'settings', action: 'manage' },
  { name: 'settings.security', description: 'Manage security settings', module: 'admin', resource: 'settings', action: 'security' },
  { name: 'settings.branding', description: 'Manage branding settings', module: 'admin', resource: 'settings', action: 'branding' },

  // ============================================================================
  // Audit
  // ============================================================================
  { name: 'audit.view', description: 'View audit logs', module: 'admin', resource: 'audit', action: 'view' },
  { name: 'audit.export', description: 'Export audit logs', module: 'admin', resource: 'audit', action: 'export' },

  // ============================================================================
  // Billing
  // ============================================================================
  { name: 'billing.view', description: 'View billing', module: 'admin', resource: 'billing', action: 'view' },
  { name: 'billing.manage', description: 'Manage billing', module: 'admin', resource: 'billing', action: 'manage' },
  { name: 'billing.plans', description: 'View plans', module: 'admin', resource: 'billing', action: 'plans' },
  { name: 'billing.invoices', description: 'View invoices', module: 'admin', resource: 'billing', action: 'invoices' },

  // ============================================================================
  // Integrations
  // ============================================================================
  { name: 'integrations.view', description: 'View integrations', module: 'admin', resource: 'integrations', action: 'view' },
  { name: 'integrations.create', description: 'Create integrations', module: 'admin', resource: 'integrations', action: 'create' },
  { name: 'integrations.edit', description: 'Edit integrations', module: 'admin', resource: 'integrations', action: 'edit' },
  { name: 'integrations.delete', description: 'Delete integrations', module: 'admin', resource: 'integrations', action: 'delete' },
  { name: 'integrations.manage', description: 'Manage integrations', module: 'admin', resource: 'integrations', action: 'manage' },

  // ============================================================================
  // API & Webhooks
  // ============================================================================
  { name: 'api.view', description: 'View API settings', module: 'admin', resource: 'api', action: 'view' },
  { name: 'api.manage', description: 'Manage API keys', module: 'admin', resource: 'api', action: 'manage' },
  { name: 'api.webhooks', description: 'Manage webhooks', module: 'admin', resource: 'api', action: 'webhooks' },

  // ============================================================================
  // Workspaces
  // ============================================================================
  { name: 'workspaces.view', description: 'View workspaces', module: 'admin', resource: 'workspaces', action: 'view' },
  { name: 'workspaces.create', description: 'Create workspaces', module: 'admin', resource: 'workspaces', action: 'create' },
  { name: 'workspaces.edit', description: 'Edit workspaces', module: 'admin', resource: 'workspaces', action: 'edit' },
  { name: 'workspaces.delete', description: 'Delete workspaces', module: 'admin', resource: 'workspaces', action: 'delete' },
  { name: 'workspaces.manage', description: 'Manage workspaces', module: 'admin', resource: 'workspaces', action: 'manage' },

  // ============================================================================
  // Policies
  // ============================================================================
  { name: 'policies.view', description: 'View policies', module: 'admin', resource: 'policies', action: 'view' },
  { name: 'policies.create', description: 'Create policies', module: 'admin', resource: 'policies', action: 'create' },
  { name: 'policies.edit', description: 'Edit policies', module: 'admin', resource: 'policies', action: 'edit' },
  { name: 'policies.delete', description: 'Delete policies', module: 'admin', resource: 'policies', action: 'delete' },
  { name: 'policies.manage', description: 'Manage policies', module: 'admin', resource: 'policies', action: 'manage' },
];

// ============================================================================
// Permission Registry Class
// ============================================================================

export class PermissionRegistry {
  private permissions: Map<string, PermissionDefinition> = new Map();

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    for (const perm of PERMISSION_REGISTRY) {
      this.permissions.set(perm.name, perm);
    }
  }

  getPermission(name: string): PermissionDefinition | undefined {
    return this.permissions.get(name);
  }

  hasPermission(name: string): boolean {
    return this.permissions.has(name);
  }

  getAllPermissions(): PermissionDefinition[] {
    return Array.from(this.permissions.values());
  }

  getPermissionsByModule(module: string): PermissionDefinition[] {
    return this.getAllPermissions().filter(p => p.module === module);
  }

  getPermissionsByResource(module: string, resource: string): PermissionDefinition[] {
    return this.getAllPermissions().filter(p => p.module === module && p.resource === resource);
  }

  getModules(): string[] {
    const modules = new Set(this.getAllPermissions().map(p => p.module));
    return Array.from(modules).sort();
  }

  getResources(module: string): string[] {
    const resources = new Set(
      this.getAllPermissions()
        .filter(p => p.module === module)
        .map(p => p.resource)
    );
    return Array.from(resources).sort();
  }

  registerPermission(permission: PermissionDefinition): void {
    if (this.permissions.has(permission.name)) {
      throw new Error(`Permission '${permission.name}' is already registered`);
    }
    this.permissions.set(permission.name, permission);
  }

  registerPermissions(permissions: PermissionDefinition[]): void {
    for (const perm of permissions) {
      this.registerPermission(perm);
    }
  }

  validatePermission(name: string): boolean {
    const parts = name.split('.');
    if (parts.length !== 3) return false;
    const [module, resource, action] = parts;
    if (!module || !resource || !action) return false;
    return true;
  }
}

export const permissionRegistry = new PermissionRegistry();