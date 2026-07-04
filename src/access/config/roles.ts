/**
 * Calixo Platform - System Role Definitions
 *
 * Predefined system roles with their permission sets.
 * Supports custom roles in addition to system roles.
 */

import type { Role } from '@/access/types';
import { generateId, slugify } from '@/shared/utils/string';

// ============================================================================
// System Role Definitions
// ============================================================================

export interface SystemRoleDefinition {
  name: string;
  description: string;
  priority: number;
  permissions: string[];
}

export const SYSTEM_ROLES: SystemRoleDefinition[] = [
  {
    name: 'Owner',
    description: 'Full platform access. Can manage everything including billing, users, and settings.',
    priority: 1000,
    permissions: ['*'], // Wildcard - all permissions
  },
  {
    name: 'Super Admin',
    description: 'Complete administrative access across all modules. Can manage users, roles, settings, and all platform features.',
    priority: 900,
    permissions: [
      'dashboard.view', 'dashboard.export',
      'analytics.view', 'analytics.export', 'analytics.manage',
      'ads.view', 'ads.create', 'ads.edit', 'ads.publish', 'ads.pause', 'ads.delete', 'ads.approve', 'ads.duplicate',
      'social.view', 'social.create', 'social.edit', 'social.publish', 'social.schedule', 'social.approve', 'social.delete', 'social.manage',
      'content.view', 'content.create', 'content.edit', 'content.generate', 'content.publish', 'content.delete',
      'brand.view', 'brand.manage', 'brand.export',
      'reports.view', 'reports.create', 'reports.edit', 'reports.export', 'reports.schedule', 'reports.delete',
      'ai.use', 'ai.generate', 'ai.train', 'ai.manage',
      'users.view', 'users.create', 'users.edit', 'users.delete', 'users.manage', 'users.invite',
      'teams.view', 'teams.create', 'teams.edit', 'teams.delete', 'teams.manage',
      'roles.view', 'roles.create', 'roles.edit', 'roles.delete', 'roles.manage', 'roles.assign',
      'permissions.view', 'permissions.manage',
      'departments.view', 'departments.create', 'departments.edit', 'departments.delete', 'departments.manage',
      'settings.view', 'settings.manage', 'settings.security', 'settings.branding',
      'audit.view', 'audit.export',
      'billing.view', 'billing.manage', 'billing.plans', 'billing.invoices',
      'integrations.view', 'integrations.create', 'integrations.edit', 'integrations.delete', 'integrations.manage',
      'api.view', 'api.manage', 'api.webhooks',
      'workspaces.view', 'workspaces.create', 'workspaces.edit', 'workspaces.delete', 'workspaces.manage',
      'policies.view', 'policies.create', 'policies.edit', 'policies.delete', 'policies.manage',
    ],
  },
  {
    name: 'Admin',
    description: 'Full administrative access. Can manage users, teams, roles, and most settings except billing.',
    priority: 800,
    permissions: [
      'dashboard.view', 'dashboard.export',
      'analytics.view', 'analytics.export', 'analytics.manage',
      'ads.view', 'ads.create', 'ads.edit', 'ads.publish', 'ads.pause', 'ads.delete', 'ads.approve', 'ads.duplicate',
      'social.view', 'social.create', 'social.edit', 'social.publish', 'social.schedule', 'social.approve', 'social.delete', 'social.manage',
      'content.view', 'content.create', 'content.edit', 'content.generate', 'content.publish', 'content.delete',
      'brand.view', 'brand.manage', 'brand.export',
      'reports.view', 'reports.create', 'reports.edit', 'reports.export', 'reports.schedule', 'reports.delete',
      'ai.use', 'ai.generate', 'ai.manage',
      'users.view', 'users.create', 'users.edit', 'users.delete', 'users.manage', 'users.invite',
      'teams.view', 'teams.create', 'teams.edit', 'teams.delete', 'teams.manage',
      'roles.view', 'roles.create', 'roles.edit', 'roles.delete', 'roles.manage', 'roles.assign',
      'permissions.view', 'permissions.manage',
      'departments.view', 'departments.create', 'departments.edit', 'departments.delete', 'departments.manage',
      'settings.view', 'settings.manage', 'settings.security', 'settings.branding',
      'audit.view', 'audit.export',
      'billing.view', 'billing.plans', 'billing.invoices',
      'integrations.view', 'integrations.create', 'integrations.edit', 'integrations.delete', 'integrations.manage',
      'api.view', 'api.manage', 'api.webhooks',
      'workspaces.view', 'workspaces.create', 'workspaces.edit', 'workspaces.delete', 'workspaces.manage',
      'policies.view', 'policies.create', 'policies.edit', 'policies.delete', 'policies.manage',
    ],
  },
  {
    name: 'Director',
    description: 'Strategic oversight across all modules. Can view all data, manage teams, and approve content.',
    priority: 700,
    permissions: [
      'dashboard.view', 'dashboard.export',
      'analytics.view', 'analytics.export',
      'ads.view', 'ads.approve',
      'social.view', 'social.approve',
      'content.view', 'content.approve',
      'brand.view', 'brand.export',
      'reports.view', 'reports.create', 'reports.export', 'reports.schedule',
      'ai.use',
      'users.view',
      'teams.view', 'teams.create', 'teams.edit', 'teams.manage',
      'roles.view',
      'permissions.view',
      'departments.view',
      'settings.view',
      'audit.view',
      'billing.view', 'billing.plans', 'billing.invoices',
      'integrations.view',
      'workspaces.view',
      'policies.view',
    ],
  },
  {
    name: 'Manager',
    description: 'Day-to-day management of campaigns, social media, content, and team oversight.',
    priority: 600,
    permissions: [
      'dashboard.view',
      'analytics.view', 'analytics.export',
      'ads.view', 'ads.create', 'ads.edit', 'ads.publish', 'ads.pause',
      'social.view', 'social.create', 'social.edit', 'social.publish', 'social.schedule',
      'content.view', 'content.create', 'content.edit', 'content.generate', 'content.publish',
      'brand.view',
      'reports.view', 'reports.create', 'reports.export',
      'ai.use', 'ai.generate',
      'users.view',
      'teams.view',
      'settings.view',
    ],
  },
  {
    name: 'Campaign Manager',
    description: 'Focused on ad campaign creation, management, and optimization across platforms.',
    priority: 500,
    permissions: [
      'dashboard.view',
      'analytics.view', 'analytics.export',
      'ads.view', 'ads.create', 'ads.edit', 'ads.publish', 'ads.pause', 'ads.duplicate',
      'reports.view', 'reports.create', 'reports.export',
      'ai.use', 'ai.generate',
      'users.view',
      'teams.view',
    ],
  },
  {
    name: 'Analyst',
    description: 'Data analysis and reporting across all modules. Read-only access to analytics.',
    priority: 400,
    permissions: [
      'dashboard.view', 'dashboard.export',
      'analytics.view', 'analytics.export',
      'ads.view',
      'social.view',
      'brand.view', 'brand.export',
      'reports.view', 'reports.create', 'reports.export', 'reports.schedule',
      'ai.use',
    ],
  },
  {
    name: 'Content Creator',
    description: 'Content creation and management across social media and content studio.',
    priority: 300,
    permissions: [
      'dashboard.view',
      'social.view', 'social.create', 'social.edit', 'social.schedule',
      'content.view', 'content.create', 'content.edit', 'content.generate',
      'ai.use', 'ai.generate',
    ],
  },
  {
    name: 'Designer',
    description: 'Creative asset management and design work for campaigns and content.',
    priority: 250,
    permissions: [
      'dashboard.view',
      'ads.view', 'ads.edit',
      'social.view', 'social.create', 'social.edit',
      'content.view', 'content.create', 'content.edit', 'content.generate',
      'ai.use', 'ai.generate',
    ],
  },
  {
    name: 'Social Media Manager',
    description: 'Social media content planning, publishing, and engagement management.',
    priority: 200,
    permissions: [
      'dashboard.view',
      'social.view', 'social.create', 'social.edit', 'social.publish', 'social.schedule',
      'content.view', 'content.create', 'content.edit', 'content.generate',
      'brand.view',
      'ai.use', 'ai.generate',
    ],
  },
  {
    name: 'Viewer',
    description: 'Read-only access to dashboards, analytics, and reports.',
    priority: 100,
    permissions: [
      'dashboard.view',
      'analytics.view',
      'ads.view',
      'social.view',
      'brand.view',
      'reports.view',
    ],
  },
];

// ============================================================================
// Role Factory
// ============================================================================

export function createSystemRoles(): Role[] {
  const now = new Date().toISOString();
  return SYSTEM_ROLES.map((roleDef) => ({
    id: generateId(16),
    name: roleDef.name,
    slug: slugify(roleDef.name),
    description: roleDef.description,
    isSystem: true,
    isCustom: false,
    priority: roleDef.priority,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  }));
}

export function createCustomRole(
  name: string,
  description?: string,
  priority?: number
): Role {
  const now = new Date().toISOString();
  return {
    id: generateId(16),
    name,
    slug: slugify(name),
    description,
    isSystem: false,
    isCustom: true,
    priority: priority || 50,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  };
}

// ============================================================================
// Role Permission Mapper
// ============================================================================

export function getSystemRolePermissions(roleName: string): string[] {
  const role = SYSTEM_ROLES.find(r => r.name === roleName);
  return role?.permissions || [];
}

export function hasWildcardPermission(roleName: string): boolean {
  const role = SYSTEM_ROLES.find(r => r.name === roleName);
  return role?.permissions.includes('*') || false;
}