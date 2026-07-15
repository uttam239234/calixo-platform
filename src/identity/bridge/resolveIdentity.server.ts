/**
 * Calixo Platform - Identity Bridge (server-side entry point)
 *
 * Server-only (Server Components, Route Handlers, `middleware.ts`). Calls
 * Clerk's real, cryptographically-verified session (`auth()`/`currentUser()`)
 * and hands the result to the shared, environment-agnostic
 * `resolveCalixoIdentity()` — see that file for the JIT-provisioning logic
 * and the cross-bundle resolution rationale.
 */
import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { resolveCalixoIdentity, type ResolvedIdentity } from "./resolveCalixoIdentity";
import { hydrateFromDisk } from "@/core/platform/configStore/serverHydrate";

/** Returns `null` when there is no signed-in Clerk session — callers decide whether that means redirect, 401, or a signed-out UI state. */
export async function resolveIdentity(): Promise<ResolvedIdentity | null> {
  const { userId: clerkUserId, orgId: clerkOrgId, orgRole, orgSlug } = await auth();
  if (!clerkUserId) return null;

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  if (!email) return null;

  // `auth()` only exposes the Active Organization's slug, not its full display name (that requires a separate Clerk API call this bridge deliberately avoids making on every request) — title-cased slug is a reasonable, readable stand-in for a freshly-created Calixo Organization's name.
  const orgName = orgSlug ? orgSlug.split("-").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ") : null;

  const identity = await resolveCalixoIdentity({
    clerkUserId,
    email,
    firstName: user?.firstName,
    lastName: user?.lastName,
    imageUrl: user?.imageUrl,
    clerkOrgId: clerkOrgId ?? null,
    orgName,
    orgRole: orgRole ?? null,
    orgSlug: orgSlug ?? null,
  });
  // Runs after `resolveCalixoIdentity()` so default tiers/flags/etc. are already seeded before any persisted override applies on top — see `serverHydrate.ts`'s own header for why this can't live inside that shared, isomorphic file instead.
  hydrateFromDisk();
  return identity;
}
