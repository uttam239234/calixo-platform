/**
 * Calixo Platform - Reputation (Brand Monitoring) Module AI Skills
 *
 * Registers Brand Monitoring's capabilities into the shared Copilot
 * Skill/Tool registries — no Copilot code is modified. This is the
 * "sentiment/mentions" half of the brief's Brand Agent (the brand-kit
 * half is `core/brand/skills/registerBrandSkills.ts`) — the brief's own
 * worked example ("people are complaining about response times" -> check
 * sentiment) maps directly here. Real handlers call `ReputationPlatformAPI`
 * directly. Read-only; no approval gating needed.
 */

import { skillRegistry, copilotToolRegistry } from "@/core/copilot";
import type { Skill, PlatformTool, ToolHandler } from "@/core/copilot";
import { reputationPlatformAPI } from "../platform/ReputationPlatformAPI";

const AGENT_ID = "brand-agent";

const REPUTATION_SKILLS: Skill[] = [
  {
    id: "explain-sentiment",
    name: "Explain Sentiment",
    description: "Explain the current brand sentiment breakdown",
    category: "brand",
    engineRef: "ReputationPlatformAPI",
    toolIds: ["explain-sentiment"],
    triggers: ["check sentiment", "brand sentiment", "how do people feel about us", "people are complaining", "complaining about"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "explain-mention-spike",
    name: "Explain Mention Spike",
    description: "Explain a change in brand mention volume",
    category: "brand",
    engineRef: "ReputationPlatformAPI",
    toolIds: ["explain-mention-spike"],
    triggers: ["mention spike", "why are people talking about us", "mention volume"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "detect-reputation-risks",
    name: "Detect Reputation Risks",
    description: "Surface active crisis alerts and reputation risks",
    category: "brand",
    engineRef: "ReputationPlatformAPI",
    toolIds: ["detect-reputation-risks"],
    triggers: ["reputation risk", "any brand crisis", "crisis alerts", "negative reviews"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "recommend-reputation-actions",
    name: "Recommend Reputation Actions",
    description: "Recommend concrete next steps based on current reputation data",
    category: "brand",
    engineRef: "ReputationPlatformAPI",
    toolIds: ["recommend-reputation-actions"],
    triggers: ["what should we do about our reputation", "reputation recommendations", "improve our reputation"],
    enabled: true,
    agentId: AGENT_ID,
  },
];

const REPUTATION_TOOLS: PlatformTool[] = [
  { id: "explain-sentiment", name: "Explain Sentiment", description: "Explain current brand sentiment", category: "brand", provider: "engine", providerRef: "ReputationPlatformAPI", capabilities: [{ name: "sentiment-explanation" }], isActive: true },
  { id: "explain-mention-spike", name: "Explain Mention Spike", description: "Explain a change in mention volume", category: "brand", provider: "engine", providerRef: "ReputationPlatformAPI", capabilities: [{ name: "mention-trend-explanation" }], isActive: true },
  { id: "detect-reputation-risks", name: "Detect Reputation Risks", description: "Surface active crisis alerts", category: "brand", provider: "engine", providerRef: "ReputationPlatformAPI", capabilities: [{ name: "risk-detection" }], isActive: true },
  { id: "recommend-reputation-actions", name: "Recommend Reputation Actions", description: "Recommend next steps", category: "brand", provider: "engine", providerRef: "ReputationPlatformAPI", capabilities: [{ name: "action-recommendation" }], isActive: true },
];

function ok(value: string) {
  return { success: true as const, data: { text: value }, durationMs: 0 };
}

const REPUTATION_HANDLERS: Record<string, ToolHandler> = {
  "explain-sentiment": async () => ok(`${reputationPlatformAPI.explainSentiment()} ${reputationPlatformAPI.explainReputationChange()}`),
  "explain-mention-spike": async () => ok(reputationPlatformAPI.explainMentionSpike()),
  "detect-reputation-risks": async () => {
    const risks = reputationPlatformAPI.detectRisks();
    return ok(risks.length > 0 ? risks.join(" ") : "No active reputation risks or crisis alerts right now.");
  },
  "recommend-reputation-actions": async () => {
    const actions = reputationPlatformAPI.recommendActions();
    return ok(actions.length > 0 ? actions.join(" ") : "No specific reputation actions recommended right now — things look healthy.");
  },
};

let registered = false;

/** Safe to call more than once. Registers metadata, tools, and their real handlers. */
export function registerReputationSkills(): void {
  if (registered) return;
  for (const tool of REPUTATION_TOOLS) copilotToolRegistry.register(tool, REPUTATION_HANDLERS[tool.id]);
  for (const skill of REPUTATION_SKILLS) skillRegistry.register(skill);
  registered = true;
}
