/**
 * Calixo Platform - Platform Configuration Store: Client-Side Hydration
 *
 * Safe to import directly from any `"use client"` file: this file never
 * touches `fs`/`server-only` code, even transitively — `configSnapshot.actions.ts`
 * is a `"use server"` boundary (Next.js compiles it into a same-origin POST
 * call in the client bundle, not the real server implementation), and
 * `applySnapshot.ts` is plain, isomorphic data plumbing. A Server Action
 * call is the ONLY way a browser tab can ever see disk-persisted state —
 * the tab's own copy of `subscriptionRegistry` etc. has no `fs` access and
 * never will.
 *
 * Called from `useCalixoIdentity.ts` (every customer-facing dashboard page)
 * and `PlatformAdminShell.tsx` (the console itself, which never goes
 * through `useCalixoIdentity()`).
 */
import { getPlatformConfigSnapshotAction } from "./configSnapshot.actions";
import { applyPlatformConfigSnapshot } from "./applySnapshot";

let hydrated = false;

export async function hydrateFromServerAction(): Promise<void> {
  if (hydrated) return;
  hydrated = true;
  const snapshot = await getPlatformConfigSnapshotAction();
  applyPlatformConfigSnapshot(snapshot);
}
