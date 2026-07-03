/**
 * Calixo Platform - Application Registry
 * 
 * Central registry that automatically loads all modules.
 * No hardcoded navigation, permissions, or module metadata.
 * Modules register themselves and the registry aggregates everything.
 */

import {
  LayoutDashboard,
  BarChart3,
  Megaphone,
  Share2,
  ShieldCheck,
  PenSquare,
  Bot,
  FileText,
  Settings,
  UserCog,
  UserPlus,
  Building2,
  Link2,
  CreditCard,
  ScrollText,
  Webhook,
} from 'lucide-react';

import type { ModuleDefinition, ModuleRegistry } from '@/modules/types';
import { FEATURE_FLAGS, PERMISSIONS, ROUTES } from '@/config';
import { appLogger } from '@/logging';

// ============================================================================
// In-Memory Module Registry Implementation
// ============================================================================

class ApplicationModuleRegistry implements ModuleRegistry {
  private modules: Map<string, ModuleDefinition> = new Map();

  register(module: ModuleDefinition): void {
    if (this.modules.has(module.id)) {
      appLogger.warn('Registry', `Module ${module.id} is already registered. Skipping.`);
      return;
    }
    this.modules.set(module.id, module);
    appLogger.info('Registry', `Module registered: ${module.name} (${module.id})`);
  }

  unregister(moduleId: string): void {
    this.modules.delete(moduleId);
    appLogger.info('Registry', `Module unregistered: ${moduleId}`);
  }

  get(moduleId: string): ModuleDefinition | undefined {
    return this.modules.get(moduleId);
  }

  getAll(): ModuleDefinition[] {
    return Array.from(this.modules.values()).sort((a, b) => a.order - b.order);
  }

  getNavigation() {
    return this.getAll().flatMap(m => m.navigation);
  }

  getRoutes() {
    return this.getAll().flatMap(m => m.routes);
  }

  has(moduleId: string): boolean {
    return this.modules.has(moduleId);
  }
}

// ============================================================================
// Module Definitions
// ============================================================================

const DASHBOARD_MODULE: ModuleDefinition = {
  id: 'dashboard',
  name: 'Dashboard',
  description: 'Executive command center for at-a-glance insights',
  version: '1.0.0',
  icon: LayoutDashboard,
  order: 0,
  category: 'main',
  status: 'active',
  featureFlag: FEATURE_FLAGS.DASHBOARD.id,
  permissions: [
    PERMISSIONS.DASHBOARD.VIEW,
    PERMISSIONS.DASHBOARD.EXPORT,
  ],
  navigation: [
    {
      title: 'Dashboard',
      href: ROUTES.DASHBOARD.HOME,
      icon: LayoutDashboard,
      permission: PERMISSIONS.DASHBOARD.VIEW,
      featureFlag: FEATURE_FLAGS.DASHBOARD.id,
    },
  ],
  routes: [
    { path: ROUTES.DASHBOARD.HOME, permission: PERMISSIONS.DASHBOARD.VIEW },
  ],
};

const ANALYTICS_MODULE: ModuleDefinition = {
  id: 'analytics',
  name: 'Analytics',
  description: 'Deep-dive analytics with multi-dimensional data exploration',
  version: '1.0.0',
  icon: BarChart3,
  order: 10,
  category: 'main',
  status: 'active',
  featureFlag: FEATURE_FLAGS.ANALYTICS.id,
  permissions: [
    PERMISSIONS.ANALYTICS.VIEW,
    PERMISSIONS.ANALYTICS.EXPORT,
    PERMISSIONS.ANALYTICS.MANAGE,
  ],
  navigation: [
    {
      title: 'Analytics',
      href: ROUTES.DASHBOARD.ANALYTICS,
      icon: BarChart3,
      permission: PERMISSIONS.ANALYTICS.VIEW,
      featureFlag: FEATURE_FLAGS.ANALYTICS.id,
    },
  ],
  routes: [
    { path: ROUTES.DASHBOARD.ANALYTICS, permission: PERMISSIONS.ANALYTICS.VIEW },
  ],
};

