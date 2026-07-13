/**
 * Calixo Platform - Integrations "Connected Apps Center": Connection Seed
 *
 * Gives each of the 4 seeded organizations a real, working set of Connected
 * Apps matching the brief's own worked examples exactly — Royal Global
 * University (Google Analytics, Google Ads, Meta) and Calixo Technologies
 * (Google Analytics, LinkedIn, HubSpot) — plus smaller, plausible sets for
 * MIT WPU and Agency Client A. Every connection is created through the real,
 * permission-gated `connectorPlatformAPI.install()` (audited, ownership-
 * tracked, event-published — the same path the Connect flow uses). Well
 * under every organization's real subscription connector limit (lowest is
 * Agency Client A's `starter` tier at 5 — confirmed against
 * `defaultTiers.ts` before writing this list).
 *
 * Acts as a real roster person with a real role assignment in that specific
 * organization — NOT `organization.ownerId` directly. `organization.ownerId`
 * ("user-current" for Royal Global University/Calixo Technologies) is a
 * *membership* record on the `Organization` itself; `seedRoleAssignmentsForRoster()`
 * grants real permission-checked roles to *roster* people, who use
 * org-specific synthetic ids (e.g. "user-royalglobal-owner", not
 * "user-current") except at Calixo Technologies, where the two coincide.
 * Using `organization.ownerId` for Royal Global University/MIT WPU/Agency
 * Client A would resolve to a user with zero role assignment in that org's
 * scope and fail `connector:create` — found via this round's own isolation
 * verification route, fixed by picking the roster's real "owner" (or
 * highest-privileged) person per organization instead.
 */
import { organizationRegistry } from "@/core/platform/organizations";
import { workspacePlatformAPI } from "@/core/platform/workspaces";
import { userRegistry } from "@/core/users";
import { PEOPLE_ACCESS_LEVELS } from "@/core/users";
import { tenantContextService } from "@/core/platform/tenant";
import { connectorPlatformAPI } from "@/core/platform/connectors";
import { grantWorkspaceAccess } from "./workspaceVisibility";

/** The roster's highest-privileged real person for an organization — the genuinely permission-checked actor for seeded mutations, in priority order (owner, then administrator, ...). */
function actingUserFor(organizationId: string, fallbackUserId: string): string {
  const people = userRegistry.list({ organizationId });
  for (const level of PEOPLE_ACCESS_LEVELS) {
    const person = people.find(p => p.accessLevel === level);
    if (person) return person.id;
  }
  return fallbackUserId;
}

const ORGANIZATION_PROVIDERS: Record<string, string[]> = {
  "Royal Global University": ["google-analytics-manifest", "google-ads", "meta-ads"],
  "Calixo Technologies": ["google-analytics-manifest", "linkedin-ads", "hubspot"],
  "MIT WPU": ["google-analytics-manifest", "instagram", "mailchimp"],
  "Agency Client A": ["google-analytics-manifest", "meta-ads"],
};

/**
 * The brief's own Workspace Model worked example uses "Marketing" and
 * "Admissions" — but Round 12's real seeded departments for Royal Global
 * University are Leadership/Admissions/Outreach (Marketing only exists at
 * Calixo Technologies; see `rosters.ts`). Substituted with the university's
 * own real departments, keeping the brief's shape intact: one workspace
 * sees the organization's full app set, another sees a narrower one.
 */
const WORKSPACE_VISIBILITY: Record<string, Record<string, string[]>> = {
  "Royal Global University": {
    Admissions: ["google-analytics-manifest", "meta-ads", "google-ads"],
    Outreach: ["google-analytics-manifest"],
  },
};

let seeded = false;

export async function seedOrganizationConnections(): Promise<void> {
  if (seeded) return;
  seeded = true;

  for (const organization of organizationRegistry.list()) {
    const providerIds = ORGANIZATION_PROVIDERS[organization.name];
    if (!providerIds) continue;

    const actorId = actingUserFor(organization.id, organization.ownerId);
    const tenantContext = await tenantContextService.resolve({ organizationId: organization.id, userId: actorId });
    const existing = await connectorPlatformAPI.getConnections(organization.id);
    const connectionByProvider = new Map(existing.map(c => [c.providerId, c]));

    for (const providerId of providerIds) {
      if (connectionByProvider.has(providerId)) continue;
      const connection = await connectorPlatformAPI.install(tenantContext, providerId, {});
      connectionByProvider.set(providerId, connection);
    }

    const workspaceGrants = WORKSPACE_VISIBILITY[organization.name];
    if (!workspaceGrants) continue;
    const workspaces = workspacePlatformAPI.list({ organizationId: organization.id });
    for (const [workspaceName, grantedProviderIds] of Object.entries(workspaceGrants)) {
      const workspace = workspaces.find(w => w.name === workspaceName);
      if (!workspace) continue;
      for (const providerId of grantedProviderIds) {
        const connection = connectionByProvider.get(providerId);
        if (connection) grantWorkspaceAccess(connection.id, workspace.id);
      }
    }
  }
}
