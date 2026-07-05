/**
 * Calixo Platform - Dashboard Module AI Skills
 *
 * Registers the Dashboard module's capabilities into the existing Copilot
 * Skill/Tool registries — no Copilot code is modified. This is metadata
 * only: no handler is wired and no LLM execution happens here, exactly
 * like every other module's registration (Settings, Users, Reports).
 *
 * SkillCategory has no dedicated "dashboard" value, so these use the
 * existing "platform" category rather than expanding Copilot's enum.
 */

import { skillRegistry, copilotToolRegistry } from "@/core/copilot";
import type { Skill, PlatformTool } from "@/core/copilot";

const DASHBOARD_SKILLS: Skill[] = [
  {
    id: "explain-kpi",
    name: "Explain KPI",
    description: "Explain what a Dashboard KPI means and why it changed",
    category: "platform",
    engineRef: "DashboardEngine",
    toolIds: ["explain-kpi"],
    triggers: ["explain this kpi", "what does this metric mean", "why did this change"],
    enabled: true,
  },
  {
    id: "summarize-dashboard",
    name: "Summarize Dashboard",
    description: "Generate an executive summary of the current Dashboard state",
    category: "platform",
    engineRef: "DashboardEngine",
    toolIds: ["summarize-dashboard"],
    triggers: ["summarize my dashboard", "executive summary", "give me an overview"],
    enabled: true,
  },
  {
    id: "show-pending-approvals",
    name: "Show Pending Approvals",
    description: "List items awaiting approval and overdue workflow items",
    category: "platform",
    engineRef: "WorkflowEngine",
    toolIds: ["show-pending-approvals"],
    triggers: ["what needs my approval", "show pending approvals", "what's overdue"],
    enabled: true,
  },
  {
    id: "navigate-dashboard",
    name: "Navigate Dashboard",
    description: "Navigate to another module or section from the Dashboard",
    category: "platform",
    engineRef: "ModuleRegistry",
    toolIds: ["navigate-dashboard"],
    triggers: ["take me to", "open", "go to", "navigate to"],
    enabled: true,
  },
];

const DASHBOARD_TOOLS: PlatformTool[] = [
  {
    id: "explain-kpi",
    name: "Explain KPI",
    description: "Explain what a Dashboard KPI means and why it changed",
    category: "platform",
    provider: "engine",
    providerRef: "DashboardEngine",
    capabilities: [{ name: "kpi-explanation" }],
    isActive: true,
  },
  {
    id: "summarize-dashboard",
    name: "Summarize Dashboard",
    description: "Generate an executive summary of the current Dashboard state",
    category: "platform",
    provider: "engine",
    providerRef: "DashboardEngine",
    capabilities: [{ name: "dashboard-summary" }],
    isActive: true,
  },
  {
    id: "show-pending-approvals",
    name: "Show Pending Approvals",
    description: "List items awaiting approval and overdue workflow items",
    category: "platform",
    provider: "engine",
    providerRef: "WorkflowEngine",
    capabilities: [{ name: "approvals-lookup" }],
    isActive: true,
  },
  {
    id: "navigate-dashboard",
    name: "Navigate Dashboard",
    description: "Navigate to another module or section from the Dashboard",
    category: "platform",
    provider: "engine",
    providerRef: "ModuleRegistry",
    capabilities: [{ name: "module-navigation" }],
    isActive: true,
  },
];

let registered = false;

/** Safe to call more than once. Registers metadata only — no handlers, no LLM execution. */
export function registerDashboardSkills(): void {
  if (registered) return;
  for (const tool of DASHBOARD_TOOLS) copilotToolRegistry.register(tool);
  for (const skill of DASHBOARD_SKILLS) skillRegistry.register(skill);
  registered = true;
}
