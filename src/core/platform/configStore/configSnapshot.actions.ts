"use server";

/**
 * Calixo Platform - Platform Configuration Store: Read Snapshot Action
 *
 * Deliberately UNGATED (no `assertPlatformAdmin()`) — plan prices, tier
 * limits, credit packs, promotions, and experiment rollouts are the same
 * platform-wide, non-secret configuration every signed-in customer's
 * Billing/Upgrade Center/Copilot/Automations pages already read (today from
 * hardcoded defaults baked into the client bundle, which are equally public).
 * This is what `clientHydrate.ts` calls once per browser tab (via
 * `useCalixoIdentity.ts`/`PlatformAdminShell.tsx`) so those pages see the
 * SAME persisted values Platform Admin just saved, not the hardcoded seed.
 *
 * A `"use server"` file is a real bundling boundary in Next.js — the
 * `hydrateFromDisk()` import below (server-only, real `fs`) compiles into a
 * separate server chunk here, unlike a plain shared module reachable from a
 * client component, which is why THIS file (not a shared isomorphic
 * dispatcher) is the safe place to bridge realms.
 */
import { hydrateFromDisk } from "./serverHydrate";
import { buildPlatformConfigSnapshot } from "./buildSnapshot";
import type { PlatformConfigSnapshot } from "./types";

export async function getPlatformConfigSnapshotAction(): Promise<PlatformConfigSnapshot> {
  // Ensures the very first request in a freshly-started process has loaded disk state before answering, regardless of whether `resolveIdentity.server.ts` happened to run first in this process.
  hydrateFromDisk();
  return buildPlatformConfigSnapshot();
}
