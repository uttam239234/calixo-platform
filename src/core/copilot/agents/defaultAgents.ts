/**
 * Calixo Platform - Copilot Default Agents
 *
 * The brief's 7 named specialist agents. These are display metadata only
 * — each module registers the Skills that carry the matching `agentId`
 * (see e.g. `core/ads/skills/registerAdsSkills.ts`). The user never picks
 * one of these from a menu; they only ever appear as a small attribution
 * line under a response.
 */

import { agentRegistry, AgentRegistry } from "./AgentRegistry";
import type { Agent } from "../types/index";

const DEFAULT_AGENTS: Agent[] = [
  { id: "analytics-agent", name: "Analytics Agent", description: "Explains trends, revenue, traffic, and forecasts.", icon: "BarChart3" },
  { id: "advertising-agent", name: "Advertising Agent", description: "Explains and optimizes ad campaign performance.", icon: "Megaphone" },
  { id: "social-agent", name: "Social Agent", description: "Explains social performance and schedules posts.", icon: "Share2" },
  { id: "brand-agent", name: "Brand Agent", description: "Tracks brand sentiment, mentions, and brand kit rules.", icon: "ShieldCheck" },
  { id: "content-agent", name: "Content Agent", description: "Generates and refines content and creative.", icon: "Sparkles" },
  { id: "reporting-agent", name: "Reporting Agent", description: "Builds and explains reports.", icon: "FileText" },
  { id: "workflow-agent", name: "Workflow Agent", description: "Manages approvals and workflow status.", icon: "GitBranch" },
];

export function registerDefaultAgents(registry: AgentRegistry = agentRegistry): void {
  for (const agent of DEFAULT_AGENTS) registry.register(agent);
}
