/**
 * Calixo Platform - Mock Validation Rules Generator
 */

import type { ValidationRule, ValidationRuleType } from "../types";

const RULE_TYPES: ValidationRuleType[] = ["required", "number", "boolean", "enum", "string", "url", "email", "regex", "range", "custom"];

export function generateMockValidationRules(count = 50): ValidationRule[] {
  const rules: ValidationRule[] = [];

  for (let i = 0; i < count; i++) {
    const type = RULE_TYPES[i % RULE_TYPES.length];
    switch (type) {
      case "required":
        rules.push({ type, message: "This field is required." });
        break;
      case "number":
        rules.push({ type, message: "Must be a number." });
        break;
      case "boolean":
        rules.push({ type, message: "Must be true or false." });
        break;
      case "enum":
        rules.push({ type, enumValues: ["low", "medium", "high"], message: "Must be low, medium, or high." });
        break;
      case "string":
        rules.push({ type, minLength: 1, maxLength: 120, message: "Must be between 1 and 120 characters." });
        break;
      case "url":
        rules.push({ type, message: "Must be a valid URL." });
        break;
      case "email":
        rules.push({ type, message: "Must be a valid email address." });
        break;
      case "regex":
        rules.push({ type, pattern: "^[a-zA-Z0-9_-]+$", message: "Only letters, numbers, hyphens, and underscores are allowed." });
        break;
      case "range":
        rules.push({ type, min: 0, max: 100, message: "Must be between 0 and 100." });
        break;
      case "custom":
        rules.push({ type, validator: (value: unknown) => typeof value !== "string" || !value.includes(" "), message: "Must not contain spaces." });
        break;
    }
  }

  return rules;
}
