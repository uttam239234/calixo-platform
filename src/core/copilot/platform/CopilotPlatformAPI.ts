/**
 * Calixo Platform - AI Copilot Platform API
 *
 * The single sanctioned entry point for the new orchestration behavior
 * this round adds: Plan -> auto-run read steps -> compose a real response
 * -> hold write steps for approval. Session/conversation/context CRUD
 * stays in the existing hooks (`useCopilotSessions`, `useWorkspaceContext`,
 * `useCopilotExecution`) — they already call their engines correctly;
 * this facade exists for the behavior that's genuinely new, plus the one
 * genuinely cross-module call (logging an approved action into the real
 * Workflow Platform) that doesn't belong inside any single module's own
 * `register<Module>Skills.ts`.
 */
import { generateId } from "@/shared/utils/string";
import { workflowPlatformAPI } from "@/core/workflow";
import { agentRegistry } from "../agents/AgentRegistry";
import { skillRegistry } from "../skills/SkillRegistry";
import { toolRegistry } from "../tools/ToolRegistry";
import { plannerEngine } from "../planning/PlannerEngine";
import { executionEngine } from "../execution/ExecutionEngine";
import { copilotMemoryEngine } from "../memory/MemoryEngine";
import { suggestedActionsFor, type SuggestedAction } from "../planning/suggestedActions";
import type { ClarificationOption, Agent, ExecutionPlan, ExecutionStep, ExecutionTask, OrganizationPreferences, Skill, WorkspaceContext } from "../types/index";

export interface SendMessageOutcome {
  responseText: string;
  citation?: string;
  agentId?: string;
  awaitingClarification: boolean;
  clarificationOptions?: ClarificationOption[];
  pendingApprovalSteps: ExecutionStep[];
  tasks: ExecutionTask[];
  plan: ExecutionPlan;
}

export class CopilotPlatformAPI {
  /**
   * Plans the request, immediately runs every step that doesn't require
   * approval (reads execute immediately, per the brief), and composes the
   * final message from the real results. Steps flagged `requiresApproval`
   * are returned separately for the UI to render as an inline
   * Approve/Reject card instead of auto-running.
   */
  async sendMessage(sessionId: string, request: string): Promise<SendMessageOutcome> {
    const plannerResult = await plannerEngine.run({ sessionId, request });

    if (plannerResult.clarificationsNeeded.length > 0) {
      return {
        responseText: plannerResult.responseText,
        agentId: plannerResult.agentId,
        awaitingClarification: true,
        clarificationOptions: plannerResult.clarificationsNeeded[0]?.options,
        pendingApprovalSteps: [],
        tasks: [],
        plan: plannerResult.plan,
      };
    }

    const pendingApprovalSteps = plannerResult.plan.steps.filter(s => s.requiresApproval);
    const autoSteps = plannerResult.plan.steps.filter(s => !s.requiresApproval);
    const autoPlan: ExecutionPlan = { ...plannerResult.plan, steps: autoSteps };
    const tasks = autoSteps.length > 0 ? await executionEngine.executePlan(autoPlan) : [];
    const composed = tasks.length > 0 ? plannerEngine.compose(plannerResult.plan, tasks) : undefined;

    let responseText = composed?.responseText ?? plannerResult.responseText;
    if (pendingApprovalSteps.length > 0) {
      const names = pendingApprovalSteps.map(s => s.label).join(", ");
      responseText = tasks.length > 0 ? `${responseText} I also need your approval to ${names.toLowerCase()}.` : `This needs your approval: ${names}.`;
    }

    return {
      responseText,
      citation: composed?.citation,
      agentId: plannerResult.agentId,
      awaitingClarification: false,
      pendingApprovalSteps,
      tasks,
      plan: plannerResult.plan,
    };
  }

  /** Runs a single held-for-approval step, then logs it into the real Workflow Platform so it's auditable in `/dashboard/workflows` too. */
  async approveStep(step: ExecutionStep, approvedBy: string): Promise<{ task: ExecutionTask | undefined; responseText: string }> {
    const plan: ExecutionPlan = {
      id: generateId(16),
      sessionId: "",
      title: step.label,
      request: step.description,
      steps: [step],
      stage: "execution-plan",
      estimatedTotalMs: step.estimatedTimeMs,
      createdAt: new Date().toISOString(),
    };
    const tasks = await executionEngine.executePlan(plan);
    const task = tasks[0];

    if (task?.state === "completed") {
      workflowPlatformAPI.createWorkflow({
        title: `Approved via AI Copilot: ${step.label}`,
        description: step.description,
        assetId: step.id,
        assetName: step.label,
        priority: "medium",
        submittedBy: approvedBy,
      });
    }

    const composed = plannerEngine.compose(plan, tasks);
    return { task, responseText: composed.responseText };
  }

  rejectStep(step: ExecutionStep): { responseText: string } {
    return { responseText: `Okay, I won't ${step.label.toLowerCase()}.` };
  }

  listAgents(): Agent[] {
    return agentRegistry.list();
  }

  listSkills(): Skill[] {
    return skillRegistry.list();
  }

  /** For the command palette — every tool call the user can trigger by name, without seeing which module owns it. */
  listActions(): { id: string; name: string; description: string }[] {
    return toolRegistry.list().map(t => ({ id: t.id, name: t.name, description: t.description }));
  }

  getSuggestedActions(agentId?: string): SuggestedAction[] {
    return suggestedActionsFor(agentId);
  }

  getWorkspaceContext(sessionId: string): Promise<WorkspaceContext> {
    return copilotMemoryEngine.getContext(sessionId);
  }

  getOrgPreferences(organizationId: string): Promise<OrganizationPreferences> {
    return copilotMemoryEngine.getOrgPreferences(organizationId);
  }

  updateOrgPreferences(organizationId: string, patch: Partial<OrganizationPreferences>): Promise<OrganizationPreferences> {
    return copilotMemoryEngine.updateOrgPreferences(organizationId, patch);
  }
}

export const copilotPlatformAPI = new CopilotPlatformAPI();
