/**
 * Calixo Platform - Copilot Agent Registry
 *
 * Generic registry for the 7 specialist agents — mirrors `SkillRegistry`'s
 * shape exactly. Holds display metadata only; an Agent never contains
 * business logic, it's the grouping the Planner attributes a matched
 * Skill to for the response's "answered by" line.
 */

import type { Agent } from "../types/index";

export class AgentRegistry {
  private agents: Map<string, Agent> = new Map();

  register(agent: Agent): void {
    this.agents.set(agent.id, agent);
  }

  lookup(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  list(): Agent[] {
    return Array.from(this.agents.values());
  }
}

export const agentRegistry = new AgentRegistry();
