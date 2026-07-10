/**
 * Calixo Platform - Copilot Planner Engine
 *
 * Reusable planning pipeline: Understand -> Clarify -> Planning ->
 * Tool Selection -> Execution Plan -> Validation -> Response.
 *
 * Skill matching is entirely data-driven (skill triggers are registered by
 * each module via the SkillRegistry) so this engine never hardcodes
 * module-specific logic. Clarification is delegated to `ClarificationEngine`
 * so multi-turn slot-filling stays generic too.
 */

import { generateId } from "@/shared/utils/string";
import { clarificationEngine, ClarificationEngine } from "./ClarificationEngine";
import { skillRegistry, SkillRegistry } from "../skills/SkillRegistry";
import { toolRegistry, ToolRegistry } from "../tools/ToolRegistry";
import type {
  ExecutionPlan,
  ExecutionStep,
  ExecutionTask,
  PlannerResult,
  PlannerUnderstanding,
  PlanValidationResult,
  Skill,
} from "../types/index";

const STOPWORDS = new Set(["a", "an", "the", "for", "to", "of", "and", "on", "in", "with", "my", "me", "please"]);

export class PlannerEngine {
  constructor(
    private skills: SkillRegistry = skillRegistry,
    private tools: ToolRegistry = toolRegistry,
    private clarifications: ClarificationEngine = clarificationEngine
  ) {}

  async run(input: { sessionId: string; request: string }): Promise<PlannerResult> {
    const { sessionId, request } = input;

    let matchedSkills: Skill[];
    let agentId: string | undefined;
    let originalRequest: string;

    if (this.clarifications.isAwaitingAnswer(sessionId)) {
      this.clarifications.recordAnswer(sessionId, request);
      const state = this.clarifications.getState(sessionId)!;
      agentId = state.agentId;
      originalRequest = state.initialRequest;
      matchedSkills = state.matchedSkillIds.map(id => this.skills.lookup(id)).filter((s): s is Skill => !!s);
    } else {
      const understanding = this.understand(request);
      matchedSkills = this.selectSkills(understanding);
      agentId = matchedSkills[0]?.agentId;
      originalRequest = request;
      const primarySkillId = matchedSkills[0]?.id;
      if (agentId && primarySkillId) this.clarifications.start(sessionId, agentId, primarySkillId, matchedSkills.map(s => s.id), request);
    }

    if (!originalRequest.trim()) {
      return {
        plan: this.emptyPlan(sessionId, originalRequest),
        clarificationsNeeded: [{ field: "request", question: "What would you like me to help you with?" }],
        validation: { valid: false, issues: ["Awaiting clarification"] },
        responseText: "What would you like me to help you with?",
        agentId,
      };
    }

    const nextQuestion = agentId ? this.clarifications.nextQuestion(sessionId) : undefined;
    if (nextQuestion) {
      return {
        plan: this.emptyPlan(sessionId, originalRequest),
        clarificationsNeeded: [nextQuestion],
        validation: { valid: false, issues: ["Awaiting clarification"] },
        responseText: nextQuestion.question,
        agentId,
      };
    }

    const answers = this.clarifications.getAnswers(sessionId);
    this.clarifications.clear(sessionId);

    const plan = this.buildExecutionPlan(sessionId, originalRequest, matchedSkills, answers);
    const validation = this.validate(plan);
    const pendingApprovalSteps = plan.steps.filter(s => s.requiresApproval);

    return {
      plan,
      clarificationsNeeded: [],
      validation,
      responseText: this.respond(plan, matchedSkills, validation),
      agentId,
      pendingApprovalSteps: pendingApprovalSteps.length > 0 ? pendingApprovalSteps : undefined,
    };
  }

