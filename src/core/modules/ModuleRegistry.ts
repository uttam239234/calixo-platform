/**
 * Calixo Platform - Enterprise Module SDK
 * ModuleRegistry - Central registry for all platform modules.
 *
 * This replaces hardcoded navigation, permissions, and configuration.
 * Every module registers itself here via its ModuleManifest.
 */

import type { ModuleManifest } from "./ModuleManifest";
import type {
  ModulePermissionDefinition,
  ModuleNavItem,
  ModuleNavSection,
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

// ============================================================================
// Internal Store
// ============================================================================

const modules = new Map<string, ModuleManifest>();
let initializationComplete = false;

// ============================================================================
// Public API
// ============================================================================

export const ModuleRegistry = {
  /**
   * Register a module manifest.
   * Throws if a module with the same ID already exists.
   */
  register(manifest: ModuleManifest): void {
    if (modules.has(manifest.id)) {
      throw new Error(
        `Module "${manifest.id}" is already registered.`
      );
    }
    modules.set(manifest.id, { ...manifest });
  },

  /**
   * Register multiple modules at once.
   */
  registerAll(manifests: ModuleManifest[]): void {
    for (const m of manifests) {
      this.register(m);
    }
  },

  /**
   * Unregister a module by ID.
   */
  unregister(id: string): boolean {
    return modules.delete(id);
  },

  /**
   * Get a single module manifest by ID.
   */
  get(id: string): ModuleManifest | undefined {
    return modules.get(id);
  },

  /**
   * Get the total count of registered modules.
   */
  getModuleCount(): number {
    return modules.size;
  },

  /**
   * Get all registered modules.
   */
  getAll(): ModuleManifest[] {
    return Array.from(modules.values());
  },

  /**
   * Get enabled modules only.
   */
  getEnabled(): ModuleManifest[] {
    return this.getAll().filter((m) => m.enabled);
  },

  /**
   * Get modules by category.
   */
  getByCategory(category: ModuleManifest["category"]): ModuleManifest[] {
    return this.getAll().filter((m) => m.category === category);
  },

  /**
   * Check if a module exists.
   */
  has(id: string): boolean {
    return modules.has(id);
  },

  /**
   * Mark initialization complete.
   * After this, no more registrations are allowed.
   */
  markInitialized(): void {
    initializationComplete = true;
  },

  /**
   * Check if registry is initialized.
   */
  isInitialized(): boolean {
    return initializationComplete;
  },

  /**
   * Get all permissions from all modules.
   */
  getAllPermissions(): ModulePermissionDefinition[] {
    return this.getEnabled().flatMap((m) => m.permissions);
  },

  /**
   * Build unified navigation from all enabled modules.
   * Merges sections by stable section ID so multiple modules
   * contributing to the same section (e.g. MAIN MODULES) are
   * combined into one, with deduplication and ordering preserved.
   */
  getNavigation(): ModuleNavSection[] {
    const sectionMap = new Map<string, ModuleNavSection>();

    for (const mod of this.getEnabled()) {
      for (const section of mod.navigation) {
        const key = section.id;
        const existing = sectionMap.get(key);

        const moduleItems: ModuleNavItem[] = section.items.map((item) => ({
          ...item,
          // Prefixed ID for global uniqueness across modules
          id: `${mod.id}:${item.id}`,
        }));

        if (existing) {
          // Merge items, deduplicate by item id, then sort by order
          const mergedItems = [...existing.items, ...moduleItems];
          const seen = new Set<string>();
          const deduped: typeof mergedItems = [];
          for (const item of mergedItems) {
            if (seen.has(item.id)) continue;
            seen.add(item.id);
            deduped.push(item);
          }
          deduped.sort((a, b) => (a.order ?? 50) - (b.order ?? 50));
          sectionMap.set(key, {
            id: key,
            title: existing.title,
            order: Math.min(existing.order ?? 50, section.order ?? 50),
            items: deduped,
          });
        } else {
          sectionMap.set(key, {
            id: key,
            title: section.title,
            order: section.order ?? 50,
            items: moduleItems,
          });
        }
      }
    }

    return Array.from(sectionMap.values()).sort(
      (a, b) => (a.order ?? 50) - (b.order ?? 50)
    );
  },

  /**
   * Get all reports from all modules.
   */
  getAllReports(): ModuleReportDefinition[] {
    return this.getEnabled().flatMap(
      (m) => m.reports ?? []
    );
  },

  /**
   * Get all notification templates from all modules.
   */
  getAllNotificationTemplates(): ModuleNotificationTemplate[] {
    return this.getEnabled().flatMap(
      (m) => m.notifications ?? []
    );
  },

  /**
   * Get all background jobs from all modules.
   */
  getAllBackgroundJobs(): ModuleBackgroundJob[] {
    return this.getEnabled().flatMap(
      (m) => m.backgroundJobs ?? []
    );
  },

  /**
   * Get all audit log actions from all modules.
   */
  getAllAuditActions(): ModuleAuditAction[] {
    return this.getEnabled().flatMap(
      (m) => m.auditLogs ?? []
    );
  },

  /**
   * Get all feature flags from all modules.
   */
  getAllFeatureFlags(): ModuleFeatureFlag[] {
    return this.getEnabled().flatMap(
      (m) => m.featureFlags ?? []
    );
  },

  /**
   * Get all widgets from all modules.
   */
  getAllWidgets(): ModuleWidget[] {
    return this.getEnabled().flatMap(
      (m) => m.widgets ?? []
    );
  },

  /**
   * Get all integrations from all modules.
   */
  getAllIntegrations(): ModuleIntegration[] {
    return this.getEnabled().flatMap(
      (m) => m.integrations ?? []
    );
  },

  /**
   * Get all settings sections from all modules.
   */
  getAllSettings(): ModuleSettingsSection[] {
    return this.getEnabled().flatMap(
      (m) => m.settings ?? []
    );
  },

  /**
   * Get all events from all modules.
   */
  getAllEvents(): ModuleEvent[] {
    return this.getEnabled().flatMap(
      (m) => m.events ?? []
    );
  },

  /**
   * Get all metadata keyed by module ID.
   */
  getAllMetadata(): Record<string, Record<string, unknown>> {
    const meta: Record<string, Record<string, unknown>> = {};
    for (const mod of this.getEnabled()) {
      if (mod.metadata) {
        meta[mod.id] = mod.metadata;
      }
    }
    return meta;
  },

  /**
   * Clear the registry (useful for testing).
   */
  clear(): void {
    modules.clear();
    initializationComplete = false;
  },
};