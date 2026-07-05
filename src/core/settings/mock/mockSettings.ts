/**
 * Calixo Platform - Mock Settings Generator
 */

import { generateId } from "@/shared/utils/string";
import { SETTING_TYPES } from "../types";
import type { SettingDefinition, SettingOption, SettingType, SettingsGroupId, ValidationRule } from "../types";
import { GROUP_CATEGORY_BANK, GROUP_MODULE_MAP, pick } from "./data";
import { generateMockValidationRules } from "./mockValidationRules";
import { generateMockFeatureFlags } from "./mockFeatureFlags";

const GROUPS = Object.keys(GROUP_MODULE_MAP) as SettingsGroupId[];

const SELECT_OPTIONS: SettingOption[] = [
  { value: "option-a", label: "Option A" },
  { value: "option-b", label: "Option B" },
  { value: "option-c", label: "Option C" },
];

function toField(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function defaultValueFor(type: SettingType, i: number): unknown {
  switch (type) {
    case "text":
      return "Default value";
    case "textarea":
      return "A longer default description spanning a couple of sentences.";
    case "number":
      return (i % 100) + 1;
    case "boolean":
    case "switch":
      return i % 2 === 0;
    case "select":
      return SELECT_OPTIONS[i % SELECT_OPTIONS.length].value;
    case "multiselect":
      return [SELECT_OPTIONS[i % SELECT_OPTIONS.length].value];
    case "color":
      return "#4F46E5";
    case "json":
      return { enabled: true, level: i % 3 };
    case "url":
      return "https://calixo.io";
    case "email":
      return "notify@calixo.io";
    case "password":
      return "";
    case "file":
      return "default.json";
    case "directory":
      return "/data/default";
    case "date":
      return new Date().toISOString().slice(0, 10);
    case "time":
      return "09:00";
    default:
      return null;
  }
}

export function generateMockSettings(count = 300): SettingDefinition[] {
  const validationPool = generateMockValidationRules(50);
  const flagPool = generateMockFeatureFlags(30);
  const settings: SettingDefinition[] = [];

  for (let i = 0; i < count; i++) {
    const group = GROUPS[i % GROUPS.length];
    const category = pick(GROUP_CATEGORY_BANK[group], Math.floor(i / GROUPS.length));
    const type = SETTING_TYPES[i % SETTING_TYPES.length];
    const label = `${category} Setting ${Math.floor(i / GROUPS.length) + 1}`;
    const key = `${group}.${toField(category)}.${i}`;
    const defaultValue = defaultValueFor(type, i);

    const validation: ValidationRule[] = i % 6 === 0 ? [validationPool[(i / 6) % validationPool.length]] : [];
    const featureFlag = i % 10 === 0 ? flagPool[(i / 10) % flagPool.length] : undefined;

    settings.push({
      id: generateId(16),
      key,
      label,
      description: `Controls ${label.toLowerCase()} for the ${group} group.`,
      module: GROUP_MODULE_MAP[group],
      category,
      group,
      type,
      defaultValue,
      currentValue: defaultValue,
      options: type === "select" || type === "multiselect" ? SELECT_OPTIONS : undefined,
      required: i % 7 === 0,
      readonly: i % 13 === 0,
      hidden: i % 17 === 0,
      tags: [group, category.toLowerCase().replace(/\s+/g, "-"), "mock"],
      permissions: i % 5 === 0 ? [`${group}.manage`] : [],
      validation,
      featureFlag,
      restartRequired: i % 11 === 0,
      experimental: i % 19 === 0,
    });
  }

  return settings;
}
