/**
 * Calixo Platform - Teams Core Types
 */

export interface Team {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  parentTeamId?: string;
  childTeamIds: string[];
  memberIds: string[];
  managerId?: string;
  color?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TeamHierarchyNode {
  team: Team;
  children: TeamHierarchyNode[];
}
