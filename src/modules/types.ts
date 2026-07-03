/**
 * Calixo Platform - Module Registry Types
 * 
 * Shared types for the module/feature registry system.
 * Every module registers itself with these interfaces.
 */

import type { ComponentType } from 'react';

// ============================================================================
// Module Definition
// ============================================================================

export interface ModuleDefinition {
  /** Unique identifier for the module */
  id: string;
  /** Display name */
  name: string;
  /** Module description */
  description: string;
  /** Version string */
  version: string;
  /** Module icon component */
  icon: ComponentType<{ size?: number; className?: string }>;
  /** Order in sidebar (lower = higher) */
  order: number;
  /** Module category for grouping */
  category: ModuleCategory;
  /** Navigation items registered by this module */
  navigation: NavigationItem[];
  /** Routes this module handles */
  routes: RouteDefinition[];
  /** Permissions required/defined by this module */
  permissions: string[];
  /** Feature flag ID for enabling/disabling this module */
  featureFlag: string;
  /** Default module-level settings */
  defaultSettings?: Record<string, unknown>;
  /** Module status */
  status: ModuleStatus;
}

export type ModuleCategory = 'main' | 'ai' | 'administration';

export type ModuleStatus = 'active' | 'beta' | 'coming_soon' | 'deprecated';

// ============================================================================
// Navigation
// ============================================================================

export interface NavigationItem {
  title: string;
  href: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  badge?: string;
  children?: NavigationItem[];
  permission?: string;
  featureFlag?: string;
}

// ============================================================================
// Routes
// ============================================================================

export interface RouteDefinition {
  path: string;
  component?: ComponentType;
  layout?: ComponentType;
  permission?: string;
  featureFlag?: string;
}

// ============================================================================
// Module Registry Interface
// ============================================================================

export interface ModuleRegistry {
  /** Register a module */
  register(module: ModuleDefinition): void;
  /** Unregister a module */
  unregister(moduleId: string): void;
  /** Get a registered module by ID */
  get(moduleId: string): ModuleDefinition | undefined;
  /** Get all registered modules */
  getAll(): ModuleDefinition[];
  /** Get navigation items from all registered modules */
  getNavigation(): NavigationItem[];
  /** Get all routes from all registered modules */
  getRoutes(): RouteDefinition[];
  /** Check if a module is registered */
  has(moduleId: string): boolean;
}