/**
 * Calixo Platform - Cache Platform API
 */
import { cacheEngine, type EntityCache } from "./CacheEngine";
import type { CacheStats } from "./types";

export class CachePlatformAPI {
  named<T = unknown>(name: string, ttlMs?: number): EntityCache<T> {
    return cacheEngine.named<T>(name, ttlMs);
  }

  async invalidate(name: string): Promise<void> {
    await cacheEngine.invalidateAll(name);
  }

  stats(name: string): CacheStats {
    return cacheEngine.named(name).stats();
  }
}

export const cachePlatformAPI = new CachePlatformAPI();
