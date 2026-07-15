/**
 * Calixo Platform - Audit Logs "Platform History Center": Restore Setters
 *
 * The Internal Plan Management Console (Round 15) already snapshots every
 * write via `versioningEngine.snapshot()` — this module reuses that real
 * history, not a new one. Each entity type's snapshot shape was authored by
 * that round's own hooks and varies (a full object, a single field, or a
 * multi-field patch) — these setters mirror each hook's own `restore`
 * callback exactly, applying a historical snapshot back through the same
 * real engine each hook already writes through.
 *
 * `promotion` is deliberately excluded: its version history mixes full
 * `PromotionDefinition` snapshots (from `create`) with plain boolean
 * snapshots (from `setActive`) in the same entity stream, and
 * `PromotionEngine` has no full-object update method — restoring it safely
 * would need new engine surface, out of scope for a presentation-only round.
 * Its history is still shown, just without a Restore button.
 */
import { subscriptionRegistry, SUBSCRIPTION_TIERS } from "@/core/platform/subscription";
import type { SubscriptionTier, SubscriptionLimits, SubscriptionTierDefinition } from "@/core/platform/subscription";
import { pricingPlatformAPI, creditPackPlatformAPI, platformGlobalSettingsPlatformAPI, promotionPlatformAPI } from "@/core/platform/commercial";
import type { PlatformGlobalSettings } from "@/core/platform/commercial";
import { featureFlagRegistry } from "@/core/platform/featureFlags";
import { MATRIX_ROWS, ALL_MODULE_IDS, LIMIT_PROXY_DEFAULTS } from "@/features/platform-admin/features/matrixRows";
import { SELF_SERVE_TIERS } from "@/features/settings/billing/constants";
import { versioningEngine } from "@/core/platform/data/VersioningEngine";
import { auditService } from "@/access/audit/AuditService";
import { entitlementService } from "@/core/platform/access";
import { PLATFORM_ADMIN_ORG_SENTINEL } from "@/features/platform-admin/commitPlanChange";
import type { InternalRole } from "@/features/platform-admin/internalRole";
import type { VersionSnapshot } from "@/core/platform/data/types";

export const RESTORABLE_ENTITY_TYPES = [
  "subscription-tier",
  "subscription-tier-credits",
  "subscription-tier-active",
  "subscription-tier-limits",
  "subscription-tier-modules",
  "pricing-rule",
  "credit-pack",
  "credit-pack-active",
  "experiment-flag",
  "platform-global-settings",
] as const;

export interface RestorePoint {
  entityType: string;
  entityId: string;
  label: string;
  updatedAt: string;
  /** The version to restore TO (the one before the most recent change) — `undefined` when there's only one version recorded, so nothing to go back to yet. */
  restoreToVersion?: number;
  canRestore: boolean;
}

function restoreSubscriptionTierModules(entityId: string, snapshotValue: boolean): void {
  const [tier, rowId] = entityId.split(":");
  const row = MATRIX_ROWS.find(r => r.id === rowId);
  const definition = subscriptionRegistry.get(tier as SubscriptionTier);
  if (!row || !definition) return;

  let nextLimits: SubscriptionLimits = definition.limits;
  if (row.kind === "module") {
    const expanded = definition.limits.modules.includes("*") ? ALL_MODULE_IDS : definition.limits.modules;
    nextLimits = { ...definition.limits, modules: snapshotValue ? Array.from(new Set([...expanded, row.id])) : expanded.filter(m => m !== row.id) };
  } else if (row.kind === "featureGate") {
    nextLimits = { ...definition.limits, featureGates: snapshotValue ? Array.from(new Set([...definition.limits.featureGates, row.id])) : definition.limits.featureGates.filter(f => f !== row.id) };
  } else {
    const key = row.id as keyof SubscriptionLimits;
    const current = definition.limits[key] as number;
    nextLimits = { ...definition.limits, [key]: snapshotValue ? (current > 0 ? current : LIMIT_PROXY_DEFAULTS[row.id]) : 0 };
  }
  subscriptionRegistry.register({ ...definition, limits: nextLimits });
}

