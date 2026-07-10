/**
 * Calixo Platform - Copilot Skill Types
 *
 * A Skill is metadata describing a platform capability. It never contains
 * business logic — it only references the existing engine that performs
 * the work (engineRef) and the tools needed to invoke it (toolIds).
 */

export type SkillCategory =
  | "content"
  | "creative"
  | "media"
  | "analysis"
  | "library"
  | "asset"
  | "workflow"
  | "brand"
  | "reports"
  | "analytics"
  | "advertising"
  | "social"
  | "platform";

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  engineRef: string;
  toolIds: string[];
  triggers: string[];
  enabled: boolean;
  /** Which of the brief's 7 specialist agents owns this skill, for response attribution. Optional — skills outside the named agent taxonomy (e.g. Dashboard/Users/Settings) are left unattributed rather than forced into an awkward mapping. */
  agentId?: string;
}
