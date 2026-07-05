/**
 * Calixo Platform - Enterprise Users & Teams Platform Foundation
 *
 * Reusable, module-agnostic identity building blocks: user/team
 * registries, hierarchy, engine, invitations, presence, activity,
 * directory search, validation, and a storage abstraction. Modules
 * integrate by calling `registerUsers()`/`registerTeams()` — nothing here
 * should ever require modification to support a new module, workspace, or
 * identity provider.
 *
 * This is the foundation only: no UI, no authentication/SSO/OAuth, no
 * real persistence.
 */

export * from "./types/index";

export { UserRegistry, userRegistry, registerUsers } from "./registry/UserRegistry";
export type { UserListParams, UserSearchParams } from "./registry/UserRegistry";

export { TeamRegistry, teamRegistry, registerTeams } from "./teams/TeamRegistry";
export type { TeamListParams } from "./teams/TeamRegistry";

export { UserEngine, userEngine } from "./engine/UserEngine";

export { InvitationEngine, invitationEngine } from "./invitation/InvitationEngine";
export type { CreateInvitationInput } from "./invitation/InvitationEngine";

export { PresenceEngine, presenceEngine } from "./presence/PresenceEngine";

export { ActivityEngine, activityEngine } from "./activity/ActivityEngine";

export { DirectorySearchEngine, directorySearchEngine } from "./directory/DirectorySearchEngine";

export { UserValidationEngine, userValidationEngine } from "./validation/UserValidationEngine";

export { MemoryUserStorageProvider, memoryUserStorageProvider } from "./storage/UserStorageProvider";

export { registerUsersSkills } from "./skills/registerUsersSkills";

export { seedUsersPlatformMockData } from "./mock/seed";
export type { UsersMockSeedResult } from "./mock/seed";
export { generateMockUsers } from "./mock/mockUsers";
export { generateMockTeams } from "./mock/mockTeams";
export { generateMockInvitations } from "./mock/mockInvitations";
export { generateMockActivity } from "./mock/mockActivity";
export { WORKSPACES, DEPARTMENTS, JOB_TITLES } from "./mock/data";
export type { MockWorkspace } from "./mock/data";

let initialized = false;

/**
 * Flips the foundation's idempotency guard. Unlike Settings/Copilot, the
 * Users & Teams platform has no fixed built-in catalog (no canonical
 * "default users") — every record is opt-in via `seedUsersPlatformMockData()`
 * or a real integration's own `registerUsers()`/`registerTeams()` calls.
 * Safe to call more than once.
 */
export function initializeUsersFoundation(): void {
  if (initialized) return;
  initialized = true;
}
