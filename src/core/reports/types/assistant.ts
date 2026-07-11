/**
 * Calixo Platform - AI Report Assistant Types
 *
 * A pure deterministic conversation state machine — mirrors Content
 * Studio's `AssistantConversationEngine` shape. Capped at 5 questions per
 * the brief; only asks for slots the original message didn't already
 * answer.
 */

import type { ReportSourceId } from "./sourceBinding";
import type { ReportCategory } from "./report";

export type AssistantQuestionId = "category" | "audience" | "timePeriod" | "recipients" | "geography";

export interface AssistantQuestionOption {
  id: string;
  label: string;
}

export interface AssistantQuestion {
  id: AssistantQuestionId;
  question: string;
  options?: AssistantQuestionOption[];
}

export interface AssistantTurn {
  role: "user" | "assistant";
  content: string;
}

export type AssistantAnswers = Partial<Record<AssistantQuestionId, string>>;

export interface AssistantSession {
  id: string;
  turns: AssistantTurn[];
  answers: AssistantAnswers;
  sourceId?: ReportSourceId;
  category?: ReportCategory;
  resolved: boolean;
  reportId?: string;
}
