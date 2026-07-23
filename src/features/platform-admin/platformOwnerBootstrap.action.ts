"use server";

/**
 * Calixo Platform - Platform Owner Bootstrap Check: Server Action Bridge
 *
 * `PLATFORM_OWNER_EMAILS` (src/identity/platformRole.ts) is sourced from a
 * non-public env var, so it always resolves empty in the browser bundle —
 * the client-side `InternalRoleProvider` can derive the Clerk-org-membership
 * roles (PLATFORM_ADMIN/PLATFORM_DEVELOPER) live from Clerk's own client
 * hooks, but it can never verify bootstrap PLATFORM_OWNER status on its own.
 *
 * This Server Action is the one bridge for that gap — same pattern as
 * `core/connectors/actions.ts` calling into `server-only`-tagged modules:
 * a `"use server"` export is safe to call from client-reachable code even
 * though the real check runs entirely server-side against the real,
 * Clerk-verified session. It intentionally returns only a boolean, never the
 * allowlist itself, so the email list never reaches the browser either way.
 *
 * This does not gate any real access — the actual enforcement is
 * `/platform-admin/layout.tsx`'s server-side `forbidden()` and
 * `AuthorizationPlatformAPI`'s bypass check, both of which already read
 * `resolvePlatformRoleServer()` directly. This action only feeds the
 * sidebar's "should the Platform section be visible" UX decision.
 */
import { currentUser } from "@clerk/nextjs/server";
import { derivePlatformRole } from "@/identity/platformRole";

export async function checkBootstrapPlatformOwnerAction(): Promise<boolean> {
  // TEMPORARY DEBUG INSTRUMENTATION — production Platform Owner detection
  // investigation. The try/catch is diagnostic scaffolding only: it does not
  // change the resulting value on any path (an exception here would already
  // have surfaced client-side as a rejected promise before this change,
  // silently leaving the caller's default state as "not owner" — identical
  // net outcome). It exists so a failure INSIDE this function body is
  // distinguishable in server logs from a failure in Next's own Server
  // Action dispatch/origin-validation layer, which would prevent this
  // function body from ever running at all (no log line would appear here
  // in that case — that absence is itself diagnostic).
  try {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress ?? null;
    console.log("[PlatformOwnerTrace] step3 clerk primary email (server action)", {
      clerkUserId: user?.id ?? null,
      email,
    });

    const role = derivePlatformRole({ email, orgSlug: null, orgRole: null, hasOrgMembership: false });
    const isOwner = role === "PLATFORM_OWNER";
    console.log("[PlatformOwnerTrace] step5 server action return value", { role, isOwner });
    return isOwner;
  } catch (error) {
    console.error("[PlatformOwnerTrace] step5 server action THREW", error);
    throw error;
  }
}
