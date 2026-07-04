/** Calixo Platform — Workflow & Approvals Types */

export type WorkflowStatus = "draft" | "ai-generated" | "in-review" | "changes-requested" | "approved" | "scheduled" | "published" | "archived";
export type WorkflowPriority = "low" | "medium" | "high" | "critical";
export type WorkflowActionType = "submitted" | "assigned" | "approved" | "rejected" | "changes-requested" | "reassigned" | "comment" | "due-date-set" | "restored" | "archived" | "notified";

export interface WorkflowComment {
  id: string; workflowId: string; author: string; text: string; timestamp: string;
  parentId?: string; mentions: string[]; attachments: { id: string; name: string }[];
}

export interface WorkflowAction {
  id: string; workflowId: string; type: WorkflowActionType; performedBy: string;
  timestamp: string; details: string; previousStatus?: WorkflowStatus; newStatus?: WorkflowStatus;
}

export interface WorkflowEntry {
  id: string; title: string; description: string; assetId: string; assetName: string;
  status: WorkflowStatus; priority: WorkflowPriority;
  submittedBy: string; reviewer?: string; approver?: string; dueDate?: string;
  brand?: string; campaign?: string; createdAt: string; updatedAt: string;
  comments: WorkflowComment[]; actions: WorkflowAction[];
}