/**
 * Calixo Platform - Copilot Suggested Actions
 *
 * Per-agent contextual action chips shown under a response (the brief's
 * own worked examples: an Ads answer about rising CPA surfaces Investigate/
 * Create Report/Optimize/Notify; a Social answer about declining engagement
 * surfaces Create Content/Schedule/Report). Clicking a chip resends its
 * label as the next message — the same real pipeline handles it, no
 * separate action-execution path to keep in sync.
 */

export interface SuggestedAction {
  id: string;
  label: string;
}

const AGENT_ACTIONS: Record<string, SuggestedAction[]> = {
  "analytics-agent": [
    { id: "forecast", label: "Forecast this forward" },
    { id: "anomalies", label: "Check for anomalies" },
    { id: "report", label: "Create a report" },
  ],
  "advertising-agent": [
    { id: "investigate", label: "Investigate further" },
    { id: "report", label: "Create a report" },
    { id: "optimize", label: "Optimize this campaign" },
    { id: "notify", label: "Notify the team" },
  ],
  "social-agent": [
    { id: "create-content", label: "Create new content" },
    { id: "schedule", label: "Schedule posts" },
    { id: "report", label: "Create a report" },
  ],
  "brand-agent": [
    { id: "investigate", label: "Investigate mentions" },
    { id: "report", label: "Create a report" },
  ],
  "content-agent": [
    { id: "improve", label: "Improve this" },
    { id: "save", label: "Save to assets" },
  ],
  "reporting-agent": [
    { id: "export", label: "Export this report" },
    { id: "schedule", label: "Schedule delivery" },
  ],
  "workflow-agent": [
    { id: "approve", label: "Approve this" },
    { id: "reject", label: "Reject this" },
  ],
};

export function suggestedActionsFor(agentId?: string): SuggestedAction[] {
  if (!agentId) return [];
  return AGENT_ACTIONS[agentId] ?? [];
}
