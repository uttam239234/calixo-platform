/**
 * Calixo Platform - Copilot Planning Types
 *
 * Every request flows through: Understand -> Clarify -> Planning ->
 * Tool Selection -> Execution Plan -> Validation -> Response.
 */

export type PlannerStageName =
  | "understand"
  | "clarify"
  | "planning"
  | "tool-selection"
  | "execution-plan"
  | "validation"
  | "response";

export interface PlannerUnderstanding {
  request: string;
  keywords: string[];
  intents: string[];
}

export interface ClarificationRequest {
  field: string;
  question: string;
}

export interface ExecutionStep {
  id: string;
  order: number;
  skillId: string;
  toolId: string;
  label: string;
  description: string;
  input: Record<string, unknown>;
  enabled: boolean;
  estimatedTimeMs: number;
}

export interface ExecutionPlan {
  id: string;
  sessionId: string;
  title: string;
  request: string;
  steps: ExecutionStep[];
  stage: PlannerStageName;
  estimatedTotalMs: number;
  createdAt: string;
}

export interface PlanValidationResult {
  valid: boolean;
  issues: string[];
}

export interface PlannerResult {
  plan: ExecutionPlan;
  clarificationsNeeded: ClarificationRequest[];
  validation: PlanValidationResult;
  responseText: string;
}
