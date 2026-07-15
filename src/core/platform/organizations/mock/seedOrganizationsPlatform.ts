import { organizationRegistry } from "../OrganizationRegistry";
import { organizationEngine } from "../OrganizationEngine";
import type { Organization } from "../types";

/**
 * Seeds demo organizations by genuinely driving `OrganizationEngine.create()`/
 * `addMember()` (not hand-built objects) — the same "mock generation doubles
 * as a live demonstration the engine works" precedent used by every other
 * platform foundation this session. Idempotent — safe to call from a hook's
 * `refresh()` on every render. Not auto-invoked on import.
 *
 * Matches the Settings brief's own worked example exactly: one demo user
 * (`user-current`, the same fallback id used app-wide when no real login
 * session exists — see `TenantProviders.tsx`) belongs to 4 organizations
 * with 4 different roles, so the Organization Profile switcher has a real,
 * genuinely multi-org scenario to demonstrate out of the box.
 */
export interface OrganizationsMockSeedResult {
  organizations: Organization[];
}

const CURRENT_USER_ID = "user-current";

let seeded = false;

export function seedOrganizationsPlatformMockData(): OrganizationsMockSeedResult {
  if (seeded) {
    return { organizations: organizationRegistry.list() };
  }
  seeded = true;

  const royalGlobal = organizationEngine.create({
    name: "Royal Global University",
    ownerId: CURRENT_USER_ID,
    tier: "trial",
    profile: { email: "info@royalglobal.edu", website: "https://royalglobal.edu", industry: "Higher Education", companySize: "1,000-5,000" },
  });
  const calixoTech = organizationEngine.create({
    name: "Calixo Technologies",
    ownerId: CURRENT_USER_ID,
    tier: "enterprise",
    profile: { email: "hello@calixo.io", website: "https://calixo.io", industry: "Software", companySize: "51-200" },
  });
  const mitWpu = organizationEngine.create({
    name: "MIT WPU",
    ownerId: "user-2",
    tier: "growth",
    profile: { email: "contact@mitwpu.edu.in", website: "https://mitwpu.edu.in", industry: "Higher Education", companySize: "1,000-5,000" },
  });
  const agencyClientA = organizationEngine.create({
    name: "Agency Client A",
    ownerId: "user-3",
    tier: "starter",
    profile: { industry: "Marketing Agency", companySize: "11-50" },
  });

  // `user-current` is Owner of the two orgs it created above, plus a
  // Consultant (mapped to "admin") at MIT WPU and a Viewer (mapped to
  // "guest") at Agency Client A — the brief's own 4-organization,
  // 4-different-roles example.
  organizationEngine.addMember(mitWpu.id, CURRENT_USER_ID, "admin");
  organizationEngine.addMember(agencyClientA.id, CURRENT_USER_ID, "guest");

  return { organizations: [royalGlobal, calixoTech, mitWpu, agencyClientA] };
}
