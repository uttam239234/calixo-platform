/**
 * Calixo Platform - Copilot Default Skills
 *
 * Registers the platform capabilities that already exist today, each
 * pointing at its real engine. This file is the *only* place that knows
 * about these specific modules — the SkillRegistry, PlannerEngine, and
 * ExecutionEngine remain fully generic. Future modules (Reports,
 * Settings, Users, Roles, Workspaces, Integrations, Billing, Audit, API)
 * follow this same pattern to integrate without touching any Copilot code.
 */

import { skillRegistry, SkillRegistry } from "./SkillRegistry";
import type { Skill } from "../types/index";

const DEFAULT_SKILLS: Skill[] = [
  {
    id: "generate-content",
    name: "Generate Content",
    description: "Create marketing content, articles, and copy",
    category: "content",
    engineRef: "GenerationEngine",
    toolIds: ["generate-content"],
    triggers: ["generate content", "write", "create content", "copy", "article", "rewrite", "improve", "optimize"],
    enabled: true,
  },
  {
    id: "generate-creative",
    name: "Generate Creative",
    description: "Produce creative documents and layout blueprints",
    category: "creative",
    engineRef: "CreativeEngine",
    toolIds: ["generate-creative"],
    triggers: ["creative", "layout", "design", "instagram", "social post"],
    enabled: true,
  },
  {
    id: "generate-image",
    name: "Generate Image",
    description: "Generate AI images and variations",
    category: "media",
    engineRef: "MediaGenerationEngine",
    toolIds: ["generate-image"],
    triggers: ["image", "picture", "visual", "photo", "variations"],
    enabled: true,
  },
  {
    id: "analyze-content",
    name: "Analyze Content",
    description: "Run content intelligence analysis and quality scoring",
    category: "analysis",
    engineRef: "ContentIntelligenceEngine",
    toolIds: ["analyze-content"],
    triggers: ["analyze", "audit", "score", "seo", "readability"],
    enabled: true,
  },
  {
    id: "search-assets",
    name: "Search Assets",
    description: "Search the Marketing Resource Hub for existing assets",
    category: "library",
    engineRef: "LibraryEngine",
    toolIds: ["search-library", "manage-assets"],
    triggers: ["search", "find", "library", "asset", "resource"],
    enabled: true,
  },
  {
    id: "workflow",
    name: "Workflow",
    description: "Start or manage an approval workflow",
    category: "workflow",
    engineRef: "WorkflowEngine",
    toolIds: ["manage-workflow"],
    triggers: ["workflow", "approve", "approval", "review", "submit for review"],
    enabled: true,
  },
  {
    id: "brand",
    name: "Brand",
    description: "Load and validate brand kit configuration",
    category: "brand",
    engineRef: "BrandKitEngine",
    toolIds: ["load-brand"],
    triggers: ["brand", "brand kit", "guidelines", "logo", "colors"],
    enabled: true,
  },
];

export function registerDefaultSkills(registry: SkillRegistry = skillRegistry): void {
  for (const skill of DEFAULT_SKILLS) registry.register(skill);
}
