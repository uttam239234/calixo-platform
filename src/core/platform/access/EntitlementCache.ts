/**
 * Calixo Platform - Entitlement Cache
 *
 * The first cache anywhere in `commercial`/`subscription`/`featureFlags` —
 * every one of those engines does a fresh `Map` read (and, for `QuotaEngine`,
 * a fresh linear scan of the usage ledger) on every single call today. This
 * is a generation-counter cache, not a naive TTL one: every organization has
 * its own generation counter, bumped by `invalidateOrganization()` on any
 * mutation that could change what that org is entitled to (plan change,
 * credit purchase/consumption, a Platform Admin edit to that org's own
 * overrides). A Platform Admin edit to a whole TIER (price, limits, which
 * modules a plan unlocks) can't cheaply enumerate "every org currently on
 * that tier" without a registry scan, so those call `invalidateAll()`
 * instead, bumping a single global counter every org's read implicitly
 * compares against. Either invalidation makes the very next read stale
 * immediately — no redeploy, no restart, matches the "propagate immediately"
 * mandate for the backend half of every request response (see
 * `EntitlementService`'s own doc comment for what "immediately" does and
 * doesn't cover for an already-open browser tab).
 *
 * A short TTL rides alongside the generation check purely as defense in
 * depth — if some future mutation path forgets to call an invalidation hook,
 * staleness still self-heals within `DEFENSIVE_TTL_MS` instead of forever.
 */

const DEFENSIVE_TTL_MS = 60_000;

interface CacheEntry<T> {
  value: T;
  generation: number;
  cachedAt: number;
}

class EntitlementCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private globalGeneration = 0;
  private orgGenerations = new Map<string, number>();

  private currentGeneration(organizationId: string): number {
    return this.globalGeneration * 1_000_000 + (this.orgGenerations.get(organizationId) ?? 0);
  }

  get<T>(organizationId: string, key: string): T | undefined {
    const cacheKey = `${organizationId}:${key}`;
    const entry = this.store.get(cacheKey);
    if (!entry) return undefined;
    const stale = entry.generation !== this.currentGeneration(organizationId) || Date.now() - entry.cachedAt > DEFENSIVE_TTL_MS;
    if (stale) {
      this.store.delete(cacheKey);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(organizationId: string, key: string, value: T): void {
    this.store.set(`${organizationId}:${key}`, { value, generation: this.currentGeneration(organizationId), cachedAt: Date.now() });
  }

  /** Plan change, credit purchase/consumption, an org-level override edit — anything that only affects this one organization's entitlements. */
  invalidateOrganization(organizationId: string): void {
    this.orgGenerations.set(organizationId, (this.orgGenerations.get(organizationId) ?? 0) + 1);
  }

  /** A Platform Admin edit to a tier's price/limits/modules/feature-gates, a credit pack, or a global experiment flag — affects every organization on that configuration, not just one. */
  invalidateAll(): void {
    this.globalGeneration += 1;
  }

  size(): number {
    return this.store.size;
  }
}

export const entitlementCache = new EntitlementCache();