/** Applies a historical snapshot back through the real engine for the given entity type. Returns `false` if the type isn't safely restorable (see `promotion` above) or the entity no longer exists. */
export function applyRestoredSnapshot(entityType: string, entityId: string, data: unknown): boolean {
  switch (entityType) {
    case "subscription-tier": {
      subscriptionRegistry.register(data as SubscriptionTierDefinition);
      return true;
    }
    case "subscription-tier-credits": {
      const definition = subscriptionRegistry.get(entityId as SubscriptionTier);
      if (!definition) return false;
      subscriptionRegistry.register({ ...definition, limits: { ...definition.limits, aiCredits: data as number } });
      return true;
    }
    case "subscription-tier-active": {
      const definition = subscriptionRegistry.get(entityId as SubscriptionTier);
      if (!definition) return false;
      subscriptionRegistry.register({ ...definition, isActive: data as boolean });
      return true;
    }
    case "subscription-tier-limits": {
      const definition = subscriptionRegistry.get(entityId as SubscriptionTier);
      if (!definition) return false;
      subscriptionRegistry.register({ ...definition, limits: { ...definition.limits, ...(data as Partial<SubscriptionLimits>) } });
      return true;
    }
    case "subscription-tier-modules": {
      restoreSubscriptionTierModules(entityId, data as boolean);
      return true;
    }
    case "pricing-rule": {
      const rule = pricingPlatformAPI.list().find(r => r.id === entityId);
      if (!rule) return false;
      pricingPlatformAPI.registerRule({ ...rule, ...(data as object) });
      return true;
    }
    case "credit-pack": {
      const pack = creditPackPlatformAPI.list().find(p => p.id === entityId);
      if (!pack) return false;
      creditPackPlatformAPI.register({ ...pack, ...(data as object) });
      return true;
    }
    case "credit-pack-active": {
      creditPackPlatformAPI.setActive(entityId, data as boolean);
      return true;
    }
    case "experiment-flag": {
      const flag = featureFlagRegistry.get(entityId);
      if (!flag) return false;
      featureFlagRegistry.register({ ...flag, rolloutPercent: data as number });
      return true;
    }
    case "platform-global-settings": {
      platformGlobalSettingsPlatformAPI.update(data as Partial<PlatformGlobalSettings>);
      return true;
    }
    default:
      return false;
  }
}

function labelFor(entityType: string, entityId: string): string {
  switch (entityType) {
    case "subscription-tier":
      return `Plan Configuration: ${subscriptionRegistry.get(entityId as SubscriptionTier)?.label ?? entityId}`;
    case "subscription-tier-credits":
      return `AI Credits: ${subscriptionRegistry.get(entityId as SubscriptionTier)?.label ?? entityId}`;
    case "subscription-tier-active":
      return `Plan Status: ${subscriptionRegistry.get(entityId as SubscriptionTier)?.label ?? entityId}`;
    case "subscription-tier-limits":
      return `Usage Limits: ${subscriptionRegistry.get(entityId as SubscriptionTier)?.label ?? entityId}`;
    case "subscription-tier-modules": {
      const [tier, rowId] = entityId.split(":");
      const row = MATRIX_ROWS.find(r => r.id === rowId);
      return `Feature Toggle: ${row?.label ?? rowId} — ${subscriptionRegistry.get(tier as SubscriptionTier)?.label ?? tier}`;
    }
    case "pricing-rule": {
      const rule = pricingPlatformAPI.list().find(r => r.id === entityId);
      return `Pricing Change: ${rule ? (subscriptionRegistry.get(rule.tier)?.label ?? rule.tier) : entityId}`;
    }
    case "credit-pack":
    case "credit-pack-active":
      return `AI Credit Pack: $${creditPackPlatformAPI.list().find(p => p.id === entityId)?.price ?? "?"}`;
    case "experiment-flag":
      return `Experiment: ${featureFlagRegistry.get(entityId)?.label ?? entityId}`;
    case "platform-global-settings":
      return "Global Settings";
    case "promotion":
      return `Promotion: ${promotionPlatformAPI.list().find(p => p.id === entityId)?.code ?? entityId}`;
    default:
      return entityType;
  }
}