const ADS_MANAGER_MODULE: ModuleDefinition = {
  id: 'ads-manager',
  name: 'Ads Manager',
  description: 'Multi-channel ad campaign management',
  version: '1.0.0',
  icon: Megaphone,
  order: 20,
  category: 'main',
  status: 'active',
  featureFlag: FEATURE_FLAGS.ADS_MANAGER.id,
  permissions: [
    PERMISSIONS.CAMPAIGNS.VIEW,
    PERMISSIONS.CAMPAIGNS.CREATE,
    PERMISSIONS.CAMPAIGNS.EDIT,
    PERMISSIONS.CAMPAIGNS.DELETE,
    PERMISSIONS.CAMPAIGNS.APPROVE,
  ],
  navigation: [
    {
      title: 'Ads Manager',
      href: ROUTES.DASHBOARD.ADS,
      icon: Megaphone,
      permission: PERMISSIONS.CAMPAIGNS.VIEW,
      featureFlag: FEATURE_FLAGS.ADS_MANAGER.id,
    },
  ],
  routes: [
    { path: ROUTES.DASHBOARD.ADS, permission: PERMISSIONS.CAMPAIGNS.VIEW },
  ],
};

const SOCIAL_MEDIA_MODULE: ModuleDefinition = {
  id: 'social-media',
  name: 'Social Media',
  description: 'Social media content planning, publishing, and analytics',
  version: '1.0.0',
  icon: Share2,
  order: 30,
  category: 'main',
  status: 'active',
  featureFlag: FEATURE_FLAGS.SOCIAL_MEDIA.id,
  permissions: [
    PERMISSIONS.SOCIAL.VIEW,
    PERMISSIONS.SOCIAL.CREATE,
    PERMISSIONS.SOCIAL.PUBLISH,
    PERMISSIONS.SOCIAL.MANAGE,
  ],
  navigation: [
    {
      title: 'Social Media',
      href: ROUTES.DASHBOARD.SOCIAL,
      icon: Share2,
      permission: PERMISSIONS.SOCIAL.VIEW,
      featureFlag: FEATURE_FLAGS.SOCIAL_MEDIA.id,
    },
  ],
  routes: [
    { path: ROUTES.DASHBOARD.SOCIAL, permission: PERMISSIONS.SOCIAL.VIEW },
  ],
};

const BRAND_MONITORING_MODULE: ModuleDefinition = {
  id: 'brand-monitoring',
  name: 'Brand Monitoring',
  description: 'Track brand mentions across web and social',
  version: '1.0.0',
  icon: ShieldCheck,
  order: 40,
  category: 'main',
  status: 'active',
  featureFlag: FEATURE_FLAGS.BRAND_MONITORING.id,
  permissions: [],
  navigation: [
    {
      title: 'Brand Monitoring',
      href: ROUTES.DASHBOARD.BRAND,
      icon: ShieldCheck,
      featureFlag: FEATURE_FLAGS.BRAND_MONITORING.id,
    },
  ],
  routes: [
    { path: ROUTES.DASHBOARD.BRAND },
  ],
};

const CONTENT_STUDIO_MODULE: ModuleDefinition = {
  id: 'content-studio',
  name: 'Content Studio',
  description: 'AI-assisted content creation',
  version: '1.0.0',
  icon: PenSquare,
  order: 50,
  category: 'main',
  status: 'active',
  featureFlag: FEATURE_FLAGS.CONTENT_STUDIO.id,
  permissions: [],
  navigation: [
    {
      title: 'Content Studio',
      href: ROUTES.DASHBOARD.CONTENT,
      icon: PenSquare,
      featureFlag: FEATURE_FLAGS.CONTENT_STUDIO.id,
    },
  ],
  routes: [
    { path: ROUTES.DASHBOARD.CONTENT },
  ],
};

const AI_COPILOT_MODULE: ModuleDefinition = {
  id: 'ai-copilot',
  name: 'AI Copilot',
  description: 'Persistent AI assistant accessible throughout the platform',
  version: '1.0.0',
  icon: Bot,
  order: 60,
  category: 'ai',
  status: 'beta',
  featureFlag: FEATURE_FLAGS.AI_COPILOT.id,
  permissions: [
    PERMISSIONS.AI.USE,
    PERMISSIONS.AI.MANAGE,
  ],
  navigation: [
    {
      title: 'AI Copilot',
      href: ROUTES.DASHBOARD.AI,
      icon: Bot,
      badge: 'New',
      permission: PERMISSIONS.AI.USE,
      featureFlag: FEATURE_FLAGS.AI_COPILOT.id,
    },
  ],
  routes: [
    { path: ROUTES.DASHBOARD.AI, permission: PERMISSIONS.AI.USE },
  ],
};

