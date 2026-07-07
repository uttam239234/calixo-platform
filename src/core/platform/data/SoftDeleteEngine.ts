/**
 * Calixo Platform - Soft Delete Platform
 *
 * `InMemoryRepository` already implements `softDelete()`/`restore()`/`purge()`
 * per-entity. This engine adds the cross-cutting policy layer the mandate
 * asks for on top of that: retention windows and legal holds that gate
 * whether `purge()` is actually allowed to run.
 */
import type { BaseEntity } from "./types";
import { repositoryRegistry } from "./RepositoryRegistry";

export interface RetentionRule {
  entityType: string;
  retentionDays: number;
}

export class SoftDeleteEngine {
  private retentionRules = new Map<string, number>();
  private legalHolds = new Set<string>();

  setRetention(entityType: string, retentionDays: number): void {
    this.retentionRules.set(entityType, retentionDays);
  }

  private holdKey(entityType: string, entityId: string): string {
    return `${entityType}:${entityId}`;
  }

  placeLegalHold(entityType: string, entityId: string): void {
    this.legalHolds.add(this.holdKey(entityType, entityId));
  }

  releaseLegalHold(entityType: string, entityId: string): void {
    this.legalHolds.delete(this.holdKey(entityType, entityId));
  }

  isUnderLegalHold(entityType: string, entityId: string): boolean {
    return this.legalHolds.has(this.holdKey(entityType, entityId));
  }

  /** Only allows a permanent purge once the entity has actually been soft-deleted, is past its retention window (if one is configured), and isn't under legal hold. */
  async purge<T extends BaseEntity>(entityType: string, entityId: string): Promise<{ purged: boolean; reason?: string }> {
    if (this.isUnderLegalHold(entityType, entityId)) {
      return { purged: false, reason: "Entity is under legal hold" };
    }

    const repo = repositoryRegistry.resolve<T>(entityType);
    const entity = await repo.getById(entityId);
    if (!entity) return { purged: false, reason: "Entity not found" };
    if (!entity.isDeleted || !entity.deletedAt) return { purged: false, reason: "Entity is not soft-deleted" };

    const retentionDays = this.retentionRules.get(entityType);
    if (retentionDays !== undefined) {
      const deletedAt = new Date(entity.deletedAt).getTime();
      const elapsedDays = (Date.now() - deletedAt) / (1000 * 60 * 60 * 24);
      if (elapsedDays < retentionDays) {
        return { purged: false, reason: `Retention window active: ${(retentionDays - elapsedDays).toFixed(1)} days remaining` };
      }
    }

    const purged = await repo.purge(entityId);
    return { purged };
  }

  count(): number {
    return this.legalHolds.size;
  }
}

export const softDeleteEngine = new SoftDeleteEngine();
