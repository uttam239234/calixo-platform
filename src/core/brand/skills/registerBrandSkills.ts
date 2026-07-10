/**
 * Calixo Platform - Brand Kit Module AI Skills
 *
 * Registers Brand Kit's capabilities into the shared Copilot Skill/Tool
 * registries — no Copilot code is modified. This is the "brand guidelines"
 * half of the brief's Brand Agent (the sentiment/mentions half is
 * `core/reputation/skills/registerReputationSkills.ts`) — real handlers
 * call `BrandPlatformAPI` directly. Read-only; no approval gating needed.
 */

import { skillRegistry, copilotToolRegistry } from "@/core/copilot";
import type { Skill, PlatformTool, ToolHandler } from "@/core/copilot";
import { brandPlatformAPI } from "../platform/BrandPlatformAPI";

const AGENT_ID = "brand-agent";

const BRAND_SKILLS: Skill[] = [
  {
    id: "explain-brand-guidelines",
    name: "Explain Brand Guidelines",
    description: "Summarize brand voice, tone, and colors from the Brand Kit",
    category: "brand",
    engineRef: "BrandPlatformAPI",
    toolIds: ["explain-brand-guidelines"],
    triggers: ["brand guidelines", "brand voice", "brand colors", "brand tone", "what words should i avoid"],
    enabled: true,
    agentId: AGENT_ID,
  },
];

const BRAND_TOOLS: PlatformTool[] = [
  { id: "explain-brand-guidelines", name: "Explain Brand Guidelines", description: "Summarize brand voice, tone, and colors", category: "brand", provider: "engine", providerRef: "BrandPlatformAPI", capabilities: [{ name: "brand-lookup" }], isActive: true },
];

function ok(value: string) {
  return { success: true as const, data: { text: value }, durationMs: 0 };
}

const BRAND_HANDLERS: Record<string, ToolHandler> = {
  "explain-brand-guidelines": async () => {
    const brand = brandPlatformAPI.listBrandSummaries()[0];
    if (!brand) return ok("No brand kit is configured yet.");
    const profile = brandPlatformAPI.getBrandStyleProfile(brand.id);
    if (!profile) return ok(`"${brand.brandName}" is configured, but no style profile is set yet.`);
    return ok(`"${profile.brandName}"'s voice is ${profile.voiceTone}, written in a ${profile.writingStyle} style, with a "${profile.preferredCTA}" call-to-action preference. Primary color ${profile.colors[0] ?? "not set"}.${profile.forbiddenWords.length > 0 ? ` Avoid: ${profile.forbiddenWords.join(", ")}.` : ""}`);
  },
};

let registered = false;

/** Safe to call more than once. Registers metadata, tools, and their real handlers. */
export function registerBrandSkills(): void {
  if (registered) return;
  for (const tool of BRAND_TOOLS) copilotToolRegistry.register(tool, BRAND_HANDLERS[tool.id]);
  for (const skill of BRAND_SKILLS) skillRegistry.register(skill);
  registered = true;
}
