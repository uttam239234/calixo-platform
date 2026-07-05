/**
 * Calixo Platform - Copilot Skill Registry
 *
 * A Skill represents a platform capability (e.g. Generate Content, Analyze
 * Content, Search Assets). Skills hold no business logic — they reference
 * an existing engine (engineRef) and the tools needed to invoke it
 * (toolIds). The registry itself is fully generic: modules register their
 * own skills, so this file never hardcodes module-specific behavior.
 */

import { appLogger } from "@/logging";
import type { Skill, SkillCategory } from "../types/index";

export class SkillRegistry {
  private skills: Map<string, Skill> = new Map();

  register(skill: Skill): void {
    if (this.skills.has(skill.id)) {
      appLogger.warn("Copilot.SkillRegistry", `Skill ${skill.id} already registered`);
      return;
    }
    this.skills.set(skill.id, skill);
    appLogger.info("Copilot.SkillRegistry", `Skill registered: ${skill.id} (${skill.engineRef})`);
  }

  unregister(id: string): void {
    this.skills.delete(id);
  }

  lookup(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  list(): Skill[] {
    return Array.from(this.skills.values());
  }

  listByCategory(category: SkillCategory): Skill[] {
    return this.list().filter(s => s.category === category);
  }

  /** Data-driven discovery: matches a free-text request against each skill's registered triggers. */
  discover(query: string): Skill[] {
    const q = query.toLowerCase();
    return this.list().filter(skill => skill.enabled && skill.triggers.some(trigger => q.includes(trigger.toLowerCase())));
  }
}

export const skillRegistry = new SkillRegistry();
