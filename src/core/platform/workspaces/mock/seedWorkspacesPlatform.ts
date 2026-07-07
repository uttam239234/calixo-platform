import { organizationRegistry } from "../../organizations/OrganizationRegistry";
import { workspaceRegistry } from "../WorkspaceRegistry";
import { workspaceEngine } from "../WorkspaceEngine";
import type { Workspace } from "../types";

/** Seeds 1-2 workspaces per already-seeded organization by driving `WorkspaceEngine.create()`. Requires `seedOrganizationsPlatformMockData()` to have run first. Idempotent; not auto-invoked. */
export interface WorkspacesMockSeedResult {
  workspaces: Workspace[];
}

let seeded = false;

export function seedWorkspacesPlatformMockData(): WorkspacesMockSeedResult {
  if (seeded) {
    return { workspaces: workspaceRegistry.list() };
  }
  seeded = true;

  const organizations = organizationRegistry.list();
  const created: Workspace[] = [];
  for (const organization of organizations) {
    created.push(workspaceEngine.create({ organizationId: organization.id, name: `${organization.name} — Core Team`, type: "team", isDefault: true }, organization.ownerId));
    if (organization.tier === "enterprise" || organization.tier === "growth") {
      created.push(workspaceEngine.create({ organizationId: organization.id, name: `${organization.name} — Client Projects`, type: "client" }, organization.ownerId));
    }
  }
  return { workspaces: created };
}
