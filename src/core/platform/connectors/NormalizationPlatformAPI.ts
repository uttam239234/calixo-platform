/**
 * Calixo Platform - Normalization Platform API
 *
 * Wraps `NormalizationEngine` for raw->Universal conversion, plus queries
 * over the persisted Universal records (via Phase 4's
 * `PersistencePlatformAPI`) — the shape AI/Analytics/Reports should read,
 * never a vendor's raw payload.
 */
import { normalizationEngine } from "./NormalizationEngine";
import { persistencePlatformAPI, type BaseEntity, type QueryObject } from "@/core/platform/data";
import type { NormalizationMapping, UniversalEntityType, UniversalRecord } from "./types";

export class NormalizationPlatformAPI {
  normalize(mapping: NormalizationMapping, rawRecords: Record<string, unknown>[], context: { sourceProviderId: string; sourceConnectionId: string; organizationId: string }): UniversalRecord[] {
    return normalizationEngine.normalize(mapping, rawRecords, context);
  }

  async query(entity: UniversalEntityType, query: QueryObject) {
    return persistencePlatformAPI.query<UniversalRecord & BaseEntity>(`universal_${entity}`, query);
  }

  count(): number {
    return normalizationEngine.count();
  }
}

export const normalizationPlatformAPI = new NormalizationPlatformAPI();
