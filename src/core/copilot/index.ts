/**
 * Calixo Platform - Enterprise AI Copilot Platform Foundation
 *
 * Reusable, module-agnostic building blocks for the AI Copilot: sessions,
 * conversations, memory, planning, skills, tools, execution, and
 * knowledge. Future modules integrate by registering Skills and Tools —
 * nothing in this foundation should ever require modification to support
 * a new module.
 *
 * This barrel only covers the new platform foundation built under this
 * directory's subfolders. The existing mock Copilot UI prototype at the
 * root of this folder (CopilotEngine, TaskPlanner, TaskExecutor, the
 * legacy ToolRegistry, mock-data, types) is untouched and out of scope.
 */

import { registerDefaultSkills } from "./skills/defaultSkills";
import { registerDefaultTools } from "./tools/defaultTools";

export * from "./types/index";

export { ConversationEngine, conversationEngine } from "./conversation/ConversationEngine";
export { CopilotMemoryEngine, copilotMemoryEngine } from "./memory/MemoryEngine";
export { PlannerEngine, plannerEngine } from "./planning/PlannerEngine";
export { SkillRegistry, skillRegistry } from "./skills/SkillRegistry";
export { registerDefaultSkills } from "./skills/defaultSkills";
export { ToolRegistry as CopilotToolRegistry, toolRegistry as copilotToolRegistry } from "./tools/ToolRegistry";
export { registerDefaultTools } from "./tools/defaultTools";
export { ExecutionEngine, executionEngine } from "./execution/ExecutionEngine";
export { KnowledgeService as CopilotKnowledgeService, knowledgeService as copilotKnowledgeService } from "./knowledge/KnowledgeService";
export { SessionManager, sessionManager } from "./sessions/SessionManager";

let initialized = false;

/** Registers the built-in skills and tools. Safe to call more than once. */
export function initializeCopilotFoundation(): void {
  if (initialized) return;
  registerDefaultTools();
  registerDefaultSkills();
  initialized = true;
}
