"use client";

/**
 * Calixo Settings Center - live validation state.
 * The only place allowed to call SettingsValidationEngine.
 */

import { useCallback } from "react";
import { settingsValidationEngine } from "@/core/settings";
import type { SettingsValidationResult, ValidationRule } from "@/core/settings";

export function useSettingsValidation() {
  const validate = useCallback((value: unknown, rules: ValidationRule[]): SettingsValidationResult => {
    return settingsValidationEngine.validate(value, rules);
  }, []);

  return { validate };
}
