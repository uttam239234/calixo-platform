import { organizationRegistry } from "../OrganizationRegistry";
import { organizationEngine } from "../OrganizationEngine";
import type { Organization } from "../types";

/**
 * Seeds a handful of demo organizations by genuinely driving
 * `OrganizationEngine.create()`/`invite()`/`addMember()` (not hand-built
 * objects) — the same "mock generation doubles as a live demonstration
 * the engine works" precedent used by every other platform foundation
 * this session (Reports' `ReportBuilder`, Users' `InvitationEngine`).
 * Idempotent — safe to call from a hook's `refresh()` on every render,
 * same as `seedAnalyticsDashboards()`/`seedAnalyticsSegments()`. Not
 * auto-invoked on import.
 */
export interface OrganizationsMockSeedResult {
  organizations: Organization[];
}

let seeded = false;

export function seedOrganizationsPlatformMockData(): OrganizationsMockSeedResult {
  if (seeded) {
    return { organizations: organizationRegistry.list() };
  }
  seeded = true;

  const acme = organizationEngine.create({ name: "Acme Marketing Group", ownerId: "user-1", tier: "enterprise" });
  const north = organizationEngine.create({ name: "Northwind Digital", ownerId: "user-2", tier: "growth" });
  const bright = organizationEngine.create({ name: "Brightline Studio", ownerId: "user-3", tier: "starter" });

  organizationEngine.addMember(acme.id, "user-4", "admin");
  organizationEngine.addMember(acme.id, "user-5", "member");
  organizationEngine.invite(acme.id, "new.hire@acme-marketing.com", "member", "user-1");

  organizationEngine.addMember(north.id, "user-6", "member");
  organizationEngine.invite(north.id, "contractor@northwind.digital", "guest", "user-2");

  return { organizations: [acme, north, bright] };
}
