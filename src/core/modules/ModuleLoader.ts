/**
 * Calixo Platform - Enterprise Module SDK
 * ModuleLoader - Lazy loads and initializes modules.
 */

import { ModuleRegistry } from "./ModuleRegistry";

export const ModuleLoader = {
  /**
   * Initialize all registered modules.
   * Calls onInit hook for each enabled module.
   */
  async initialize(): Promise<void> {
    const mods = ModuleRegistry.getEnabled();
    for (const mod of mods) {
      await mod.hooks?.onInit?.();
    }
    ModuleRegistry.markInitialized();
  },

  /**
   * Activate a specific module.
   */
  async activate(moduleId: string): Promise<void> {
    const mod = ModuleRegistry.get(moduleId);
    if (!mod) throw new Error(`Module "${moduleId}" not found.`);
    mod.enabled = true;
    await mod.hooks?.onActivate?.();
  },

  /**
   * Deactivate a specific module.
   */
  async deactivate(moduleId: string): Promise<void> {
    const mod = ModuleRegistry.get(moduleId);
    if (!mod) throw new Error(`Module "${moduleId}" not found.`);
    await mod.hooks?.onDeactivate?.();
    mod.enabled = false;
  },

  /**
   * Execute the onUpgrade hook if available.
   */
  async upgrade(moduleId: string): Promise<void> {
    const mod = ModuleRegistry.get(moduleId);
    if (!mod) throw new Error(`Module "${moduleId}" not found.`);
    await mod.hooks?.onUpgrade?.();
  },

  /**
   * Execute all enabled modules' beforeRender hooks.
   */
  async beforeRender(): Promise<void> {
    const mods = ModuleRegistry.getEnabled();
    for (const mod of mods) {
      await mod.hooks?.beforeRender?.();
    }
  },

  /**
   * Execute all enabled modules' afterRender hooks.
   */
  async afterRender(): Promise<void> {
    const mods = ModuleRegistry.getEnabled();
    for (const mod of mods) {
      await mod.hooks?.afterRender?.();
    }
  },
};