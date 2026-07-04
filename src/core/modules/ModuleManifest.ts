/**
 * Calixo Platform - Enterprise Module SDK
 * ModuleManifest - Every module must export one to register with the platform.
 */

import type { LucideIcon } from "lucide-react";
import type {
  ModuleCategory,
  SubscriptionTier,
  ModulePermissionDefinition,
  ModuleNavSection,
  ModuleReportDefinition,
  ModuleNotificationTemplate,
  ModuleAIConfig,
  ModuleBackgroundJob,
  ModuleWidget,
  ModuleIntegration,
  ModuleFeatureFlag,
  ModuleAuditAction,
  ModuleSettingsSection,
  ModuleEvent,
  ModuleHook,
} from "./ModuleTypes";

export interface ModuleManifest {
  // =========================================================================
  // Identity
  // =========================================================================
  id: string;
  name: string;
  version: string;
  description: string;
  category: ModuleCategory;
  icon: LucideIcon;

  // =========================================================================
  // Routing
  // =========================================================================
  route: string; // e.g. "/dashboard/analytics"
  layout?: string; // optional layout override

  // =========================================================================
  // Navigation
  // =========================================================================
  navigation: ModuleNavSection[];

  // =========================================================================
  // Permissions
  // =========================================================================
  permissions: ModulePermissionDefinition[];

  // =========================================================================
  // Reports
  // =========================================================================
  reports?: ModuleReportDefinition[];

  // =========================================================================
  // Notifications
  // =========================================================================
  notifications?: ModuleNotificationTemplate[];

  // =========================================================================
  // AI
  // =========================================================================
  ai?: ModuleAIConfig;

  // =========================================================================
  // Settings
  // =========================================================================
  settings?: ModuleSettingsSection[];

  // =========================================================================
  // Background Jobs
  // =========================================================================
  backgroundJobs?: ModuleBackgroundJob[];

  // =========================================================================
  // Audit Logs
  // =========================================================================
  auditLogs?: ModuleAuditAction[];

  // =========================================================================
  // Widgets
  // =========================================================================
  widgets?: ModuleWidget[];

  // =========================================================================
  // Integrations
  // =========================================================================
  integrations?: ModuleIntegration[];

  // =========================================================================
  // Feature Flags
  // =========================================================================
  featureFlags?: ModuleFeatureFlag[];

  // =========================================================================
  // Subscription Tier
  // =========================================================================
  subscriptionTier: SubscriptionTier;

  // =========================================================================
  // Events (emitted by this module)
  // =========================================================================
  events?: ModuleEvent[];

  // =========================================================================
  // Lifecycle Hooks
  // =========================================================================
  hooks?: Partial<Record<ModuleHook, () => void | Promise<void>>>;

  // =========================================================================
  // Metadata
  // =========================================================================
  metadata?: Record<string, unknown>;

  // =========================================================================
  // Activation
  // =========================================================================
  enabled: boolean;
}

/**
 * Helper: Create a strongly-typed ModuleManifest with defaults.
 */
export function defineModule(manifest: ModuleManifest): ModuleManifest {
  return manifest;
}
