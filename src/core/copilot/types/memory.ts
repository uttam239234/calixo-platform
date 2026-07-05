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
