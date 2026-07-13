/**
 * Calixo Platform - Feature Flags Framework
 * 
 * Reusable framework for module-level and feature-level flagging.
 * Supports module enable/disable, experimental features,
 * subscription features, and beta features.
 */

import { FEATURE_FLAGS } from '@/config';

// ============================================================================
// Types
// ============================================================================

export type FeatureFlagId = string;

export interface FeatureFlagDefinition {
  id: FeatureFlagId;
  label: string;
  description: string;
  defaultEnabled: boolean;
  category: FlagCategory;
  dependencies?: FeatureFlagId[];
  tier?: FlagTier;
  /**
   * Percentage-rollout for "experimental" flags (0-100), set by the Internal
   * Plan Management Console's Experiments section. `undefined` leaves
   * evaluation exactly as before this field existed — only
   * `FeatureFlagEngine.evaluate()` (the real, context-aware evaluator) reads it.
   */
  rolloutPercent?: number;
}

export type FlagCategory = 
  | 'module' 
  | 'feature' 
  | 'experimental' 
  | 'beta' 
  | 'subscription';

export type FlagTier = 'free' | 'starter' | 'professional' | 'enterprise';

export interface FeatureFlagState {
  enabled: boolean;
  locked: boolean;
  reason?: string;
}

export type FlagOverrides = Record<FeatureFlagId, boolean>;

export type FlagChangeListener = (flagId: FeatureFlagId, enabled: boolean) => void;

// ============================================================================
// Async Storage Interface (for override persistence)
// ============================================================================

export interface FlagStorage {
  getOverrides(): Promise<FlagOverrides> | FlagOverrides;
  setOverride(flagId: FeatureFlagId, enabled: boolean): void | Promise<void>;
  removeOverride(flagId: FeatureFlagId): void | Promise<void>;
  clearOverrides(): void | Promise<void>;
}

// ============================================================================
// Flag Registry
// ============================================================================

export const FLAG_REGISTRY: FeatureFlagDefinition[] = [
  // Module Flags
  {
    id: FEATURE_FLAGS.DASHBOARD.id,
    label: 'Dashboard',
    description: 'Main dashboard with KPIs and overview',
    defaultEnabled: FEATURE_FLAGS.DASHBOARD.defaultEnabled,
    category: 'module',
  },
  {
    id: FEATURE_FLAGS.ANALYTICS.id,
    label: 'Analytics',
    description: 'Deep-dive analytics with multi-dimensional data',
    defaultEnabled: FEATURE_FLAGS.ANALYTICS.defaultEnabled,
    category: 'module',
  },
  {
    id: FEATURE_FLAGS.ADS_MANAGER.id,
    label: 'Ads Manager',
    description: 'Multi-channel ad campaign management',
    defaultEnabled: FEATURE_FLAGS.ADS_MANAGER.defaultEnabled,
    category: 'module',
    tier: 'starter',
  },
  {
    id: FEATURE_FLAGS.SOCIAL_MEDIA.id,
    label: 'Social Media',
    description: 'Social media content planning and publishing',
    defaultEnabled: FEATURE_FLAGS.SOCIAL_MEDIA.defaultEnabled,
    category: 'module',
    tier: 'starter',
  },
  {
    id: FEATURE_FLAGS.BRAND_MONITORING.id,
    label: 'Brand Monitoring',
    description: 'Track brand mentions across web and social',
    defaultEnabled: FEATURE_FLAGS.BRAND_MONITORING.defaultEnabled,
    category: 'module',
    tier: 'professional',
  },
  {
    id: FEATURE_FLAGS.CONTENT_STUDIO.id,
    label: 'Content Studio',
    description: 'AI-assisted content creation',
    defaultEnabled: FEATURE_FLAGS.CONTENT_STUDIO.defaultEnabled,
    category: 'module',
    tier: 'professional',
  },
  {
    id: FEATURE_FLAGS.AI_COPILOT.id,
    label: 'AI Copilot',
    description: 'Persistent AI assistant across the platform',
    defaultEnabled: FEATURE_FLAGS.AI_COPILOT.defaultEnabled,
    category: 'module',
    tier: 'starter',
  },
  {
    id: FEATURE_FLAGS.REPORTS.id,
    label: 'Reports',
    description: 'Custom report generation and scheduling',
    defaultEnabled: FEATURE_FLAGS.REPORTS.defaultEnabled,
    category: 'module',
  },
  {
    id: FEATURE_FLAGS.ADMINISTRATION.id,
    label: 'Administration',
    description: 'Admin settings, users, roles, and billing',
    defaultEnabled: FEATURE_FLAGS.ADMINISTRATION.defaultEnabled,
    category: 'module',
  },
];

