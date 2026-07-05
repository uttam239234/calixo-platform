/**
 * Calixo AI Copilot Workspace - UI-only view types.
 *
 * These describe presentation state (reactions, pipeline stage status)
 * that the platform foundation intentionally has no opinion on. Nothing
 * here duplicates a platform type — it decorates them for rendering.
 */

import type { ConversationMessage, ExecutionPlan, PlannerResult } from "@/core/copilot";

export type MessageReaction = "like" | "dislike" | null;

export interface CopilotMessageView extends ConversationMessage {
  reaction: MessageReaction;
  /** For assistant messages: the plan produced alongside this response, if any. */
  plan?: ExecutionPlan;
  /** For assistant messages: the id of the user message that prompted this response (drives "Edit Prompt"). */
  promptMessageId?: string;
}

export type PipelineStageId = "understand" | "tool-selection" | "execution" | "validation" | "response";

export type PipelineStageStatus = "pending" | "running" | "completed" | "failed";

export interface PipelineStageView {
  id: PipelineStageId;
  label: string;
  status: PipelineStageStatus;
  progress: number;
}

export function buildPipelineStages(result: PlannerResult | null, executionStatus: PipelineStageStatus, executionProgress: number): PipelineStageView[] {
  if (!result) {
    return [
      { id: "understand", label: "Understand", status: "pending", progress: 0 },
      { id: "tool-selection", label: "Tool Selection", status: "pending", progress: 0 },
      { id: "execution", label: "Execution", status: "pending", progress: 0 },
      { id: "validation", label: "Validation", status: "pending", progress: 0 },
      { id: "response", label: "Response", status: "pending", progress: 0 },
    ];
  }

  const clarifying = result.clarificationsNeeded.length > 0;

  return [
    { id: "understand", label: "Understand", status: "completed", progress: 100 },
    {
      id: "tool-selection",
      label: "Tool Selection",
      status: clarifying ? "pending" : "completed",
      progress: clarifying ? 0 : 100,
    },
    {
      id: "execution",
      label: "Execution",
      status: clarifying ? "pending" : executionStatus,
      progress: clarifying ? 0 : executionProgress,
    },
    {
      id: "validation",
      label: "Validation",
      status: clarifying ? "pending" : result.validation.valid ? "completed" : "failed",
      progress: clarifying ? 0 : 100,
    },
    { id: "response", label: "Response", status: "completed", progress: 100 },
  ];
}
