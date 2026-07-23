/**
 * Calixo Platform - Platform Role Model
 *
 * The single source of truth for "what platform role does this identity
 * have" — deliberately environment-agnostic (no "use client"/"use server",
 * no Clerk import), the same shape as `identity/bridge/resolveCalixoIdentity()`.
 * Lives under `src/identity/` (not `features/platform-admin/`) so it can be
 * imported from BOTH directions without a layering violation:
 *  - `identity/bridge/resolveCalixoIdentity.ts` stamps the resolved role onto
 *    the Calixo `User` record on every identity resolution (client or server).
 *  - `core/platform/access/AuthorizationPlatformAPI.ts` reads that stamp to
 *    decide the PLATFORM_OWNER/PLATFORM_ADMIN full-access bypass — `core/`
 *    must not depend on `features/`, but depending on `identity/` (a peer
 *    foundational layer) is fine.
 *  - `features/platform-admin/internalRole.tsx` (client) and
 *    `resolvePlatformRole.server.ts` (server) re-export/call this for the
 *    route-gating and audit-logging use cases from earlier this session.
 *
 * PLATFORM ROLES exist globally, independent of any one organization.
 * ORGANIZATION ROLES (ORG_OWNER/ORG_ADMIN/MANAGER/MEMBER/VIEWER — the
 * existing `OrganizationMemberRole` in `core/platform/organizations/types.ts`)
 * are a separate, pre-existing concept scoped to a single organization's
 * membership and are untouched by this file.
 */

export type InternalRole = "PLATFORM_OWNER" | "PLATFORM_ADMIN" | "PLATFORM_SUPPORT" | "PLATFORM_DEVELOPER" | "NONE";

export const INTERNAL_ROLE_LABELS: Record<InternalRole, string> = {
  PLATFORM_OWNER: "Platform Owner",
  PLATFORM_ADMIN: "Platform Admin",
  PLATFORM_SUPPORT: "Platform Support",
  PLATFORM_DEVELOPER: "Platform Developer",
  NONE: "No Platform Role",
};

/** Any real platform role — used for broad "is this person platform staff at all" checks (e.g. the Audit Logs module's Platform Admin Logs panel visibility). */
export const INTERNAL_STAFF_ROLES: InternalRole[] = ["PLATFORM_OWNER", "PLATFORM_ADMIN", "PLATFORM_SUPPORT", "PLATFORM_DEVELOPER"];

/** The narrower set allowed to actually reach `/platform-admin/*`, `/internal/*`, `/developer/*` — PLATFORM_SUPPORT and PLATFORM_DEVELOPER are real platform staff but do not get console/route access. */
export const PLATFORM_ADMIN_ROUTE_ROLES: InternalRole[] = ["PLATFORM_OWNER", "PLATFORM_ADMIN"];

/** The set that bypasses RBAC/ABAC/subscription/feature-gating entirely in `AuthorizationPlatformAPI` — "Platform Owner must always have unrestricted access to all modules and settings," and Platform Admin the same, per explicit instruction. Same two roles as the route-access set today, kept as a separate constant since the two concerns (which roles reach the admin console vs. which roles bypass authorization everywhere) are conceptually independent even though currently identical. */
export const PLATFORM_BYPASS_ROLES: InternalRole[] = ["PLATFORM_OWNER", "PLATFORM_ADMIN"];

/**
 * Bootstrap allowlist — the founder-access mechanism for before any real
 * "Calixo Internal" Clerk organization is set up (or before the founder's
 * own account is a member of it). Matched against the real, Clerk-verified
 * primary email only; never a display name, never a client-supplied header.
 *
 * Sourced from the `PLATFORM_OWNER_EMAILS` env var (comma-separated) — never
 * hardcoded — so the list can be changed per environment (dev/staging/prod)
 * without a code change or redeploy of logic, and later swapped for a real
 * database table by editing only this one parsing function; every caller of
 * `derivePlatformRole()`/`useInternalRole()`/`resolvePlatformRoleServer()`
 * stays unchanged either way.
 *
 * NOTE: this module has no "server-only"/"use client" boundary of its own
 * (kept environment-agnostic on purpose — see file header), so it is also
 * reachable from client-bundled code via `internalRole.tsx`. Next.js only
 * inlines `NEXT_PUBLIC_*` env vars into the browser bundle, so this list
 * always resolves empty on the client — by design, since the actual
 * allowlist must never ship to the browser. The one real, authoritative
 * evaluation always happens server-side (`resolvePlatformRoleServer()`,
 * `import "server-only"`), which is what every route/action gate actually
 * calls. `internalRole.tsx`'s client provider bridges the resulting gap for
 * the sidebar via a small Server Action — see its own comments.
 */
