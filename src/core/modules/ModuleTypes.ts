/**
 * Calixo Platform - Enterprise Module SDK
 * Core type definitions for the module plugin system.
 */

import type { LucideIcon } from "lucide-react";

// ============================================================================
// Module Categories
// ============================================================================

export type ModuleCategory =
  | "core"
  | "analytics"
  | "marketing"
  | "social"
  | "brand"
  | "content"
  | "ai"
  | "administration"
  | "developer";

// ============================================================================
// Subscription Tier
// ============================================================================

export type SubscriptionTier =
  | "free"
  | "starter"
  | "professional"
  | "enterprise"
  | "unlimited";

// ============================================================================
// Module Permission
// ============================================================================

export interface ModulePermissionDefinition {
  name: string;
  description: string;
  action: string;
  resource: string;
}

// ============================================================================
// Module Navigation
// ============================================================================

export interface ModuleNavItem {
  id: string;
  title: string;
  href: string;
  icon?: LucideIcon;
  badge?: string;
  order?: number;
  children?: ModuleNavItem[];
  disabled?: boolean;
}

export interface ModuleNavSection {
  id: string;
  title: string;
  order?: number;
  items: ModuleNavItem[];
}

// ============================================================================
// Module Route
// ============================================================================

export interface ModuleRoute {
  path: string;
  component: React.ComponentType;
  layout?: string;
  exact?: boolean;
  children?: ModuleRoute[];
}

// ============================================================================
// Module Report
// ============================================================================

export interface ModuleReportDefinition {
  id: string;
  name: string;
  description: string;
  format: "PDF" | "CSV" | "Excel" | "HTML";
  type: "manual" | "scheduled";
  generateFn?: () => Promise<void>;
}

// ============================================================================
// Module Notification
// ============================================================================

export interface ModuleNotificationTemplate {
  id: string;
  name: string;
  description: string;
  channels: ("inApp" | "email" | "push" | "slack")[];
  defaultEnabled: boolean;
}

// ============================================================================
// Module AI Configuration
// ============================================================================

export interface ModuleAIConfig {
  enabled: boolean;
  models?: string[];
  prompts?: string[];
  agents?: string[];
  contextSources?: string[];
  guardrails?: string[];
}

// ============================================================================
// Module Background Job
// ============================================================================

export interface ModuleBackgroundJob {
  id: string;
  name: string;
  description: string;
  schedule?: string; // cron expression
  handler?: string; // function reference
  enabled: boolean;
  timeout?: number;
  retries?: number;
}

// ============================================================================
// Module Widget
// ============================================================================

export interface ModuleWidget {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType;
  dimensions?: {
    minWidth?: number;
    minHeight?: number;
    defaultWidth?: number;
    defaultHeight?: number;
  };
}

// ============================================================================
// Module Integration
// ============================================================================

export interface ModuleIntegration {
  id: string;
  name: string;
  description: string;
  provider: string;
  authType: "oauth2" | "api_key" | "basic";
  required: boolean;
}

// ============================================================================
// Module Feature Flag
// ============================================================================

export interface ModuleFeatureFlag {
  id: string;
  name: string;
  description: string;
  defaultValue: boolean;
  canOverride: boolean;
}

// ============================================================================
// Module Audit Log
// ============================================================================

export interface ModuleAuditAction {
  action: string;
  description: string;
  logData?: boolean;
}

// ============================================================================
// Module Settings
// ============================================================================

export interface ModuleSettingsSection {
  id: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
}

// ============================================================================
// Module Events
// ============================================================================

export interface ModuleEvent {
  id: string;
  name: string;
  description: string;
  payloadSchema?: Record<string, unknown>;
}

// ============================================================================
// Module Lifecycle Hooks
// ============================================================================

export type ModuleHook =
  | "onInit"
  | "onActivate"
  | "onDeactivate"
  | "onUpgrade"
  | "onUninstall"
  | "beforeRender"
  | "afterRender";