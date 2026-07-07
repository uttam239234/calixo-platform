/**
 * Calixo Platform - Enterprise Access Control Platform Types
 *
 * New types this phase introduces on top of the existing `src/access`
 * model (`Role`, `Permission`, `Policy`, `AuthorizationRequest/Result`,
 * `AccessContext`, `FeatureAccess` — all reused, none redefined here).
 * This file adds exactly what `src/access` didn't have: a fixed
 * resource/action matrix, ownership roles, resource hierarchy, ABAC
 * attribute shape, and an enriched authorization decision with a real
 * "explain" reason instead of a boolean.
 */
import type { AuthorizationResult } from "@/access/types";

// ============================================================================
// Resource Hierarchy (section 5)
// ============================================================================

/** Every protectable resource type, ordered from the top of the tenant hierarchy down. New resource types are appended, never renamed (permission strings encode this name). */
export type ResourceType =
  | "organization"
  | "workspace"
  | "brand"
  | "campaign"
  | "asset"
  | "content"
  | "workflow"
  | "report"
  | "analytics"
  | "ai"
  | "connector"
  | "settings"
  | "user"
  | "team"
  | "department"
  | "module"
  | "notification"
  | "billing"
  | "knowledge"
  | "media"
  | "file"
  | "dashboard"
  | "api"
  | "execution"
  | "automation"
  | "license"
  | "credit"
  | "contract";

/**
 * The full conceptual resource order from the mandate's hierarchy diagram
 * (Organization -> Workspace -> Brand -> Campaign -> ... -> Settings) —
 * documentation/display ordering only. It is NOT used for permission
 * cascade (see `RESOURCE_HIERARCHY` below): a live smoke test caught that
 * treating this whole chain as a single cascade path let a `campaign:read`
 * grant silently cascade all the way down to `ai:read`/`connector:read`/
 * `settings:read`, which is a real over-permission security bug, not a
 * feature. Campaign/Asset/Content/Workflow/Report/Analytics/AI/Connector/
 * Settings are siblings at the same "leaf resource" level in this
 * codebase's actual data model (none of them have a formal parent-child
 * containment FK to one another) — only Organization/Workspace/Brand are
 * genuinely nested containers (`Workspace.organizationId`,
 * `BrandProfile.organizationId/workspaceId`).
 */
export const FULL_RESOURCE_ORDER: ResourceType[] = [
  "organization",
  "workspace",
  "brand",
  "campaign",
  "asset",
  "content",
  "workflow",
  "report",
  "analytics",
  "ai",
  "connector",
  "settings",
];

/** The genuine tenant-containment chain used for permission cascade — a grant at an ancestor type implies the same grant on descendants, matching the real FK nesting (`Workspace.organizationId`, `Brand.organizationId/workspaceId`). Deliberately NOT the full `FULL_RESOURCE_ORDER` list — see its comment. */
export const RESOURCE_HIERARCHY: ResourceType[] = ["organization", "workspace", "brand"];

// ============================================================================
// Authorization Matrix (section 8) — the ONLY 15 action verbs allowed.
// ============================================================================

export type ActionType =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "approve"
  | "assign"
  | "execute"
  | "export"
  | "import"
  | "share"
  | "archive"
  | "restore"
  | "manage"
  | "admin";

export const ACTION_TYPES: ActionType[] = ["read", "create", "update", "delete", "publish", "approve", "assign", "execute", "export", "import", "share", "archive", "restore", "manage", "admin"];

// ============================================================================
// Ownership (section 4)
// ============================================================================

export type OwnershipRoleType = "owner" | "creator" | "editor" | "reviewer" | "publisher" | "approver" | "manager" | "assignee";

export interface OwnershipGrant {
  id: string;
  resourceType: ResourceType;
  resourceId: string;
  userId: string;
  role: OwnershipRoleType;
  grantedAt: string;
}

// ============================================================================
// Resource Context — what's being authorized against
// ============================================================================

export interface ResourceContext {
  resourceType: ResourceType;
  resourceId?: string;
  ownerId?: string;
  organizationId: string;
  workspaceId?: string;
  brandId?: string;
  tags?: string[];
  attributes?: Record<string, unknown>;
}

// ============================================================================
// ABAC Attributes (section 3)
// ============================================================================

export interface AbacRequestAttributes {
  department?: string;
  region?: string;
  deviceType?: string;
  environment?: "production" | "staging" | "development";
  timeOfDayHour?: number;
  ipAddress?: string;
  [key: string]: unknown;
}

// ============================================================================
// Explain Authorization (section 18) — instead of "Access Denied"
// ============================================================================

export type ExplainReasonCode =
  | "allowed"
  | "permission_missing"
  | "policy_failed"
  | "subscription_restriction"
  | "feature_disabled"
  | "ownership_failed"
  | "organization_restriction"
  | "workspace_restriction"
  | "ai_restriction"
  | "connector_restriction";

export interface AuthorizationDecision {
  allowed: boolean;
  reasonCode: ExplainReasonCode;
  explanation: string;
  resourceType: ResourceType;
  action: ActionType;
  permission: string;
  engineResult?: AuthorizationResult;
  evaluatedAt: string;
}

// ============================================================================
// Permission Templates (section 16)
// ============================================================================

export interface PermissionTemplateDefinition {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

// ============================================================================
// Permission Simulator (section 17)
// ============================================================================

export interface ModuleAccessibility {
  moduleId: string;
  accessible: boolean;
  reasonCode?: ExplainReasonCode;
}

export interface PermissionSimulationResult {
  userId: string;
  organizationId: string;
  accessibleModules: string[];
  deniedModules: ModuleAccessibility[];
  grantedPermissions: string[];
  missingPermissions: string[];
  featureAvailability: Record<string, boolean>;
  subscriptionRestrictions: string[];
}
