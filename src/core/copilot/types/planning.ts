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

export interface ClarificationOption {
  id: string;
  label: string;
}

export interface ClarificationRequest {
  field: string;
  question: string;
  /** Tap-to-answer chips, when the slot has a known small set of likely values. Free text is always still accepted. */
  options?: ClarificationOption[];
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
  /** Copied from the matched skill, for response attribution ("answered by the X Agent"). */
  agentId?: string;
  /** Copied from the matched tool. When true, this step is held out of the auto-run and rendered as an inline Approve/Reject action instead of executing immediately. */
  requiresApproval?: boolean;
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
  /** The primary agent that answered, for the response's attribution line. Undefined when no agent-owned skill matched. */
  agentId?: string;
  /** Short "data from X" attribution shown under the response — the AI Transparency citation. */
  citation?: string;
  /** Steps held for explicit approval before they can run. */
  pendingApprovalSteps?: ExecutionStep[];
}