  /**
   * Builds the final assistant message from real tool-execution results
   * instead of the generic plan description — called by the caller
   * (`CopilotProvider`) once `ExecutionEngine.executePlan()` finishes the
   * plan's auto-run (non-approval) steps.
   */
  compose(plan: ExecutionPlan, tasks: ExecutionTask[]): { responseText: string; citation?: string } {
    const completed = tasks.filter(t => t.state === "completed" && t.result);
    const failed = tasks.filter(t => t.state === "failed");

    if (completed.length === 0 && failed.length > 0) {
      return { responseText: `I couldn't complete that: ${failed.map(t => t.error ?? "unknown error").join("; ")}` };
    }

    const sentences: string[] = [];
    for (const task of completed) {
      const data = task.result as { text?: string } | string | undefined;
      if (typeof data === "string") sentences.push(data);
      else if (data && typeof data === "object" && typeof data.text === "string") sentences.push(data.text);
    }

    if (sentences.length === 0) {
      return { responseText: plan.steps.length > 0 ? "Done." : "I don't have a tool that can help with that yet." };
    }

    const providerRefs = new Set<string>();
    for (const step of plan.steps) {
      const tool = this.tools.lookup(step.toolId);
      if (tool) providerRefs.add(tool.providerRef);
    }
    const citation = providerRefs.size > 0 ? `Data from ${[...providerRefs].join(", ")}.` : undefined;

    return { responseText: sentences.join(" "), citation };
  }

  private understand(request: string): PlannerUnderstanding {
    const keywords = request
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOPWORDS.has(w));
    return { request, keywords, intents: [...new Set(keywords)] };
  }

  private selectSkills(understanding: PlannerUnderstanding): Skill[] {
    const matched = this.skills.discover(understanding.request);
    if (matched.length > 0) return matched;
    return [];
  }

  private buildExecutionPlan(sessionId: string, request: string, skills: Skill[], answers: Record<string, string>): ExecutionPlan {
    const steps: ExecutionStep[] = [];
    let order = 1;
    for (const skill of skills) {
      const toolIds = skill.toolIds.length > 0 ? skill.toolIds : [skill.id];
      for (const toolId of toolIds) {
        const tool = this.tools.lookup(toolId);
        steps.push({
          id: generateId(12),
          order: order++,
          skillId: skill.id,
          toolId,
          label: tool?.name ?? skill.name,
          description: tool?.description ?? skill.description,
          input: { request, ...answers },
          enabled: true,
          estimatedTimeMs: 1000,
          agentId: skill.agentId,
          requiresApproval: tool?.requiresApproval ?? false,
        });
      }
    }
    return {
      id: generateId(16),
      sessionId,
      title: request.slice(0, 80),
      request,
      steps,
      stage: "execution-plan",
      estimatedTotalMs: steps.reduce((sum, s) => sum + s.estimatedTimeMs, 0),
      createdAt: new Date().toISOString(),
    };
  }

  private validate(plan: ExecutionPlan): PlanValidationResult {
    const issues: string[] = [];
    if (plan.steps.length === 0) issues.push("No matching skills or tools were found for this request.");
    for (const step of plan.steps) {
      if (!this.tools.lookup(step.toolId)) issues.push(`Tool not registered: ${step.toolId}`);
    }
    return { valid: issues.length === 0, issues };
  }

  private respond(plan: ExecutionPlan, skills: Skill[], validation: PlanValidationResult): string {
    if (!validation.valid) {
      if (plan.steps.length === 0) return "I don't have a capability that matches that request yet — could you rephrase it or ask about analytics, ads, social, brand, content, reports, or workflow approvals?";
      return `I couldn't build a complete plan: ${validation.issues.join("; ")}`;
    }
    const names = skills.map(s => s.name).join(", ");
    return `Working on it using ${names}...`;
  }

  private emptyPlan(sessionId: string, request: string): ExecutionPlan {
    return {
      id: generateId(16),
      sessionId,
      title: request.slice(0, 80) || "Untitled",
      request,
      steps: [],
      stage: "clarify",
      estimatedTotalMs: 0,
      createdAt: new Date().toISOString(),
    };
  }
}

export const plannerEngine = new PlannerEngine();