// ============================================================================
// Feature Flag Manager
// ============================================================================

export class FeatureFlagManager {
  private overrides: FlagOverrides = {};
  private listeners: Map<FeatureFlagId, Set<FlagChangeListener>> = new Map();
  private storage?: FlagStorage;
  private initialized = false;

  async initialize(storage?: FlagStorage): Promise<void> {
    if (this.initialized) return;
    this.storage = storage;
    if (storage) {
      this.overrides = await Promise.resolve(storage.getOverrides());
    }
    this.initialized = true;
  }

  isEnabled(flagId: FeatureFlagId): boolean {
    const definition = FLAG_REGISTRY.find(f => f.id === flagId);
    if (!definition) return false;

    // Check override first
    if (flagId in this.overrides) {
      return this.overrides[flagId];
    }

    return definition.defaultEnabled;
  }

  getState(flagId: FeatureFlagId): FeatureFlagState {
    const definition = FLAG_REGISTRY.find(f => f.id === flagId);
    if (!definition) {
      return { enabled: false, locked: true, reason: 'Unknown feature flag' };
    }

    const enabled = this.isEnabled(flagId);
    
    // Check dependencies
    if (definition.dependencies) {
      const missing = definition.dependencies.filter(depId => !this.isEnabled(depId));
      if (missing.length > 0) {
        return {
          enabled: false,
          locked: true,
          reason: `Requires: ${missing.join(', ')}`,
        };
      }
    }

    return { enabled, locked: flagId in this.overrides };
  }

  async setOverride(flagId: FeatureFlagId, enabled: boolean): Promise<void> {
    this.overrides[flagId] = enabled;
    if (this.storage) {
      await Promise.resolve(this.storage.setOverride(flagId, enabled));
    }
    this.notifyListeners(flagId, enabled);
  }

  async removeOverride(flagId: FeatureFlagId): Promise<void> {
    delete this.overrides[flagId];
    if (this.storage) {
      await Promise.resolve(this.storage.removeOverride(flagId));
    }
    const enabled = this.isEnabled(flagId);
    this.notifyListeners(flagId, enabled);
  }

  async clearOverrides(): Promise<void> {
    this.overrides = {};
    if (this.storage) {
      await Promise.resolve(this.storage.clearOverrides());
    }
  }

  getAllFlags(): FeatureFlagState[] {
    return FLAG_REGISTRY.map(flag => ({
      id: flag.id,
      label: flag.label,
      description: flag.description,
      category: flag.category,
      tier: flag.tier,
      ...this.getState(flag.id),
    }));
  }

  subscribe(flagId: FeatureFlagId, listener: FlagChangeListener): () => void {
    if (!this.listeners.has(flagId)) {
      this.listeners.set(flagId, new Set());
    }
    this.listeners.get(flagId)!.add(listener);
    return () => {
      this.listeners.get(flagId)?.delete(listener);
    };
  }

  private notifyListeners(flagId: FeatureFlagId, enabled: boolean): void {
    this.listeners.get(flagId)?.forEach(listener => {
      try {
        listener(flagId, enabled);
      } catch {
        // Prevent listener errors from breaking the system
      }
    });
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const featureFlags = new FeatureFlagManager();

// ============================================================================
// React Hook (for client components)
// ============================================================================

export function useFeatureFlag(flagId: FeatureFlagId): { enabled: boolean; isLoading: boolean } {
  // This is a placeholder - actual implementation requires React context
  return {
    enabled: featureFlags.isEnabled(flagId),
    isLoading: false,
  };
}

// ============================================================================
// Utility function to check if a feature is available for a subscription tier
// ============================================================================

export function isFeatureAvailableForTier(flagId: FeatureFlagId, tier: string): boolean {
  const definition = FLAG_REGISTRY.find(f => f.id === flagId);
  if (!definition) return false;
  if (!definition.tier) return true; // Available for all tiers

  const tiers = ['free', 'starter', 'professional', 'enterprise'];
  const flagTierIndex = tiers.indexOf(definition.tier);
  const userTierIndex = tiers.indexOf(tier);

  return userTierIndex >= flagTierIndex;
}