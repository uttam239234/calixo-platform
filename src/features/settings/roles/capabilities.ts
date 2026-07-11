/**
 * Calixo Platform - Roles & Permissions: Curated Capability & Feature Lists
 *
 * The brief's own vocabulary ("Create Content", "View Analytics", "Manage
 * Billing"...) mapped onto real `resource:action` permission strings — the
 * translation layer between plain language and the platform's actual
 * permission grammar. Nothing here is fabricated data: every ✓/✕ a caller
 * renders from these lists comes from a role's real, live permission set.
 */
import { permissionName } from "@/core/platform/access";
import type { ActionType, ResourceType } from "@/core/platform/access";

/** A role with `["*"]` (Owner) has every permission — `.includes()` alone would say no. */
export function roleHasPermission(rolePermissions: string[], permission: string): boolean {
  return rolePermissions.includes("*") || rolePermissions.includes(permission);
}

export interface CapabilityCheck {
  label: string;
  permission: string;
}

/** Shown on each Role card — "Manager can: ✓ Create Content ✓ View Analytics ✓ Generate Reports ✕ Manage Billing." */
export const CAPABILITY_CHECKS: CapabilityCheck[] = [
  { label: "Create Content", permission: permissionName("content", "create") },
  { label: "Publish Posts", permission: permissionName("social", "publish") },
  { label: "View Analytics", permission: permissionName("analytics", "read") },
  { label: "Generate Reports", permission: permissionName("report", "create") },
  { label: "Manage Team", permission: permissionName("team", "manage") },
  { label: "Manage Billing", permission: permissionName("billing", "manage") },
  { label: "Delete Integrations", permission: permissionName("connector", "delete") },
];

export interface FeatureCheck {
  id: string;
  label: string;
  resource: ResourceType;
  /** The action rendered in the Access Matrix's summary column — the one that best represents "basic access" for this feature. */
  action: ActionType;
}

/** The Access Matrix's 11 rows. */
export const FEATURE_CHECKS: FeatureCheck[] = [
  { id: "dashboard", label: "Dashboard", resource: "dashboard", action: "read" },
  { id: "analytics", label: "Analytics", resource: "analytics", action: "read" },
  { id: "ads", label: "Ads Manager", resource: "campaign", action: "read" },
  { id: "social", label: "Social Media", resource: "social", action: "read" },
  { id: "content", label: "Content Studio", resource: "content", action: "read" },
  { id: "brand", label: "Brand Monitoring", resource: "brand", action: "read" },
  { id: "reports", label: "Reports", resource: "report", action: "read" },
  { id: "ai", label: "AI Copilot", resource: "ai", action: "execute" },
  { id: "users", label: "Users & Teams", resource: "user", action: "read" },
  { id: "billing", label: "Billing", resource: "billing", action: "manage" },
  { id: "integrations", label: "Integrations", resource: "connector", action: "manage" },
];

/** The 5 actions the brief's "Access Explanation" wants spelled out per feature, in order. */
export const ACCESS_EXPLANATION_ACTIONS: { label: string; action: ActionType }[] = [
  { label: "View", action: "read" },
  { label: "Create", action: "create" },
  { label: "Edit", action: "update" },
  { label: "Delete", action: "delete" },
  { label: "Manage", action: "manage" },
];

export const ROLE_ICONS: Record<string, string> = {
  owner: "👑",
  administrator: "⚙️",
  manager: "📈",
  member: "👤",
  viewer: "👀",
};
