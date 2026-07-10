/**
 * Calixo AI Copilot Workspace - UI-only view types.
 *
 * These describe presentation state (reactions, pipeline stage status)
 * that the platform foundation intentionally has no opinion on. Nothing
 * here duplicates a platform type — it decorates them for rendering.
 */

import type { ConversationMessage, ExecutionPlan, ExecutionStep, SendMessageOutcome } from "@/core/copilot";

export type MessageReaction = "like" | "dislike" | null;

export type CopilotAttachmentKind = "image" | "document" | "spreadsheet" | "report" | "file";

export interface CopilotAttachment {
  id: string;
  name: string;
  kind: CopilotAttachmentKind;
  dataUrl: string;
}

const SPREADSHEET_EXTENSIONS = ["csv", "xls", "xlsx"];
const DOCUMENT_EXTENSIONS = ["doc", "docx", "txt", "rtf"];
const REPORT_EXTENSIONS = ["pdf"];

/** Extension-based classification only — real upload/storage, no content parsing (disclosed in the certification report). */
export function classifyAttachment(file: File): CopilotAttachmentKind {
  if (file.type.startsWith("image/")) return "image";
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (SPREADSHEET_EXTENSIONS.includes(ext)) return "spreadsheet";
  if (REPORT_EXTENSIONS.includes(ext)) return "report";
  if (DOCUMENT_EXTENSIONS.includes(ext)) return "document";
  return "file";
}

export interface CopilotMessageView extends ConversationMessage {
  reaction: MessageReaction;
  /** For assistant messages: the plan produced alongside this response, if any. */
  plan?: ExecutionPlan;
  /** For assistant messages: the id of the user message that prompted this response (drives "Edit Prompt"). */
  promptMessageId?: string;
  /** For assistant messages: steps held for explicit Approve/Reject before they can run. */
  pendingApprovalSteps?: ExecutionStep[];
  /** For user messages: files attached when sent. */
  attachments?: CopilotAttachment[];
}

export type PipelineStageId = "understand" | "tool-selection" | "execution" | "validation" | "response";

export type PipelineStageStatus = "pending" | "running" | "completed" | "failed";

export interface PipelineStageView {
  id: PipelineStageId;
  label: string;
  status: PipelineStageStatus;
  progress: number;
}

export function buildPipelineStages(result: SendMessageOutcome | null, executionStatus: PipelineStageStatus, executionProgress: number): PipelineStageView[] {
  if (!result) {
    return [
      { id: "understand", label: "Understand", status: "pending", progress: 0 },
      { id: "tool-selection", label: "Tool Selection", status: "pending", progress: 0 },
      { id: "execution", label: "Execution", status: "pending", progress: 0 },
      { id: "validation", label: "Validation", status: "pending", progress: 0 },
      { id: "response", label: "Response", status: "pending", progress: 0 },
    ];
  }

  const clarifying = result.awaitingClarification;

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
      status: clarifying ? "pending" : "completed",
      progress: clarifying ? 0 : 100,
    },
    { id: "response", label: "Response", status: "completed", progress: 100 },
  ];
}
