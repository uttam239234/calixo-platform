/**
 * Calixo Platform - User Validation Engine
 *
 * Validation only — never persistence, never UI. Runs a value through a
 * declared UserValidationRule list, plus a convenience `validateUser()`
 * that applies the standard field rule set (email/username/display
 * name/phone/avatar/department/title) in one call.
 */

import type { User, UserValidationIssue, UserValidationResult, UserValidationRule } from "../types/index";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-z0-9._-]{3,32}$/i;
const PHONE_PATTERN = /^\+?[0-9()\-.\s]{7,20}$/;
const URL_PATTERN = /^https?:\/\/[^\s]+$/i;

export class UserValidationEngine {
  validate(value: unknown, rules: UserValidationRule[]): UserValidationResult {
    const issues: UserValidationIssue[] = [];
    for (const rule of rules) {
      const result = this.validateRule(value, rule);
      if (!result.valid) issues.push({ field: rule.field, message: result.message });
    }
    return { valid: issues.length === 0, issues };
  }

  private validateRule(value: unknown, rule: UserValidationRule): { valid: boolean; message: string } {
    switch (rule.type) {
      case "required":
        return { valid: value !== undefined && value !== null && value !== "", message: rule.message ?? `${rule.field} is required.` };

      case "email":
        return { valid: typeof value === "string" && EMAIL_PATTERN.test(value), message: rule.message ?? "Must be a valid email address." };

      case "url":
        return { valid: typeof value === "string" && URL_PATTERN.test(value), message: rule.message ?? "Must be a valid URL." };

      case "phone":
        return { valid: typeof value === "string" && PHONE_PATTERN.test(value), message: rule.message ?? "Must be a valid phone number." };

      case "regex":
        return {
          valid: typeof value === "string" && !!rule.pattern && new RegExp(rule.pattern).test(value),
          message: rule.message ?? "Value does not match the required pattern.",
        };

      case "length": {
        const isString = typeof value === "string";
        const meetsMin = rule.min === undefined || (isString && value.length >= rule.min);
        const meetsMax = rule.max === undefined || (isString && value.length <= rule.max);
        return { valid: isString && meetsMin && meetsMax, message: rule.message ?? `Must be between ${rule.min ?? 0} and ${rule.max ?? "∞"} characters.` };
      }

      case "custom":
        return { valid: !rule.validator || rule.validator(value), message: rule.message ?? "Value failed custom validation." };

      default:
        return { valid: true, message: "" };
    }
  }

  /** Applies the standard field rule set used across the directory (email/username/displayName/phone/avatar/department/title). */
  validateUser(user: Partial<User>): UserValidationResult {
    const issues: UserValidationIssue[] = [];

    const checks: Array<{ field: string; rules: UserValidationRule[]; value: unknown }> = [
      { field: "email", value: user.email, rules: [{ field: "email", type: "required" }, { field: "email", type: "email" }] },
      { field: "username", value: user.username, rules: [{ field: "username", type: "required" }, { field: "username", type: "regex", pattern: USERNAME_PATTERN.source }] },
      { field: "displayName", value: user.displayName, rules: [{ field: "displayName", type: "required" }, { field: "displayName", type: "length", min: 1, max: 120 }] },
      { field: "phone", value: user.phone, rules: user.phone ? [{ field: "phone", type: "phone" }] : [] },
      { field: "avatar", value: user.avatar, rules: user.avatar ? [{ field: "avatar", type: "url" }] : [] },
      { field: "department", value: user.department, rules: [{ field: "department", type: "required" }] },
      { field: "title", value: user.title, rules: [{ field: "title", type: "required" }] },
    ];

    for (const check of checks) {
      issues.push(...this.validate(check.value, check.rules).issues);
    }

    return { valid: issues.length === 0, issues };
  }
}

export const userValidationEngine = new UserValidationEngine();
