"use client";

/**
 * Calixo Platform - Identity Bridge (client-side entry point)
 *
 * The client-component counterpart to `resolveIdentity.server.ts` — uses
 * Clerk's own real, verified `useUser()`/`useOrganization()` (the session
 * Clerk already established; nothing re-authenticated here) and resolves
 * through the same shared `resolveCalixoIdentity()` used server-side. See
 * that file for why client and server each resolve independently against
 * their own registry instance rather than trusting an id passed over the
 * wire.
 *
 * `resolveCalixoIdentity()` can write (JIT-provision a user/organization) —
 * a side effect, so it runs inside `useEffect`, never inline during render.
 *
 * Replaces every module's own `sessionUser?.id ?? "<demo-constant>"`
 * fallback (`TenantProviders.tsx`'s `DEMO_CURRENT_USER_ID`,
 * `SettingsProvider.tsx`'s `SETTINGS_CURRENT_USER_ID`, and the same idiom
 * repeated per module) with one real, shared resolution.
 */
import { useEffect, useState } from "react";
import { useUser, useOrganization } from "@clerk/nextjs";
import { resolveCalixoIdentity, type ResolvedIdentity } from "./resolveCalixoIdentity";
import { hydrateFromServerAction } from "@/core/platform/configStore/clientHydrate";

export interface CalixoIdentity {
  loaded: boolean;
  signedIn: boolean;
  identity: ResolvedIdentity | null;
}

export function useCalixoIdentity(): CalixoIdentity {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  const { organization, membership, isLoaded: orgLoaded } = useOrganization();
  const [identity, setIdentity] = useState<ResolvedIdentity | null>(null);

  const userId = user?.id;
  const email = user?.primaryEmailAddress?.emailAddress;
  const clerkOrgId = organization?.id;
  const orgSlug = organization?.slug;
  const orgRole = membership?.role;

  useEffect(() => {
    (async () => {
      if (!userLoaded || !orgLoaded || !isSignedIn || !userId || !email) {
        setIdentity(null);
        return;
      }
      const orgName = orgSlug ? orgSlug.split("-").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ") : null;
      const resolved = await resolveCalixoIdentity({
        clerkUserId: userId,
        email,
        firstName: user?.firstName,
        lastName: user?.lastName,
        imageUrl: user?.imageUrl,
        clerkOrgId: clerkOrgId ?? null,
        orgName,
        orgRole: orgRole ?? null,
        orgSlug: orgSlug ?? null,
      });
      // Runs after `resolveCalixoIdentity()` so this tab's default-seeded registries (via `ensureFoundation()`) don't clobber persisted overrides applied here — a real `fs` read is impossible in the browser, so this goes through the Server Action `clientHydrate.ts` wraps.
      await hydrateFromServerAction();
      setIdentity(resolved);
    })();
  }, [userLoaded, orgLoaded, isSignedIn, userId, email, clerkOrgId, orgSlug, orgRole, user]);

  return { loaded: userLoaded && orgLoaded, signedIn: !!isSignedIn, identity };
}
