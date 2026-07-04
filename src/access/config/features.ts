/**
 * Calixo Platform - Feature Access Configuration
 *
 * Every module exposes its required permissions, feature flags,
 * subscription tiers, and visibility rules.
 */

import type { FeatureAccess } from '@/access/types';

// ============================================================================
// Feature Access Registry
// ============================================================================

export const FEATURE_ACCESS_REGISTRY: Record<string, FeatureAccess> = {
  // ============================================================================
  // Dashboard
  // ============================================================================
  'module.dashboard': {
    featureKey: 'module.dashboard',
    requiredPermission: 'dashboard.view',
    requiredFeatureFlag: 'module.dashboard',
  },
  'dashboard.export': {
    featureKey: 'dashboard.export',
    requiredPermission: 'dashboard.export',
    requiredFeatureFlag: 'module.dashboard',
  },

  // ============================================================================
  // Analytics
  // ============================================================================
  'module.analytics': {
    featureKey: 'module.analytics',
    requiredPermission: 'analytics.view',
    requiredFeatureFlag: 'module.analytics',
  },
  'analytics.export': {
    featureKey: 'analytics.export',
    requiredPermission: 'analytics.export',
    requiredFeatureFlag: 'module.analytics',
  },
  'analytics.manage': {
    featureKey: 'analytics.manage',
    requiredPermission: 'analytics.manage',
    requiredFeatureFlag: 'module.analytics',
  },

  // ============================================================================
  // Ads Manager
  // ============================================================================
  'module.ads-manager': {
    featureKey: 'module.ads-manager',
    requiredPermission: 'ads.view',
    requiredFeatureFlag: 'module.ads-manager',
    requiredSubscriptionTier: 'starter',
  },
  'ads.create': {
    featureKey: 'ads.create',
    requiredPermission: 'ads.create',
    requiredFeatureFlag: 'module.ads-manager',
    requiredSubscriptionTier: 'starter',
  },
  'ads.publish': {
    featureKey: 'ads.publish',
    requiredPermission: 'ads.publish',
    requiredFeatureFlag: 'module.ads-manager',
    requiredSubscriptionTier: 'starter',
  },
  'ads.approve': {
    featureKey: 'ads.approve',
    requiredPermission: 'ads.approve',
    requiredFeatureFlag: 'module.ads-manager',
    requiredSubscriptionTier: 'professional',
  },

  // ============================================================================
  // Social Media
  // ============================================================================
  'module.social-media': {
    featureKey: 'module.social-media',
    requiredPermission: 'social.view',
    requiredFeatureFlag: 'module.social-media',
    requiredSubscriptionTier: 'starter',
  },
  'social.publish': {
    featureKey: 'social.publish',
    requiredPermission: 'social.publish',
    requiredFeatureFlag: 'module.social-media',
    requiredSubscriptionTier: 'starter',
  },
  'social.schedule': {
    featureKey: 'social.schedule',
    requiredPermission: 'social.schedule',
    requiredFeatureFlag: 'module.social-media',
    requiredSubscriptionTier: 'starter',
  },
  'social.approve': {
    featureKey: 'social.approve',
    requiredPermission: 'social.approve',
    requiredFeatureFlag: 'module.social-media',
    requiredSubscriptionTier: 'professional',
  },

  // ============================================================================
  // Brand Monitoring
  // ============================================================================
  'module.brand-monitoring': {
    featureKey: 'module.brand-monitoring',
    requiredPermission: 'brand.view',
    requiredFeatureFlag: 'module.brand-monitoring',
    requiredSubscriptionTier: 'professional',
  },

  // ============================================================================
  // Content Studio
  // ============================================================================
  'module.content-studio': {
    featureKey: 'module.content-studio',
    requiredPermission: 'content.view',
    requiredFeatureFlag: 'module.content-studio',
    requiredSubscriptionTier: 'professional',
  },
  'content.generate': {
    featureKey: 'content.generate',
    requiredPermission: 'content.generate',
    requiredFeatureFlag: 'module.content-studio',
    requiredSubscriptionTier: 'professional',
  },

  // ============================================================================
  // AI Copilot
  // ============================================================================
  'module.ai-copilot': {
    featureKey: 'module.ai-copilot',
    requiredPermission: 'ai.use',
    requiredFeatureFlag: 'module.ai-copilot',
    requiredSubscriptionTier: 'starter',
  },
  'ai.generate': {
    featureKey: 'ai.generate',
    requiredPermission: 'ai.generate',
    requiredFeatureFlag: 'module.ai-copilot',
    requiredSubscriptionTier: 'starter',
  },
  'ai.train': {
    featureKey: 'ai.train',
    requiredPermission: 'ai.train',
    requiredFeatureFlag: 'module.ai-copilot',
    requiredSubscriptionTier: 'enterprise',
  },

  // ============================================================================
  // Reports
  // ============================================================================
  'module.reports': {
    featureKey: 'module.reports',
    requiredPermission: 'reports.view',
    requiredFeatureFlag: 'module.reports',
  },
  'reports.schedule': {
    featureKey: 'reports.schedule',
    requiredPermission: 'reports.schedule',
    requiredFeatureFlag: 'module.reports',
    requiredSubscriptionTier: 'professional',
  },

  // ============================================================================
  // Administration
  // ============================================================================
  'module.administration': {
    featureKey: 'module.administration',
    requiredPermission: 'settings.view',
    requiredFeatureFlag: 'module.administration',
  },
  'admin.users': {
    featureKey: 'admin.users',
    requiredPermission: 'users.manage',
    requiredFeatureFlag: 'module.administration',
  },
  'admin.roles': {
    featureKey: 'admin.roles',
    requiredPermission: 'roles.manage',
    requiredFeatureFlag: 'module.administration',
  },
  'admin.billing': {
    featureKey: 'admin.billing',
    requiredPermission: 'billing.manage',
    requiredFeatureFlag: 'module.administration',
  },
  'admin.audit': {
    featureKey: 'admin.audit',
    requiredPermission: 'audit.view',
    requiredFeatureFlag: 'module.administration',
  },
  'admin.integrations': {
    featureKey: 'admin.integrations',
    requiredPermission: 'integrations.manage',
    requiredFeatureFlag: 'module.administration',
  },
  'admin.policies': {
    featureKey: 'admin.policies',
    requiredPermission: 'policies.manage',
    requiredFeatureFlag: 'module.administration',
  },
};

