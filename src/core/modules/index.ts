/**
 * Calixo Platform - Enterprise Module SDK
 * Barrel export for the module plugin system.
 */

// Core types
export type {
  ModuleCategory,
  SubscriptionTier,
  ModulePermissionDefinition,
  ModuleNavItem,
  ModuleNavSection,
  ModuleRoute,
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

// Manifest
export type { ModuleManifest } from "./ModuleManifest";
export { defineModule } from "./ModuleManifest";

// Registry (singleton)
export { ModuleRegistry } from "./ModuleRegistry";

// Loader
export { ModuleLoader } from "./ModuleLoader";

// Navigation
export { ModuleNavigation } from "./ModuleNavigation";

// Permissions
export { ModulePermissions } from "./ModulePermissions";

// Services
export { ModuleServices } from "./ModuleServices";