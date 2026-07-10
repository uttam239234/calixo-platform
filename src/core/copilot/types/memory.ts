/**
 * Calixo Platform - Copilot Memory Types
 *
 * Workspace context tracked per session: brand, campaign, audience,
 * platform, tone, region, current module, and recent activity.
 */

export interface WorkspaceContext {
  workspaceId?: string;
  brand?: string;
  campaign?: string;
  audience?: string;
  platform?: string;
  language?: string;
  tone?: string;
  region?: string;
  currentModule?: string;
  recentAssets: string[];
  recentReports: string[];
  recentWorkflows: string[];
  pinnedResources: string[];
  recentChats: string[];
}

export type RecentListField =
  | "recentAssets"
  | "recentReports"
  | "recentWorkflows"
  | "recentChats";

/**
 * Brand/tone/campaign preferences that persist across every conversation
 * in an organization, not just one session — the Memory Model's
 * "organization memory" layer.
 */
export interface OrganizationPreferences {
  preferredBrandId?: string;
  preferredTone?: string;
  defaultCampaignId?: string;
}
