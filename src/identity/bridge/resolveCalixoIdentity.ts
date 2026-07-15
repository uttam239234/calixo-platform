/**
 * Calixo Platform - Identity Bridge (Round 18, production identity migration)
 *
 * The single seam between a real, Clerk-verified identity and every
 * already-real business engine (`core/users`, `core/platform/organizations`,
 * `core/platform/workspaces`, and — downstream — `TenantContextService`/
 * `resourceAuthorizationAPI`/`entitlementEngine`). Nothing below this file
 * changes: only what fills in `userId`/`organizationId` does.
 *
 * Deliberately environment-agnostic (no `"use server"`/`"use client"`,
 * no Clerk import) so it can be called identically from:
 *   - the server (middleware, layouts, the API route handler) via
 *     `resolveIdentity()` (`resolveIdentity.server.ts`), and
 *   - the browser, via `useCalixoIdentity()` (`useCalixoIdentity.ts`).
 * Next.js bundles server code and client code into two separate module
 * graphs — the in-memory registries this app has always used are
 * per-bundle singletons, not shared across that boundary. Rather than a
 * large rework of the client data-fetching model, this function resolves
 * by the same STABLE, deterministic keys on both sides — email for users,
 * slug for organizations — so each side's independently-seeded registry
 * instance converges on "the same" record even though the generated
 * (randomly-suffixed) ids differ between instances. This mirrors how this
 * app has always worked: every client hook already re-derives its own view
 * rather than trusting a server-resolved id passed over the wire.
 *
 * JIT provisioning mirrors `useInvitations.ts`'s `accept()` exactly (same
 * `User` shape, same `userRegistry.register()` call) — that was already the
 * established "create a real person on first real contact" pattern in this
 * codebase, just triggered by an invitation instead of a sign-in.
 *
 * Deliberately does NOT auto-attach a real signer to the rich pre-seeded
 * demo roster (`seedOrganizationsPlatformMockData`/`seedUsersPlatformMockData`
 * — Royal Global University / Calixo Technologies / MIT WPU / Agency Client
 * A). That mock roster remains reachable for illustration, but silently
 * mapping any specific real email onto it would itself be exactly the kind
 * of hardcoded shortcut this migration exists to remove. A first-time real
 * sign-in gets a fresh, minimal, genuinely-owned organization — the same
 * onboarding shape as any real multi-tenant product.
 */
import { generateId } from "@/shared/utils/string";
import { initializePlatformFoundation } from "@/core/platform";
import { userRegistry, activityEngine } from "@/core/users";
import type { User, PeopleAccessLevel } from "@/core/users";
import { organizationRegistry, organizationEngine } from "@/core/platform/organizations";
import type { OrganizationMemberRole } from "@/core/platform/organizations";
import { workspacePlatformAPI } from "@/core/platform/workspaces";
import { rolePlatformAPI } from "@/core/platform/access";
import { derivePlatformRole } from "@/identity/platformRole";

export interface ResolveIdentityInput {
  clerkUserId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string;
  /** Absent until the signed-in user has created/selected a Clerk organization. */
  clerkOrgId?: string | null;
  orgName?: string | null;
  /** Clerk's org role for this membership (e.g. "admin"/"member") — absent alongside `clerkOrgId`. */
  orgRole?: string | null;
  /** The Clerk organization's own slug — same value `derivePlatformRole()` checks against `CALIXO_STAFF_ORG_SLUG`. Threading this through here (rather than re-deriving platform role separately at every call site) is what lets `AuthorizationPlatformAPI` read a single, always-fresh `User.metadata.platformRole` stamp instead of needing its own Clerk-aware logic. */
  orgSlug?: string | null;
}

export interface ResolvedIdentity {
  userId: string;
  organizationId: string;
  isNewUser: boolean;
  isNewOrganization: boolean;
}

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Clerk's default Organizations role model is admin/member — coarser than Calixo's owner/admin/member/guest. Refined by call-site logic (e.g. org creator becomes "owner") where that distinction matters. */
function mapClerkOrgRole(clerkRole?: string | null): OrganizationMemberRole {
  if (!clerkRole) return "member";
  return clerkRole.toLowerCase().includes("admin") ? "admin" : "member";
}

