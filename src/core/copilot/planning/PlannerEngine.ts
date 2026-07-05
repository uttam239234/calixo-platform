/**
 * Calixo Platform - Copilot Planner Engine
 *
 * Reusable planning pipeline: Understand -> Clarify -> Planning ->
 * Tool Selection -> Execution Plan -> Validation -> Response.
 *
 * Skill matching is entirely data-driven (skill triggers are registered by
 * each module via the SkillRegistry) so this engine never hardcodes
 * module-specific logic.
 */

import { generateId } from "@/shared/utils/string";
import { skillRegistry, SkillRegistry } from "../skills/SkillRegistry";
import { toolRegistry, ToolRegistry } from "../tools/ToolRegistry";
import type {
  ClarificationRequest,
  ExecutionPlan,
  ExecutionStep,
  PlannerResult,
  PlannerUnderstanding,
  PlanValidationResult,
  Skill,
} from "../types/index";

const STOPWORDS = new Set(["a", "an", "the", "for", "to", "of", "and", "on", "in", "with", "my", "me", "please"]);

export class PlannerEngine {
  constructor(
    private skills: SkillRegistry = skillRegistry,
    private tools: ToolRegistry = toolRegistry
  ) {}

  async run(input: { sessionId: string; request: string }): Promise<PlannerResult> {
    const understanding = this.understand(input.request);
    const clarificationsNeeded = this.clarify(understanding);

    if (clarificationsNeeded.length > 0) {
      const plan = this.emptyPlan(input.sessionId, input.request);
      return {
        plan,
        clarificationsNeeded,
        validation: { valid: false, issues: ["Awaiting clarification"] },
        responseText: clarificationsNeeded[0].question,
      };
    }

    const matchedSkills = this.selectSkills(understanding);
    const plan = this.buildExecutionPlan(input.sessionId, input.request, matchedSkills);
    const validation = this.validate(plan);

    return {
      plan,
      clarificationsNeeded: [],
      validation,
      responseText: this.respond(plan, matchedSkills, validation),
    };
  }

  private understand(request: string): PlannerUnderstanding {
    const keywords = request
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOPWORDS.has(w));
    return { request, keywords, intents: [...new Set(keywords)] };
  }

  private clarify(understanding: PlannerUnderstanding): ClarificationRequest[] {
    if (!understanding.request.trim()) {
      return [{ field: "request", question: "What would you like me to help you with?" }];
    }
    if (understanding.keywords.length === 0) {
      return [{ field: "request", question: "Could you provide a bit more detail about what you need?" }];
    }
    return [];
  }

  private selectSkills(understanding: PlannerUnderstanding): Skill[] {
    const matched = this.skills.discover(understanding.request);
    if (matched.length > 0) return matched;
    return this.skills.list().filter(s => s.enabled).slice(0, 1);
  }

  private buildExecutionPlan(sessionId: string, request: string, skills: Skill[]): ExecutionPlan {
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
          input: {},
          enabled: true,
          estimatedTimeMs: 1000,
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
    if (!validation.valid) return `I couldn't build a complete plan: ${validation.issues.join("; ")}`;
    const names = skills.map(s => s.name).join(", ");
    return `Here's my plan using ${names}: ${plan.steps.length} step(s) to complete this request.`;
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
