/**
 * Calixo Platform - User Validation Types
 */

export type UserValidationFieldType = "required" | "email" | "url" | "regex" | "length" | "phone" | "custom";

export interface UserValidationRule {
  field: string;
  type: UserValidationFieldType;
  message?: string;
  pattern?: string;
  min?: number;
  max?: number;
  validator?: (value: unknown) => boolean;
}

export interface UserValidationIssue {
  field: string;
  message: string;
}

export interface UserValidationResult {
  valid: boolean;
  issues: UserValidationIssue[];
}
