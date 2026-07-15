/**
 * Calixo Platform - Internal Plan Management Console: Version + Audit + Undo
 *
 * The one place every one of the 8 sections' save handlers routes through
 * after performing its real engine write. Reuses two already-generic
 * engines rather than inventing new ones:
 *  - `versioningEngine` (`core/platform/data/VersioningEngine.ts`) for the
 *    Version Number + Rollback Point the brief requires.
 *  - `auditService` (`access/audit/AuditService.ts`) for the immutable
 *    audit trail — its own code confirms `eventType` is only ever compared
 *    by equality, so reusing the existing generic `entity_updated`/
 *    `entity_restored` values (rather than inventing plan-specific ones)
 *    stays additive-only.
 *
 * The 5-minute Undo window has no precedent anywhere in this codebase and
 * is built here from scratch: a small in-memory pending-undo map keyed by a
 * one-time token, expiring via `setTimeout`. Undo always re-applies the
 * pre-change value through the section's own real setter (`restore`) —
 * never a raw data bypass — and logs a second, real audit event.
 *
 * Every audit event this module writes is tagged with a reserved
 * `organizationId` sentinel (`PLATFORM_ADMIN_ORG_SENTINEL`) rather than left
 * blank — a blank `organizationId` already means something else elsewhere
 * (e.g. `SecretPlatformAPI`'s key-rotation events), so "undefined" isn't a
 * safe way to isolate Platform Admin actions from customer organizations in
 * the Audit Logs module. Real organization ids are `generateId()`-random and
 * can never collide with this literal string.
 */
import { versioningEngine } from "@/core/platform/data/VersioningEngine";
import { auditService } from "@/access/audit/AuditService";
import { entitlementService } from "@/core/platform/access";
import type { InternalRole } from "./internalRole";

export type RiskyChangeKind = "price_change" | "plan_deletion" | "feature_removal" | "credit_reduction";

/** Reserved `AuditEvent.organizationId` value for every Platform Admin console write — the Audit Logs module's "Platform Admin Logs" view is the only real consumer. */
export const PLATFORM_ADMIN_ORG_SENTINEL = "platform-admin";

const UNDO_WINDOW_MS = 5 * 60 * 1000;

interface PendingUndo {
  expiresAt: number;
  description: string;
  restore: () => void;
}

const pendingUndos = new Map<string, PendingUndo>();

export interface CommitPlanChangeParams<T> {
  entityType: string;
  entityId: string;
  before: T;
  after: T;
  actor: InternalRole;
  description: string;
  /** Set for the 4 flagged risky action types — enables the 5-minute Undo window. */
  risky?: RiskyChangeKind;
  /** The real setter to call on undo, re-applying `before`. Required alongside `risky`. */
  restore?: (before: T) => void;
}

export interface CommitPlanChangeResult {
  undoToken?: string;
  undoWindowMs?: number;
}

export async function commitPlanChange<T>(params: CommitPlanChangeParams<T>): Promise<CommitPlanChangeResult> {
  const { entityType, entityId, before, after, actor, description, risky, restore } = params;

  await versioningEngine.snapshot(entityType, entityId, after, actor, description);
  await auditService.recordEvent({
    organizationId: PLATFORM_ADMIN_ORG_SENTINEL,
    userId: actor,
    eventType: "entity_updated",
    resource: entityType,
    resourceId: entityId,
    description,
    changes: { before, after },
  });
  // Every one of the 8 Plan Management Console sections writes tier-wide or
  // platform-wide configuration (a plan's price/limits/modules, a credit
  // pack, an experiment flag, ...) — there's no cheap way from this generic
  // layer to know which organizations a given `entityType` touches, so
  // invalidate every cached entitlement decision platform-wide rather than
  // risk a stale "allowed" surviving past the change that just made it
  // false (or vice versa). This is what makes "propagates immediately, no
  // deployment required" real for the very next request, not just true in
  // the underlying registry.
  entitlementService.invalidateAll();

  if (!risky || !restore) return {};

  const token = `${entityType}:${entityId}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  pendingUndos.set(token, {
    expiresAt: Date.now() + UNDO_WINDOW_MS,
    description,
    restore: () => {
      restore(before);
      entitlementService.invalidateAll();
      void versioningEngine.snapshot(entityType, entityId, before, actor, `Undo: ${description}`);
      void auditService.recordEvent({
        organizationId: PLATFORM_ADMIN_ORG_SENTINEL,
        userId: actor,
        eventType: "entity_restored",
        resource: entityType,
        resourceId: entityId,
        description: `Undo: ${description}`,
        changes: { before: after, after: before },
      });
    },
  });
  setTimeout(() => pendingUndos.delete(token), UNDO_WINDOW_MS);

  return { undoToken: token, undoWindowMs: UNDO_WINDOW_MS };
}

/** Returns `true` if the undo was applied, `false` if the token is unknown or its 5-minute window has already elapsed. */
export function undoPlanChange(token: string): boolean {
  const pending = pendingUndos.get(token);
  pendingUndos.delete(token);
  if (!pending || Date.now() > pending.expiresAt) return false;
  pending.restore();
  return true;
}

export function getPlanChangeHistory(entityType: string, entityId: string) {
  return versioningEngine.getHistory(entityType, entityId);
}

/** Restores an arbitrary older version (not just the immediately-preceding one) — the brief's "Restore Previous Version." `apply` is the section's real setter. */
export function restorePlanChangeVersion<T>(entityType: string, entityId: string, version: number, apply: (data: T) => void): boolean {
  const snapshot = versioningEngine.getSnapshotForRestore(entityType, entityId, version);
  if (snapshot === undefined) return false;
  apply(snapshot as T);
  return true;
}
