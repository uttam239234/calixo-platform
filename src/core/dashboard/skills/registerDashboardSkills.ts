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
  {
    id: "morning-briefing",
    name: "Morning Briefing",
    description: "Generate a computed summary of KPIs, approvals, and goal status",
    category: "platform",
    engineRef: "DashboardEngine",
    toolIds: ["morning-briefing"],
    triggers: ["morning briefing", "daily summary", "give me a briefing"],
    enabled: true,
  },
  {
    id: "forecast-performance",
    name: "Forecast Performance",
    description: "Project revenue forward using a linear trend over the current period",
    category: "platform",
    engineRef: "DashboardEngine",
    toolIds: ["forecast-performance"],
    triggers: ["forecast performance", "project revenue", "what's the trend"],
    enabled: true,
  },
  {
    id: "detect-risks",
    name: "Detect Risks",
    description: "Surface threshold-based risks: overdue approvals, negative KPI trends, off-track goals",
    category: "platform",
    engineRef: "DashboardEngine",
    toolIds: ["detect-risks"],
    triggers: ["detect risks", "what needs attention", "any anomalies"],
    enabled: true,
  },
  {
    id: "manage-goals",
    name: "Manage Goals & Scorecards",
    description: "View goal progress, status, and benchmark comparisons",
    category: "platform",
    engineRef: "GoalEngine",
    toolIds: ["manage-goals"],
    triggers: ["show my goals", "how are we tracking", "scorecard"],
    enabled: true,
  },
  {
    id: "switch-dashboard",
    name: "Switch Dashboard",
    description: "Switch the active dashboard layout (Executive, Marketing, Performance, etc.)",
    category: "platform",
    engineRef: "DashboardLayoutRegistry",
    toolIds: ["switch-dashboard"],
    triggers: ["switch to executive dashboard", "show marketing dashboard", "change dashboard view"],
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
  {
    id: "morning-briefing",
    name: "Morning Briefing",
    description: "Generate a computed summary of KPIs, approvals, and goal status",
    category: "platform",
    provider: "engine",
    providerRef: "DashboardEngine",
    capabilities: [{ name: "briefing-generation" }],
    isActive: true,
  },
  {
    id: "forecast-performance",
    name: "Forecast Performance",
    description: "Project revenue forward using a linear trend over the current period",
    category: "platform",
    provider: "engine",
    providerRef: "DashboardEngine",
    capabilities: [{ name: "revenue-forecast" }],
    isActive: true,
  },
  {
    id: "detect-risks",
    name: "Detect Risks",
    description: "Surface threshold-based risks: overdue approvals, negative KPI trends, off-track goals",
    category: "platform",
    provider: "engine",
    providerRef: "DashboardEngine",
    capabilities: [{ name: "risk-detection" }],
    isActive: true,
  },
  {
    id: "manage-goals",
    name: "Manage Goals & Scorecards",
    description: "View goal progress, status, and benchmark comparisons",
    category: "platform",
    provider: "engine",
    providerRef: "GoalEngine",
    capabilities: [{ name: "goal-scorecard" }],
    isActive: true,
  },
  {
    id: "switch-dashboard",
    name: "Switch Dashboard",
    description: "Switch the active dashboard layout (Executive, Marketing, Performance, etc.)",
    category: "platform",
    provider: "engine",
    providerRef: "DashboardLayoutRegistry",
    capabilities: [{ name: "layout-switch" }],
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