const REPORTS_MODULE: ModuleDefinition = {
  id: 'reports',
  name: 'Reports',
  description: 'Custom report generation and scheduling',
  version: '1.0.0',
  icon: FileText,
  order: 70,
  category: 'main',
  status: 'active',
  featureFlag: FEATURE_FLAGS.REPORTS.id,
  permissions: [
    PERMISSIONS.REPORTS.VIEW,
    PERMISSIONS.REPORTS.CREATE,
    PERMISSIONS.REPORTS.EXPORT,
  ],
  navigation: [
    {
      title: 'Reports',
      href: ROUTES.DASHBOARD.REPORTS,
      icon: FileText,
      permission: PERMISSIONS.REPORTS.VIEW,
      featureFlag: FEATURE_FLAGS.REPORTS.id,
    },
  ],
  routes: [
    { path: ROUTES.DASHBOARD.REPORTS, permission: PERMISSIONS.REPORTS.VIEW },
  ],
};

const ADMINISTRATION_MODULE: ModuleDefinition = {
  id: 'administration',
  name: 'Administration',
  description: 'Admin settings, users, roles, and billing',
  version: '1.0.0',
  icon: Settings,
  order: 80,
  category: 'administration',
  status: 'active',
  featureFlag: FEATURE_FLAGS.ADMINISTRATION.id,
  permissions: [
    PERMISSIONS.ADMIN.MANAGE_USERS,
    PERMISSIONS.ADMIN.MANAGE_ROLES,
    PERMISSIONS.ADMIN.MANAGE_BILLING,
    PERMISSIONS.ADMIN.MANAGE_SETTINGS,
    PERMISSIONS.ADMIN.VIEW_AUDIT,
  ],
  navigation: [
    {
      title: 'Settings',
      href: ROUTES.ADMIN.SETTINGS,
      icon: Settings,
      permission: PERMISSIONS.ADMIN.MANAGE_SETTINGS,
    },
    {
      title: 'Users & Teams',
      href: ROUTES.ADMIN.USERS,
      icon: UserCog,
      permission: PERMISSIONS.ADMIN.MANAGE_USERS,
    },
    {
      title: 'Roles & Permissions',
      href: ROUTES.ADMIN.ROLES,
      icon: UserPlus,
      permission: PERMISSIONS.ADMIN.MANAGE_ROLES,
    },
    {
      title: 'Workspaces',
      href: ROUTES.ADMIN.WORKSPACES,
      icon: Building2,
    },
    {
      title: 'Integrations',
      href: ROUTES.ADMIN.INTEGRATIONS,
      icon: Link2,
    },
    {
      title: 'Billing & Plans',
      href: ROUTES.ADMIN.BILLING,
      icon: CreditCard,
      permission: PERMISSIONS.ADMIN.MANAGE_BILLING,
    },
    {
      title: 'Audit Logs',
      href: ROUTES.ADMIN.AUDIT,
      icon: ScrollText,
      permission: PERMISSIONS.ADMIN.VIEW_AUDIT,
    },
    {
      title: 'API & Webhooks',
      href: ROUTES.ADMIN.API,
      icon: Webhook,
    },
  ],
  routes: [
    { path: ROUTES.ADMIN.SETTINGS },
    { path: ROUTES.ADMIN.USERS },
    { path: ROUTES.ADMIN.ROLES },
    { path: ROUTES.ADMIN.WORKSPACES },
    { path: ROUTES.ADMIN.INTEGRATIONS },
    { path: ROUTES.ADMIN.BILLING },
    { path: ROUTES.ADMIN.AUDIT },
    { path: ROUTES.ADMIN.API },
  ],
};

// ============================================================================
// Registry Initialization
// ============================================================================

const ALL_MODULES: ModuleDefinition[] = [
  DASHBOARD_MODULE,
  ANALYTICS_MODULE,
  ADS_MANAGER_MODULE,
  SOCIAL_MEDIA_MODULE,
  BRAND_MONITORING_MODULE,
  CONTENT_STUDIO_MODULE,
  AI_COPILOT_MODULE,
  REPORTS_MODULE,
  ADMINISTRATION_MODULE,
];

export const moduleRegistry = new ApplicationModuleRegistry();

export function initializeRegistry(): void {
  appLogger.info('Registry', `Initializing ${ALL_MODULES.length} modules...`);
  ALL_MODULES.forEach(module => moduleRegistry.register(module));
  appLogger.info('Registry', `Registry initialized with ${moduleRegistry.getAll().length} modules`);
}

export function getMainModules(): ModuleDefinition[] {
  return moduleRegistry.getAll().filter(m => m.category === 'main');
}

export function getAIModules(): ModuleDefinition[] {
  return moduleRegistry.getAll().filter(m => m.category === 'ai');
}

export function getAdminModules(): ModuleDefinition[] {
  return moduleRegistry.getAll().filter(m => m.category === 'administration');
}

export function getModuleNavigation(): ReturnType<ModuleRegistry['getNavigation']> {
  return moduleRegistry.getNavigation();
}

export default moduleRegistry;