const ACCESS_LEVEL_FOR_ORG_ROLE: Record<OrganizationMemberRole, PeopleAccessLevel> = {
  owner: "owner",
  admin: "administrator",
  member: "member",
  guest: "viewer",
};

/**
 * Maps a Calixo organization role onto the real RBAC "business role"
 * (`core/platform/access/mock/seedBusinessRoles.ts`) with the matching
 * name — the same 5-role vocabulary `PeopleAccessLevel` already displays.
 * "Owner" carries `permissions: ['*']`.
 */
const BUSINESS_ROLE_NAME_FOR_ORG_ROLE: Record<OrganizationMemberRole, string> = {
  owner: "Owner",
  admin: "Administrator",
  member: "Member",
  guest: "Viewer",
};

let foundationReady: Promise<void> | null = null;

/**
 * Was previously fire-and-forget (`void initializePlatformFoundation()`),
 * safe only because nothing downstream in this file depended on the
 * foundation having actually finished — `ensureBusinessRoleAssignment()`
 * now does (it needs `seedBusinessRoles()`'s "Owner" role to already exist),
 * so this must genuinely await completion before returning.
 */
function ensureFoundation(): Promise<void> {
  if (!foundationReady) foundationReady = initializePlatformFoundation();
  return foundationReady;
}

/**
 * Root-cause fix: JIT-provisioned users previously never received any real
 * `UserRoleAssignment` — `User.roleIds`/`.permissions` are stamped empty at
 * creation (see `findOrCreateUser()` below) and nothing else ever populated
 * them, so `roleService.getUserPermissions()` returned `[]` for EVERY real
 * signed-up user, not just platform staff — any authorization check beyond
 * "is anyone signed in" silently failed for every real customer. Idempotent
 * (checked against existing assignments) and safe to call on every
 * resolution, not just first contact, so a later org-role change (e.g.
 * promoted from Member to Administrator) picks up the matching business
 * role too.
 */
async function ensureBusinessRoleAssignment(userId: string, organizationId: string, orgRole: OrganizationMemberRole): Promise<void> {
  const roleName = BUSINESS_ROLE_NAME_FOR_ORG_ROLE[orgRole];
  const businessRole = (await rolePlatformAPI.getAllRoles()).find(r => r.name === roleName);
  if (!businessRole) return;

  const existingAssignments = await rolePlatformAPI.getUserRoles(userId, organizationId);
  if (existingAssignments.some(a => a.roleId === businessRole.id)) return;

  await rolePlatformAPI.assignRoleToUser({ userId, roleId: businessRole.id, organizationId, grantedBy: "system:jit-provisioning" });
}

function findOrCreateUser(input: ResolveIdentityInput, organizationId: string, workspaceId: string, role: OrganizationMemberRole): { user: User; isNew: boolean } {
  const existing = userRegistry.lookupByEmail(input.email);
  if (existing) return { user: existing, isNew: false };

  const [emailLocal] = input.email.split("@");
  const displayName = [input.firstName, input.lastName].filter(Boolean).join(" ").trim() || emailLocal;
  const now = new Date().toISOString();

  const user: User = {
    id: `user-${generateId(10)}`,
    username: `${emailLocal}${generateId(4)}`.toLowerCase(),
    displayName,
    email: input.email,
    avatar: input.imageUrl,
    title: role === "owner" ? "Owner" : "Team Member",
    department: "General",
    status: "active",
    presence: "online",
    timezone: "UTC",
    locale: "en-US",
    language: "en",
    organizationId,
    workspaceId,
    teamIds: [],
    accessLevel: ACCESS_LEVEL_FOR_ORG_ROLE[role],
    roleIds: [],
    permissions: [],
    featureFlags: [],
    tags: [],
    preferences: {},
    metadata: { clerkUserId: input.clerkUserId },
    createdAt: now,
    updatedAt: now,
  };
  userRegistry.register(user);
  return { user, isNew: true };
}