function toRestorePoint(entityType: string, entityId: string, history: VersionSnapshot[], canRestore: boolean): RestorePoint | undefined {
  if (history.length === 0) return undefined;
  const latest = history[history.length - 1];
  const previous = history.length >= 2 ? history[history.length - 2] : undefined;
  return {
    entityType,
    entityId,
    label: labelFor(entityType, entityId),
    updatedAt: latest.recordedAt,
    restoreToVersion: previous?.version,
    canRestore: canRestore && previous !== undefined,
  };
}

/**
 * Enumerates every real, versioned entity known to the Internal Plan
 * Management Console — `versioningEngine` has no "list all keys" method, so
 * this walks the known, finite id sets each section already iterates
 * (4 tiers, real pricing rules, real credit packs, real experiment flags,
 * the 1 global-settings singleton, real promotions), keeping only entities
 * that genuinely have recorded history. Promotions are included for display
 * but never restorable (see the module doc comment).
 */
export function enumerateRestorePoints(): RestorePoint[] {
  const points: RestorePoint[] = [];

  for (const tier of SUBSCRIPTION_TIERS) {
    for (const entityType of ["subscription-tier", "subscription-tier-credits", "subscription-tier-active", "subscription-tier-limits"]) {
      const point = toRestorePoint(entityType, tier, versioningEngine.getHistory(entityType, tier), true);
      if (point) points.push(point);
    }
  }
  for (const tier of SELF_SERVE_TIERS) {
    for (const row of MATRIX_ROWS) {
      const entityId = `${tier}:${row.id}`;
      const point = toRestorePoint("subscription-tier-modules", entityId, versioningEngine.getHistory("subscription-tier-modules", entityId), true);
      if (point) points.push(point);
    }
  }
  for (const rule of pricingPlatformAPI.list()) {
    const point = toRestorePoint("pricing-rule", rule.id, versioningEngine.getHistory("pricing-rule", rule.id), true);
    if (point) points.push(point);
  }
  for (const pack of creditPackPlatformAPI.list()) {
    for (const entityType of ["credit-pack", "credit-pack-active"]) {
      const point = toRestorePoint(entityType, pack.id, versioningEngine.getHistory(entityType, pack.id), true);
      if (point) points.push(point);
    }
  }
  for (const flag of featureFlagRegistry.list().filter(f => f.category === "experimental")) {
    const point = toRestorePoint("experiment-flag", flag.id, versioningEngine.getHistory("experiment-flag", flag.id), true);
    if (point) points.push(point);
  }
  const settingsPoint = toRestorePoint("platform-global-settings", "singleton", versioningEngine.getHistory("platform-global-settings", "singleton"), true);
  if (settingsPoint) points.push(settingsPoint);

  for (const promotion of promotionPlatformAPI.list()) {
    const point = toRestorePoint("promotion", promotion.id, versioningEngine.getHistory("promotion", promotion.id), false);
    if (point) points.push(point);
  }

  return points.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** Restores a real entity to a real prior version through the same engine each section already writes to, then records the restore itself as a real, versioned, audited event — mirrors `commitPlanChange`'s own undo pattern exactly. */
export function restoreEntityToVersion(entityType: string, entityId: string, version: number, actor: InternalRole): boolean {
  const snapshot = versioningEngine.getSnapshotForRestore(entityType, entityId, version);
  if (snapshot === undefined) return false;
  const applied = applyRestoredSnapshot(entityType, entityId, snapshot);
  if (!applied) return false;
  entitlementService.invalidateAll();

  const label = labelFor(entityType, entityId);
  void versioningEngine.snapshot(entityType, entityId, snapshot, actor, `Restored ${label} to version ${version}`);
  void auditService.recordEvent({
    organizationId: PLATFORM_ADMIN_ORG_SENTINEL,
    userId: actor,
    eventType: "entity_restored",
    resource: entityType,
    resourceId: entityId,
    description: `Restored ${label} to a previous version`,
  });
  return true;
}
