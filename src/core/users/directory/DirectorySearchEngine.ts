/**
 * Calixo Platform - Directory Search Engine
 *
 * Ranked, multi-criteria search over the UserRegistry — keyword, email,
 * department, title, team, workspace, status, and tag matching combined
 * into a single score. Deliberately separate from UserRegistry.discover()/
 * .search(), which are plain unranked filters; this engine ranks and
 * combines multiple signals.
 */

import { userRegistry, UserRegistry } from "../registry/UserRegistry";
import type { DirectorySearchParams, DirectorySearchResult, DirectorySearchResultItem } from "../types/index";

export class DirectorySearchEngine {
  constructor(private registry: UserRegistry = userRegistry) {}

  search(params: DirectorySearchParams): DirectorySearchResult {
    const q = params.keyword?.trim().toLowerCase();
    const items: DirectorySearchResultItem[] = [];

    for (const user of this.registry.list()) {
      let score = 0;
      const matchedOn: string[] = [];

      if (q) {
        if (user.displayName.toLowerCase().includes(q)) {
          score += 5;
          matchedOn.push("displayName");
        }
        if (user.email.toLowerCase().includes(q)) {
          score += 4;
          matchedOn.push("email");
        }
        if (user.username.toLowerCase().includes(q)) {
          score += 4;
          matchedOn.push("username");
        }
        if (user.title.toLowerCase().includes(q)) {
          score += 2;
          matchedOn.push("title");
        }
        if (user.department.toLowerCase().includes(q)) {
          score += 2;
          matchedOn.push("department");
        }
      }
      if (params.email && user.email.toLowerCase() === params.email.toLowerCase()) {
        score += 5;
        matchedOn.push("email");
      }
      if (params.department && user.department === params.department) {
        score += 3;
        matchedOn.push("department");
      }
      if (params.title && user.title === params.title) {
        score += 3;
        matchedOn.push("title");
      }
      if (params.teamId && user.teamIds.includes(params.teamId)) {
        score += 3;
        matchedOn.push("team");
      }
      if (params.workspaceId && user.workspaceId === params.workspaceId) {
        score += 3;
        matchedOn.push("workspace");
      }
      if (params.status && user.status === params.status) {
        score += 3;
        matchedOn.push("status");
      }
      if (params.tag && user.tags.includes(params.tag)) {
        score += 3;
        matchedOn.push("tag");
      }

      const noCriteria = !q && !params.email && !params.department && !params.title && !params.teamId && !params.workspaceId && !params.status && !params.tag;
      if (score > 0 || noCriteria) {
        items.push({ user, score, matchedOn });
      }
    }

    items.sort((a, b) => b.score - a.score);
    return { query: params, total: items.length, items };
  }

  byKeyword(keyword: string): DirectorySearchResult {
    return this.search({ keyword });
  }

  byEmail(email: string): DirectorySearchResult {
    return this.search({ email });
  }

  byDepartment(department: string): DirectorySearchResult {
    return this.search({ department });
  }

  byTitle(title: string): DirectorySearchResult {
    return this.search({ title });
  }

  byTeam(teamId: string): DirectorySearchResult {
    return this.search({ teamId });
  }

  byWorkspace(workspaceId: string): DirectorySearchResult {
    return this.search({ workspaceId });
  }

  byStatus(status: DirectorySearchParams["status"]): DirectorySearchResult {
    return this.search({ status });
  }

  byTag(tag: string): DirectorySearchResult {
    return this.search({ tag });
  }
}

export const directorySearchEngine = new DirectorySearchEngine();
