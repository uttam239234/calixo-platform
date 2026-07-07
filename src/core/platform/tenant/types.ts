/**
 * Calixo Platform - Tenant Context Types
 *
 * The composite context every engine/service/AI request/report/workflow/
 * analytics query should be able to accept so it "understands" who is
 * asking and on whose behalf — Organization, Workspace, Brand, User,
 * Permissions, Subscription, Feature Flags. `core/platform` never imports
 * a feature module (Brand, Analytics, ...) to build this — callers pass
 * in whatever brand/module-specific identifiers they already have.
 */
import type { Organization } from "../organizations/types";
import type { Workspace } from "../workspaces/types";
import type { Subscription } from "../subscription/types";

export interface OrganizationContext {
  organizationId: string;
  organization?: Organization;
}

export interface WorkspaceContext {
  workspaceId?: string;
  workspace?: Workspace;
}

/** Brand identifiers only — the caller (e.g. Dashboard, Analytics) resolves the actual `BrandSummary` via `@/core/brand`'s `BrandPlatformAPI` and passes it in, so `core/platform` never depends on a feature module. */
export interface BrandContext {
  brandId?: string;
  brandName?: string;
}

export interface UserContext {
  userId: string;
  roles: string[];
}

export interface PermissionContext {
  permissions: string[];
  /** Fast, list-based check — no I/O. */
  hasPermission(permission: string): boolean;
  /** Full policy-aware check via the Access Platform's `AuthorizationEngine` (roles, direct permissions, and scoped policies). */
  authorize(permission: string, resource?: string): Promise<boolean>;
}

export interface SubscriptionContext {
  tier: Subscription["tier"];
  subscription?: Subscription;
  hasFeatureGate(featureId: string): boolean;
  hasModule(moduleId: string): boolean;
  checkLimit(key: keyof Subscription["usage"], requested?: number): { allowed: boolean; remaining: number };
}

/** Addressable ids only — the Connector Platform (`src/integrations`) resolves connections itself; `core/platform` never imports it. */
export interface ConnectorContext {
  organizationId: string;
}

export interface AuditContext {
  actorId: string;
  organizationId: string;
  workspaceId?: string;
}

export interface FeatureFlagContextValue {
  isEnabled(flagId: string): boolean;
}

export interface TenantContext {
  organization: OrganizationContext;
  workspace: WorkspaceContext;
  brand: BrandContext;
  user: UserContext;
  permissions: PermissionContext;
  subscription: SubscriptionContext;
  connector: ConnectorContext;
  audit: AuditContext;
  featureFlags: FeatureFlagContextValue;
}

export interface ResolveTenantContextInput {
  organizationId: string;
  workspaceId?: string;
  userId: string;
  brandId?: string;
  brandName?: string;
}
