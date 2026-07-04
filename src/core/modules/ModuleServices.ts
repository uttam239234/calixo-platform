/**
 * Calixo Platform - Enterprise Module SDK
 * ModuleServices - Provides cross-cutting service access for modules.
 */

import { ModuleRegistry } from "./ModuleRegistry";
import type {
  ModuleReportDefinition,
  ModuleNotificationTemplate,
  ModuleBackgroundJob,
  ModuleAuditAction,
  ModuleFeatureFlag,
  ModuleWidget,
  ModuleIntegration,
  ModuleSettingsSection,
  ModuleEvent,
} from "./ModuleTypes";

export const ModuleServices = {
  // Reports
  getReports(): ModuleReportDefinition[] {
    return ModuleRegistry.getAllReports();
  },

  // Notifications
  getNotificationTemplates(): ModuleNotificationTemplate[] {
    return ModuleRegistry.getAllNotificationTemplates();
  },

  // Background Jobs
  getBackgroundJobs(): ModuleBackgroundJob[] {
    return ModuleRegistry.getAllBackgroundJobs();
  },

  // Audit
  getAuditActions(): ModuleAuditAction[] {
    return ModuleRegistry.getAllAuditActions();
  },

  // Feature Flags
  getFeatureFlags(): ModuleFeatureFlag[] {
    return ModuleRegistry.getAllFeatureFlags();
  },

  // Widgets
  getWidgets(): ModuleWidget[] {
    return ModuleRegistry.getAllWidgets();
  },

  // Integrations
  getIntegrations(): ModuleIntegration[] {
    return ModuleRegistry.getAllIntegrations();
  },

  // Settings
  getSettingsSections(): ModuleSettingsSection[] {
    return ModuleRegistry.getAllSettings();
  },

  // Events
  getEvents(): ModuleEvent[] {
    return ModuleRegistry.getAllEvents();
  },

  // Metadata
  getMetadata(): Record<string, Record<string, unknown>> {
    return ModuleRegistry.getAllMetadata();
  },

  // Permissions
  getPermissionNames(): string[] {
    return ModuleRegistry.getAllPermissions().map((p) => p.name);
  },

  // Routes
  getRoutes(): string[] {
    return ModuleRegistry.getEnabled().map((m) => m.route);
  },
};