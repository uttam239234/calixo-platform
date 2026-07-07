export * from "./types";
export { WorkspaceRegistry, workspaceRegistry } from "./WorkspaceRegistry";
export type { WorkspaceListParams } from "./WorkspaceRegistry";
export { WorkspaceEngine, workspaceEngine, WorkspaceIsolationError } from "./WorkspaceEngine";
export { WorkspacePlatformAPI, workspacePlatformAPI } from "./WorkspacePlatformAPI";
export { seedWorkspacesPlatformMockData } from "./mock/seedWorkspacesPlatform";
export type { WorkspacesMockSeedResult } from "./mock/seedWorkspacesPlatform";

let initialized = false;
export function initializeWorkspacesFoundation(): void {
  if (initialized) return;
  initialized = true;
}
