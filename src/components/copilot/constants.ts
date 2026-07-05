/**
 * Calixo AI Copilot Workspace - UI constants.
 *
 * There is no auth/workspace provider mounted in the app tree yet (the
 * same is true of the rest of the dashboard shell), so these mirror the
 * demo values already shown in the global Header ("Growth Engine").
 */

export const DEMO_WORKSPACE_ID = "workspace-growth-engine";
export const DEMO_WORKSPACE_NAME = "Growth Engine";
export const DEMO_USER_ID = "user-current";

export const COPILOT_MODULES = [
  { id: "dashboard", label: "Dashboard" },
  { id: "analytics", label: "Analytics" },
  { id: "content-studio", label: "Content Studio" },
  { id: "creative", label: "Creative" },
  { id: "workflow", label: "Workflow" },
  { id: "brand", label: "Brand" },
] as const;

export type CopilotModuleId = (typeof COPILOT_MODULES)[number]["id"];

export const SUGGESTED_PROMPTS_BY_MODULE: Record<CopilotModuleId, string[]> = {
  dashboard: ["Summarize KPIs", "Explain traffic changes"],
  analytics: ["Compare campaigns", "Identify anomalies"],
  "content-studio": ["Create Instagram carousel", "Generate blog"],
  creative: ["Create LinkedIn creative"],
  workflow: ["Show pending approvals"],
  brand: ["Check brand consistency"],
};
