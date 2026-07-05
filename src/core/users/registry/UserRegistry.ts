/**
 * Calixo Platform - User Registry
 *
 * The central registry for every user in the enterprise directory. Users
 * are contributed by modules (present or future) — nothing here is
 * hardcoded to a specific module or workspace.
 */

import { appLogger } from "@/logging";
import type { User, UserStatus } from "../types/index";

export interface UserListParams {
  workspaceId?: string;
  teamId?: string;
  status?: UserStatus;
  department?: string;
}

export interface UserSearchParams extends UserListParams {
  keyword?: string;
}

export class UserRegistry {
  private users: Map<string, User> = new Map();

  register(user: User): void {
    if (this.users.has(user.id)) {
      appLogger.warn("Users.UserRegistry", `User ${user.id} already registered`);
      return;
    }
    this.users.set(user.id, user);
    appLogger.info("Users.UserRegistry", `User registered: ${user.username} (${user.workspaceId})`);
  }

  registerMany(users: User[]): void {
    for (const user of users) this.register(user);
  }

  unregister(id: string): void {
    this.users.delete(id);
  }

  lookup(id: string): User | undefined {
    return this.users.get(id);
  }

  lookupByEmail(email: string): User | undefined {
    const q = email.toLowerCase();
    return Array.from(this.users.values()).find(u => u.email.toLowerCase() === q);
  }

  lookupByUsername(username: string): User | undefined {
    const q = username.toLowerCase();
    return Array.from(this.users.values()).find(u => u.username.toLowerCase() === q);
  }

  list(params: UserListParams = {}): User[] {
    return Array.from(this.users.values())
      .filter(u => !params.workspaceId || u.workspaceId === params.workspaceId)
      .filter(u => !params.teamId || u.teamIds.includes(params.teamId!))
      .filter(u => !params.status || u.status === params.status)
      .filter(u => !params.department || u.department === params.department);
  }

  discover(query: string): User[] {
    const q = query.toLowerCase();
    return this.list().filter(
      u =>
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.title.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q)
    );
  }

  /** Simple structured + keyword filter. Distinct from DirectorySearchEngine's ranked, multi-signal search. */
  search(params: UserSearchParams): User[] {
    const base = this.list(params);
    return params.keyword ? base.filter(u => this.discover(params.keyword!).includes(u)) : base;
  }

  groupByTeam(): Partial<Record<string, User[]>> {
    const groups: Partial<Record<string, User[]>> = {};
    for (const user of this.users.values()) {
      for (const teamId of user.teamIds) {
        (groups[teamId] ??= []).push(user);
      }
    }
    return groups;
  }

  groupByWorkspace(): Partial<Record<string, User[]>> {
    const groups: Partial<Record<string, User[]>> = {};
    for (const user of this.users.values()) {
      (groups[user.workspaceId] ??= []).push(user);
    }
    return groups;
  }

  groupByStatus(): Partial<Record<UserStatus, User[]>> {
    const groups: Partial<Record<UserStatus, User[]>> = {};
    for (const user of this.users.values()) {
      (groups[user.status] ??= []).push(user);
    }
    return groups;
  }

  count(): number {
    return this.users.size;
  }
}

export const userRegistry = new UserRegistry();

/**
 * The single integration point future modules use to contribute users —
 * no Users platform code needs to change when a new module calls this.
 */
export function registerUsers(users: User[], registry: UserRegistry = userRegistry): void {
  registry.registerMany(users);
}
