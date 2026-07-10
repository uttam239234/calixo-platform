/**
 * Calixo Platform - Workflow Module AI Skills
 *
 * Registers Workflow's capabilities into the shared Copilot Skill/Tool
 * registries — no Copilot code is modified, mirrors the Ads/Social
 * registration. This module owns the brief's Workflow Agent. Real
 * handlers call `WorkflowPlatformAPI` directly; approve/reject are marked
 * `requiresApproval` since granting or denying an approval is itself the
 * consequential action the brief's Approval Model exists to gate.
 */

import { skillRegistry, copilotToolRegistry } from "@/core/copilot";
import type { Skill, PlatformTool, ToolHandler } from "@/core/copilot";
import { workflowPlatformAPI } from "../platform/WorkflowPlatformAPI";

const AGENT_ID = "workflow-agent";
const COPILOT_ACTOR = "copilot";

const WORKFLOW_SKILLS: Skill[] = [
  {
    id: "get-pending-approvals",
    name: "Get Pending Approvals",
    description: "List items awaiting review or with requested changes",
    category: "workflow",
    engineRef: "WorkflowPlatformAPI",
    toolIds: ["get-pending-approvals"],
    triggers: ["pending approvals", "what needs my approval", "show pending approvals", "what's awaiting review"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "get-overdue-workflow-items",
    name: "Get Overdue Items",
    description: "List overdue workflow items",
    category: "workflow",
    engineRef: "WorkflowPlatformAPI",
    toolIds: ["get-overdue-workflow-items"],
    triggers: ["what's overdue", "overdue approvals", "overdue items"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "get-workflow-summary",
    name: "Get Workflow Summary",
    description: "Summarize pending, overdue, and approved workflow counts",
    category: "workflow",
    engineRef: "WorkflowPlatformAPI",
    toolIds: ["get-workflow-summary"],
    triggers: ["workflow summary", "approval status", "how many approvals"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "approve-workflow-item",
    name: "Approve Workflow Item",
    description: "Approve the oldest pending workflow item",
    category: "workflow",
    engineRef: "WorkflowPlatformAPI",
    toolIds: ["approve-workflow-item"],
    triggers: ["approve this", "approve it", "approve the pending item"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "reject-workflow-item",
    name: "Reject Workflow Item",
    description: "Reject the oldest pending workflow item",
    category: "workflow",
    engineRef: "WorkflowPlatformAPI",
    toolIds: ["reject-workflow-item"],
    triggers: ["reject this", "reject it", "request changes"],
    enabled: true,
    agentId: AGENT_ID,
  },
];

const WORKFLOW_TOOLS: PlatformTool[] = [
  { id: "get-pending-approvals", name: "Get Pending Approvals", description: "List items awaiting review", category: "workflow", provider: "engine", providerRef: "WorkflowPlatformAPI", capabilities: [{ name: "approvals-lookup" }], isActive: true },
  { id: "get-overdue-workflow-items", name: "Get Overdue Items", description: "List overdue workflow items", category: "workflow", provider: "engine", providerRef: "WorkflowPlatformAPI", capabilities: [{ name: "overdue-lookup" }], isActive: true },
  { id: "get-workflow-summary", name: "Get Workflow Summary", description: "Summarize workflow counts", category: "workflow", provider: "engine", providerRef: "WorkflowPlatformAPI", capabilities: [{ name: "summary-lookup" }], isActive: true },
  { id: "approve-workflow-item", name: "Approve Workflow Item", description: "Approve a pending item", category: "workflow", provider: "engine", providerRef: "WorkflowPlatformAPI", capabilities: [{ name: "approval-grant" }], isActive: true, requiresApproval: true },
  { id: "reject-workflow-item", name: "Reject Workflow Item", description: "Reject a pending item", category: "workflow", provider: "engine", providerRef: "WorkflowPlatformAPI", capabilities: [{ name: "approval-deny" }], isActive: true, requiresApproval: true },
];

function ok(value: string) {
  return { success: true as const, data: { text: value }, durationMs: 0 };
}

function fail(error: string) {
  return { success: false as const, error, durationMs: 0 };
}

const WORKFLOW_HANDLERS: Record<string, ToolHandler> = {
  "get-pending-approvals": async () => {
    const pending = workflowPlatformAPI.getPendingApprovals(5);
    return ok(pending.length > 0 ? `${pending.length} item${pending.length === 1 ? "" : "s"} awaiting review: ${pending.map(w => `"${w.title}" (submitted by ${w.submittedBy})`).join(", ")}.` : "Nothing is awaiting review right now.");
  },
  "get-overdue-workflow-items": async () => {
    const overdue = workflowPlatformAPI.getOverdue();
    return ok(overdue.length > 0 ? `${overdue.length} item${overdue.length === 1 ? "" : "s"} overdue: ${overdue.map(w => `"${w.title}"`).join(", ")}.` : "Nothing is overdue right now.");
  },
  "get-workflow-summary": async () => {
    const summary = workflowPlatformAPI.getWorkflowSummary();
    return ok(`${summary.pending} pending, ${summary.overdue} overdue, ${summary.approved} approved — averaging ${summary.avgApprovalDays} day${summary.avgApprovalDays === 1 ? "" : "s"} to approve.`);
  },
  "approve-workflow-item": async () => {
    const target = workflowPlatformAPI.getPendingApprovals(1)[0];
    if (!target) return fail("Nothing is awaiting approval right now.");
    workflowPlatformAPI.approve(target.id, COPILOT_ACTOR);
    return ok(`Approved "${target.title}".`);
  },
  "reject-workflow-item": async () => {
    const target = workflowPlatformAPI.getPendingApprovals(1)[0];
    if (!target) return fail("Nothing is awaiting approval right now.");
    workflowPlatformAPI.reject(target.id, COPILOT_ACTOR, "Rejected via AI Copilot");
    return ok(`Rejected "${target.title}" and requested changes.`);
  },
};

let registered = false;

/** Safe to call more than once. Registers metadata, tools, and their real handlers. */
export function registerWorkflowSkills(): void {
  if (registered) return;
  for (const tool of WORKFLOW_TOOLS) copilotToolRegistry.register(tool, WORKFLOW_HANDLERS[tool.id]);
  for (const skill of WORKFLOW_SKILLS) skillRegistry.register(skill);
  registered = true;
}
