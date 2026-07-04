/**
 * Calixo Platform - Enterprise Module SDK
 * ModuleNavigation - Generates navigation from the ModuleRegistry.
 */

import { ModuleRegistry } from "./ModuleRegistry";
import type { ModuleNavSection } from "./ModuleTypes";

export const ModuleNavigation = {
  /**
   * Get navigation sections for the sidebar.
   * Filters by enabled modules and sorts by order.
   */
  getSidebarNavigation(): ModuleNavSection[] {
    return ModuleRegistry.getNavigation();
  },

  /**
   * Get navigation sections filtered by category.
   */
  getNavigationByCategory(category: string): ModuleNavSection[] {
    return ModuleRegistry.getNavigation().filter((section) =>
      section.id.startsWith(`${category}:`)
    );
  },

  /**
   * Get all unique routes from registered modules.
   */
  getRoutes(): string[] {
    return ModuleRegistry.getEnabled().map((m) => m.route);
  },
};