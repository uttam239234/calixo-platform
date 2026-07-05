/**
 * Calixo Platform - Team Registry
 *
 * The central registry for every team in the enterprise directory,
 * including hierarchy traversal (parent/child chains). The `parentTeamId`
 * link is the source of truth for hierarchy — `childTeamIds` on a Team
 * record is a denormalized convenience only, never relied upon for
 * correctness here.
 */

import { appLogger } from "@/logging";
import type { Team, TeamHierarchyNode } from "../types/index";

export interface TeamListParams {
  workspaceId?: string;
}

export class TeamRegistry {
  private teams: Map<string, Team> = new Map();

  register(team: Team): void {
    if (this.teams.has(team.id)) {
      appLogger.warn("Users.TeamRegistry", `Team ${team.id} already registered`);
      return;
    }
    this.teams.set(team.id, team);
    appLogger.info("Users.TeamRegistry", `Team registered: ${team.name} (${team.workspaceId})`);
  }

  registerMany(teams: Team[]): void {
    for (const team of teams) this.register(team);
  }

  unregister(id: string): void {
    this.teams.delete(id);
  }

  lookup(id: string): Team | undefined {
    return this.teams.get(id);
  }

  discover(query: string): Team[] {
    const q = query.toLowerCase();
    return this.list().filter(t => t.name.toLowerCase().includes(q) || (t.description ?? "").toLowerCase().includes(q));
  }

  list(params: TeamListParams = {}): Team[] {
    return Array.from(this.teams.values()).filter(t => !params.workspaceId || t.workspaceId === params.workspaceId);
  }

  /** Direct children only, computed live from parentTeamId links (not the denormalized childTeamIds array). */
  childTeams(teamId: string): Team[] {
    return Array.from(this.teams.values()).filter(t => t.parentTeamId === teamId);
  }

  /** Ancestor chain from immediate parent up to the root, computed live from parentTeamId links. */
  parentTeams(teamId: string): Team[] {
    const chain: Team[] = [];
    const seen = new Set<string>([teamId]);
    let current = this.teams.get(teamId);
    while (current?.parentTeamId && !seen.has(current.parentTeamId)) {
      const parent = this.teams.get(current.parentTeamId);
      if (!parent) break;
      chain.push(parent);
      seen.add(parent.id);
      current = parent;
    }
    return chain;
  }

  /** Member IDs for a team. Cross-registry resolution to full User records is a hook-level concern. */
  teamMembers(teamId: string): string[] {
    return this.teams.get(teamId)?.memberIds ?? [];
  }

  /** Nested hierarchy tree, rooted at teams with no parent (or an unregistered parent), optionally scoped to a workspace. */
  hierarchy(workspaceId?: string): TeamHierarchyNode[] {
    const scoped = this.list(workspaceId ? { workspaceId } : {});
    const roots = scoped.filter(t => !t.parentTeamId || !this.teams.has(t.parentTeamId));
    const build = (team: Team): TeamHierarchyNode => ({
      team,
      children: this.childTeams(team.id)
        .filter(child => !workspaceId || child.workspaceId === workspaceId)
        .map(build),
    });
    return roots.map(build);
  }

  count(): number {
    return this.teams.size;
  }
}

export const teamRegistry = new TeamRegistry();

/**
 * The single integration point future modules use to contribute teams —
 * no Users platform code needs to change when a new module calls this.
 */
export function registerTeams(teams: Team[], registry: TeamRegistry = teamRegistry): void {
  registry.registerMany(teams);
}
