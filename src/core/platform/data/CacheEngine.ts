/**
 * Calixo Platform - Cache Platform
 *
 * Generalizes the Access Control Platform's `PermissionCache` TTL pattern
 * (proven last phase) into a reusable, named, generic entity/query/search
 * cache — rather than every module writing its own ad hoc TTL map, as
 * `PermissionCache` itself once had to. `PermissionCache` is untouched;
 * this is a new, separate, general-purpose sibling.
 */
import { platformEventBus } from "../events/PlatformEventBus";
import type { CacheEntry, CacheStats } from "./types";

const DEFAULT_TTL_MS = 60_000;

export class EntityCache<T = unknown> {
  private store = new Map<string, CacheEntry<T>>();
  private hits = 0;
  private misses = 0;

  constructor(private readonly ttlMs: number = DEFAULT_TTL_MS) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry || entry.expiresAt < Date.now()) {
      if (entry) this.store.delete(key);
      this.misses++;
      return undefined;
    }
    this.hits++;
    return entry.value;
  }

  set(key: string, value: T, ttlMs = this.ttlMs): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  /** Cache-aside helper: return the cached value, or compute + cache it. */
  async getOrSet(key: string, compute: () => Promise<T> | T, ttlMs = this.ttlMs): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) return cached;
    const value = await compute();
    this.set(key, value, ttlMs);
    return value;
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  clear(): void {
    this.store.clear();
  }

  stats(): CacheStats {
    return { size: this.store.size, hits: this.hits, misses: this.misses };
  }
}

/** Named registry of caches — one per repository/query/search concern, so callers don't have to thread cache instances around manually. */
export class CacheEngine {
  private caches = new Map<string, EntityCache>();

  named<T = unknown>(name: string, ttlMs?: number): EntityCache<T> {
    let cache = this.caches.get(name);
    if (!cache) {
      cache = new EntityCache(ttlMs);
      this.caches.set(name, cache);
    }
    return cache as EntityCache<T>;
  }

  async invalidateAll(name: string): Promise<void> {
    this.caches.get(name)?.clear();
    await platformEventBus.publish({ type: "CacheInvalidated", payload: { cache: name } });
  }

  count(): number {
    return this.caches.size;
  }

  /** Additive read-only accessor for the Observability Platform's Performance/Health wrappers — real per-cache hit/miss stats, not a new counter. */
  allStats(): Record<string, CacheStats> {
    const stats: Record<string, CacheStats> = {};
    for (const [name, cache] of this.caches) stats[name] = cache.stats();
    return stats;
  }
}

export const cacheEngine = new CacheEngine();
