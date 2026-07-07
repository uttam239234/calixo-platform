/**
 * Calixo Platform - Normalization Platform
 *
 * Converts vendor-shaped raw records into Calixo's Universal Data Model,
 * driven entirely by a connector manifest's `NormalizationMapping` — no
 * per-connector normalization code is required. Business modules consume
 * `UniversalRecord`s (Traffic/Revenue/Campaign/Lead/Conversion/Customer/
 * Content/Asset/Brand/Audience); they never see a vendor's raw shape.
 */
import { generateId } from "@/shared/utils/string";
import type { FieldMapping, NormalizationMapping, UniversalRecord } from "./types";

function getByPath(source: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
}

function applyFieldMapping(raw: Record<string, unknown>, fields: FieldMapping[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const mapping of fields) {
    const value = getByPath(raw, mapping.sourcePath);
    result[mapping.universalField] = value !== undefined ? value : mapping.defaultValue;
  }
  return result;
}

export class NormalizationEngine {
  private normalizedCount = 0;

  normalize(
    mapping: NormalizationMapping,
    rawRecords: Record<string, unknown>[],
    context: { sourceProviderId: string; sourceConnectionId: string; organizationId: string }
  ): UniversalRecord[] {
    const now = new Date().toISOString();
    const results = rawRecords.map(raw => {
      const mapped = applyFieldMapping(raw, mapping.fields);
      const record = {
        id: generateId(16),
        externalId: String(mapped.externalId ?? mapped.id ?? ""),
        sourceProviderId: context.sourceProviderId,
        sourceConnectionId: context.sourceConnectionId,
        organizationId: context.organizationId,
        normalizedAt: now,
        entity: mapping.universalEntity,
        raw,
        ...mapped,
      } as unknown as UniversalRecord;
      return record;
    });
    this.normalizedCount += results.length;
    return results;
  }

  count(): number {
    return this.normalizedCount;
  }
}

export const normalizationEngine = new NormalizationEngine();