function parsePlatformOwnerEmails(raw: string | undefined): string[] {
  // TEMPORARY DEBUG INSTRUMENTATION — production Platform Owner detection
  // investigation. Runs once per process start (this is a module-level
  // const initializer). Remove once the failing step is identified.
  console.log("[PlatformOwnerTrace] step1 raw env value", { PLATFORM_OWNER_EMAILS_raw: raw, typeofRaw: typeof raw });
  if (!raw) return [];
  const parsed = raw
    .split(",")
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
  console.log("[PlatformOwnerTrace] step2 parsed email list", { parsed });
  return parsed;
}

export const PLATFORM_OWNER_EMAILS: string[] = parsePlatformOwnerEmails(process.env.PLATFORM_OWNER_EMAILS);

/** The future "Calixo Internal" Clerk organization's slug — PLATFORM_ADMIN/PLATFORM_DEVELOPER are derived from real membership in this org today; PLATFORM_OWNER additionally has the bootstrap allowlist above. Create this organization in the Clerk dashboard (or let it JIT-provision via the identity bridge) with this exact slug. */
export const CALIXO_STAFF_ORG_SLUG = "calixo-internal";

export interface DerivePlatformRoleInput {
  /** The real, Clerk-verified primary email — never a display name or client-supplied value. */
  email?: string | null;
  orgSlug?: string | null;
  /** Clerk's own org role for this membership (coarse admin/member) — absent if `hasOrgMembership` is false. */
  orgRole?: string | null;
  hasOrgMembership: boolean;
}

/**
 * The one real decision point. Order matters: the bootstrap allowlist is
 * checked FIRST and independently of any organization — this is exactly
 * what makes it a bootstrap (it must work even if "Calixo Internal" doesn't
 * exist yet, or the founder isn't a member of it yet).
 */
export function derivePlatformRole(input: DerivePlatformRoleInput): InternalRole {
  const normalizedEmail = input.email?.trim().toLowerCase();
  // TEMPORARY DEBUG INSTRUMENTATION — see parsePlatformOwnerEmails() above.
  const isBootstrapOwnerEmail = !!normalizedEmail && PLATFORM_OWNER_EMAILS.includes(normalizedEmail);
  console.log("[PlatformOwnerTrace] step4 comparison", {
    rawEmailInput: input.email,
    normalizedEmail,
    configuredEmails: PLATFORM_OWNER_EMAILS,
    isBootstrapOwnerEmail,
  });
  if (isBootstrapOwnerEmail) return "PLATFORM_OWNER";

  const isStaffOrg = input.orgSlug === CALIXO_STAFF_ORG_SLUG;
  const isStaffOrgAdmin = isStaffOrg && !!input.orgRole?.toLowerCase().includes("admin");
  const isStaffOrgMember = isStaffOrg && input.hasOrgMembership;

  if (isStaffOrgAdmin) return "PLATFORM_ADMIN";
  // PLATFORM_SUPPORT has no real assignment path yet — Clerk's own Organization Roles are a
  // coarse admin/member pair, and no brief so far specifies how Support is distinguished from
  // Developer. Defined here (type, label, staff-role membership) so it's ready for a future
  // custom Clerk org role without another migration, but never actually returned today —
  // disclosed, not silently faked.
  if (isStaffOrgMember) return "PLATFORM_DEVELOPER";
  return "NONE";
}
