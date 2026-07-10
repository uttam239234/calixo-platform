/**
 * Calixo Platform - Enterprise AI Copilot Platform Foundation
 *
 * Reusable, module-agnostic building blocks for the AI Copilot: sessions,
 * conversations, memory, planning, agents, skills, tools, execution, and
 * knowledge. Every module integrates by registering its own Skills, Tools,
 * and (for the 7 named specialist domains) an Agent — via its own
 * `skills/register<Module>Skills.ts` file, e.g. `core/ads/skills/registerAdsSkills.ts`.
 * Nothing in this foundation requires modification to support a new
 * module; Copilot itself owns no module-specific tool or skill metadata.
 */

import { registerDefaultAgents } from "./agents/defaultAgents";
import { registerCopilotUsageTypes } from "./commercial/CopilotUsageAdapter";
import { registerCopilotReports } from "./reports/registerCopilotReports";

export * from "./types/index";

export { ConversationEngine, conversationEngine } from "./conversation/ConversationEngine";
export { CopilotMemoryEngine, copilotMemoryEngine } from "./memory/MemoryEngine";
export { PlannerEngine, plannerEngine } from "./planning/PlannerEngine";
export { ClarificationEngine, clarificationEngine } from "./planning/ClarificationEngine";
export { suggestedActionsFor } from "./planning/suggestedActions";
export type { SuggestedAction } from "./planning/suggestedActions";
export { SkillRegistry, skillRegistry } from "./skills/SkillRegistry";
export { ToolRegistry as CopilotToolRegistry, toolRegistry as copilotToolRegistry } from "./tools/ToolRegistry";
export { AgentRegistry, agentRegistry } from "./agents/AgentRegistry";
export { registerDefaultAgents } from "./agents/defaultAgents";
export { ExecutionEngine, executionEngine } from "./execution/ExecutionEngine";
export { KnowledgeService as CopilotKnowledgeService, knowledgeService as copilotKnowledgeService } from "./knowledge/KnowledgeService";
export { SessionManager, sessionManager } from "./sessions/SessionManager";
export { CopilotPlatformAPI, copilotPlatformAPI } from "./platform/CopilotPlatformAPI";
export type { SendMessageOutcome } from "./platform/CopilotPlatformAPI";
export { COPILOT_USAGE_TYPES, registerCopilotUsageTypes, canUseCopilotFeature, recordCopilotUsage, getCopilotUsageTotal, estimateTokens } from "./commercial/CopilotUsageAdapter";
export { logCopilotEvent, logCopilotError, trackCopilotAction, trackCopilotTiming, trackClarificationCount } from "./observability/CopilotTelemetry";
export { registerCopilotReports } from "./reports/registerCopilotReports";
export { COPILOT_ORGANIZATION_ID, COPILOT_CURRENT_USER_ID, COPILOT_WORKSPACE_ID } from "./tenant/CopilotTenantDefaults";

let initialized = false;

/** Registers the 7 default agents, Copilot's own usage types, and its report definitions. Safe to call more than once. Per-module skills/tools are registered by each owning module's own `register<Module>Skills()`, called from `CopilotProvider` on mount. */
export function initializeCopilotFoundation(): void {
  if (initialized) return;
  registerDefaultAgents();
  registerCopilotUsageTypes();
  registerCopilotReports();
  initialized = true;
}
