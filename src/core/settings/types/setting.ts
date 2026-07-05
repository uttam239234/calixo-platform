/**
 * Calixo Platform - Settings Core Types
 */

import type { ModuleCategory } from "@/core/modules/ModuleTypes";
import type { SettingsGroupId } from "./group";

export type SettingType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "switch"
  | "select"
  | "multiselect"
  | "color"
  | "json"
  | "url"
  | "email"
  | "password"
  | "file"
  | "directory"
  | "date"
  | "time";

export const SETTING_TYPES: SettingType[] = [
  "text",
  "textarea",
  "number",
  "boolean",
  "switch",
  "select",
  "multiselect",
  "color",
  "json",
  "url",
  "email",
  "password",
  "file",
  "directory",
  "date",
  "time",
];

export interface SettingOption {
  value: unknown;
  label: string;
}

export type ValidationRuleType = "required" | "number" | "boolean" | "enum" | "string" | "url" | "email" | "regex" | "range" | "custom";

export interface ValidationRule {
  type: ValidationRuleType;
  message?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enumValues?: unknown[];
  validator?: (value: unknown) => boolean;
}

export interface SettingDefinition {
  id: string;
  key: string;
  label: string;
  description: string;
  module: ModuleCategory;
  category: string;
  group: SettingsGroupId;
  type: SettingType;
  defaultValue: unknown;
  currentValue: unknown;
  options?: SettingOption[];
  required: boolean;
  readonly: boolean;
  hidden: boolean;
  tags: string[];
  permissions: string[];
  validation: ValidationRule[];
  featureFlag?: string;
  restartRequired: boolean;
  experimental: boolean;
  metadata?: Record<string, unknown>;
}

export interface SettingsValidationResult {
  valid: boolean;
  issues: string[];
}

export interface SettingsSaveResult {
  success: boolean;
  errors: string[];
  value?: unknown;
}

export type SettingsChangeAction = "save" | "reset";

export interface SettingsChangeRecord {
  id: string;
  key: string;
  action: SettingsChangeAction;
  previousValue: unknown;
  newValue: unknown;
  timestamp: string;
}