function findOrCreateOrganization(input: ResolveIdentityInput, ownerId: string): { organization: ReturnType<typeof organizationEngine.create>; isNew: boolean } {
  if (input.clerkOrgId) {
    const byClerkId = organizationRegistry.lookupByClerkOrgId(input.clerkOrgId);
    if (byClerkId) return { organization: byClerkId, isNew: false };
  }

  const name = input.orgName?.trim();
  if (name) {
    const bySlug = organizationRegistry.lookupBySlug(slugify(name));
    if (bySlug) {
      if (input.clerkOrgId) organizationRegistry.linkClerkOrg(bySlug.id, input.clerkOrgId);
      return { organization: bySlug, isNew: false };
    }
  }

  const organization = organizationEngine.create({
    name: name || "My Organization",
    ownerId,
    clerkOrgId: input.clerkOrgId ?? undefined,
  });
  return { organization, isNew: true };
}

/** Reverse lookup for the Clerk webhook handler — finds the Calixo User a given Clerk user id was JIT-provisioned into (stamped in `metadata.clerkUserId` at creation time). Small, demo-scale linear scan; add a dedicated index if the user directory ever grows large. */
export function findCalixoUserByClerkId(clerkUserId: string): User | undefined {
  return userRegistry.list().find(u => u.metadata?.clerkUserId === clerkUserId);
}

/**
 * The core resolution — takes a real, already-verified Clerk identity and
 * returns the real Calixo `userId`/`organizationId` every downstream engine
 * should use. Idempotent and safe to call on every request; JIT-provisions
 * only on genuine first contact. Async since Round 20's investigation found
 * two real gaps that both need awaiting real work here: the RBAC role
 * assignment fix (`ensureBusinessRoleAssignment`) and properly awaiting
 * foundation init (previously fire-and-forget).
 */
export async function resolveCalixoIdentity(input: ResolveIdentityInput): Promise<ResolvedIdentity> {
  await ensureFoundation();

  const existingUser = userRegistry.lookupByEmail(input.email);

  // Resolve the organization first when possible (an existing user's own membership takes priority over creating a new org for them).
  let organizationId: string | undefined;
  let isNewOrganization = false;

  if (input.clerkOrgId) {
    const orgResult = findOrCreateOrganization(input, existingUser?.id ?? "pending");
    organizationId = orgResult.organization.id;
    isNewOrganization = orgResult.isNew;
  } else if (existingUser) {
    organizationId = existingUser.organizationId;
  }

  const role = mapClerkOrgRole(input.orgRole);

  if (!organizationId) {
    // No Clerk org selected yet and no existing Calixo membership — a genuinely first-time signer gets their own real organization, same as any real product's onboarding.
    const orgResult = findOrCreateOrganization({ ...input, orgName: input.orgName ?? `${input.firstName ?? "My"}'s Organization` }, existingUser?.id ?? "pending");
    organizationId = orgResult.organization.id;
    isNewOrganization = orgResult.isNew;
  }

  const organization = organizationRegistry.lookup(organizationId)!;
  const isOwner = isNewOrganization || organization.ownerId === existingUser?.id;
  const resolvedRole: OrganizationMemberRole = isOwner ? "owner" : role;

  const workspaces = workspacePlatformAPI.list({ organizationId });
  const defaultWorkspace = workspaces.find(w => w.isDefault) ?? workspaces[0];
  const workspaceId = defaultWorkspace?.id ?? workspacePlatformAPI.create({ organizationId, name: "General", isDefault: true }, existingUser?.id ?? "system").id;

  const { user, isNew: isNewUser } = findOrCreateUser(input, organizationId, workspaceId, resolvedRole);

  const isMember = organizationEngine.getMembers(organizationId).some(m => m.userId === user.id);
  if (!isMember) {
    organizationEngine.addMember(organizationId, user.id, resolvedRole);
    activityEngine.record(user.id, organizationId, "organization-joined", `Joined ${organization.name}`);
  }

  await ensureBusinessRoleAssignment(user.id, organizationId, resolvedRole);

  // Always recomputed and overwritten (not "only if unset") so a revoked bootstrap email or
  // changed staff-org membership takes effect on the very next resolution, not just the first.
  user.metadata = { ...user.metadata, platformRole: derivePlatformRole({ email: input.email, orgSlug: input.orgSlug ?? null, orgRole: input.orgRole ?? null, hasOrgMembership: !!input.clerkOrgId }) };

  return { userId: user.id, organizationId, isNewUser, isNewOrganization };
}
