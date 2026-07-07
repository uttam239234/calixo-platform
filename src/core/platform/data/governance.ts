/**
 * Calixo Platform - Data Governance
 *
 * Real, working classification + retention policy registry. Legal Hold's
 * actual enforcement lives in `SoftDeleteEngine` (it gates `purge()`); this
 * registry is the catalog of policies, and where they attach per entity
 * type. PII tagging and data lineage are acknowledged in types only — no
 * scanner/lineage tracker exists (see Remaining Roadmap).
 */

export type DataClassification = "public" | "internal" | "confidential" | "restricted" | "pii";

export interface RetentionPolicy {
  entityType: string;
  classification: DataClassification;
  retentionDays: number;
  description?: string;
}

/** Declared, not implemented — no PII scanner or lineage graph exists this phase. */
export interface PiiTag {
  entityType: string;
  field: string;
}
export interface DataLineageEdge {
  fromEntityType: string;
  toEntityType: string;
  relationship: string;
}

export class DataGovernanceRegistry {
  private policies = new Map<string, RetentionPolicy>();

  registerPolicy(policy: RetentionPolicy): void {
    this.policies.set(policy.entityType, policy);
  }

  getPolicy(entityType: string): RetentionPolicy | undefined {
    return this.policies.get(entityType);
  }

  list(): RetentionPolicy[] {
    return Array.from(this.policies.values());
  }

  count(): number {
    return this.policies.size;
  }
}

export const dataGovernanceRegistry = new DataGovernanceRegistry();
