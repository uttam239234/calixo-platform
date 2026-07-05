/**
 * Calixo Platform - Settings Validation Engine
 *
 * Validation only — never persistence, never UI. Runs a value through a
 * setting's declared ValidationRule list and returns a plain result.
 */

import type { SettingsValidationResult, ValidationRule } from "../types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^https?:\/\/[^\s]+$/i;

export class SettingsValidationEngine {
  validate(value: unknown, rules: ValidationRule[]): SettingsValidationResult {
    const issues: string[] = [];
    for (const rule of rules) {
      const result = this.validateRule(value, rule);
      if (!result.valid) issues.push(result.message);
    }
    return { valid: issues.length === 0, issues };
  }

  private validateRule(value: unknown, rule: ValidationRule): { valid: boolean; message: string } {
    switch (rule.type) {
      case "required":
        return { valid: value !== undefined && value !== null && value !== "", message: rule.message ?? "This field is required." };

      case "number":
        return { valid: typeof value === "number" && !Number.isNaN(value), message: rule.message ?? "Must be a number." };

      case "boolean":
        return { valid: typeof value === "boolean", message: rule.message ?? "Must be true or false." };

      case "string": {
        const isString = typeof value === "string";
        const meetsMin = rule.minLength === undefined || (isString && value.length >= rule.minLength);
        const meetsMax = rule.maxLength === undefined || (isString && value.length <= rule.maxLength);
        return { valid: isString && meetsMin && meetsMax, message: rule.message ?? "Must be a valid string." };
      }

      case "enum":
        return { valid: !rule.enumValues || rule.enumValues.includes(value), message: rule.message ?? "Value is not one of the allowed options." };

      case "url":
        return { valid: typeof value === "string" && URL_PATTERN.test(value), message: rule.message ?? "Must be a valid URL." };

      case "email":
        return { valid: typeof value === "string" && EMAIL_PATTERN.test(value), message: rule.message ?? "Must be a valid email address." };

      case "regex":
        return {
          valid: typeof value === "string" && !!rule.pattern && new RegExp(rule.pattern).test(value),
          message: rule.message ?? "Value does not match the required pattern.",
        };

      case "range": {
        const isNumber = typeof value === "number";
        const meetsMin = rule.min === undefined || (isNumber && value >= rule.min);
        const meetsMax = rule.max === undefined || (isNumber && value <= rule.max);
        return { valid: isNumber && meetsMin && meetsMax, message: rule.message ?? `Must be between ${rule.min ?? "-∞"} and ${rule.max ?? "∞"}.` };
      }

      case "custom":
        return { valid: !rule.validator || rule.validator(value), message: rule.message ?? "Value failed custom validation." };

      default:
        return { valid: true, message: "" };
    }
  }
}

export const settingsValidationEngine = new SettingsValidationEngine();