// ============================================================================
// Feature Access Checker
// ============================================================================

export class FeatureAccessChecker {
  getFeatureAccess(featureKey: string): FeatureAccess | undefined {
    return FEATURE_ACCESS_REGISTRY[featureKey];
  }

  getRequiredPermission(featureKey: string): string | undefined {
    return FEATURE_ACCESS_REGISTRY[featureKey]?.requiredPermission;
  }

  getRequiredFeatureFlag(featureKey: string): string | undefined {
    return FEATURE_ACCESS_REGISTRY[featureKey]?.requiredFeatureFlag;
  }

  getRequiredSubscriptionTier(featureKey: string): string | undefined {
    return FEATURE_ACCESS_REGISTRY[featureKey]?.requiredSubscriptionTier;
  }

  hasFeatureAccess(featureKey: string): boolean {
    return featureKey in FEATURE_ACCESS_REGISTRY;
  }

  getAllFeatureKeys(): string[] {
    return Object.keys(FEATURE_ACCESS_REGISTRY);
  }

  getFeaturesBySubscriptionTier(tier: string): string[] {
    return Object.entries(FEATURE_ACCESS_REGISTRY)
      .filter(([, access]) => access.requiredSubscriptionTier === tier)
      .map(([key]) => key);
  }
}

export const featureAccessChecker = new FeatureAccessChecker();