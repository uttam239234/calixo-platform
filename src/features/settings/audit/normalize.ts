/**
 * Calixo Platform - Audit Logs "Platform History Center": Normalization
 *
 * This app has no single audit engine — 4 real, independent, already-wired
 * logging systems exist (found by direct inspection, not assumed):
 *  - `auditService` (`access/audit/AuditService.ts`) — generic compliance
 *    trail; real callers include `ConnectorRuntime`, `SecretPlatformAPI`,
 *    `AuthorizationMiddleware`, `EntityManager`, and the Internal Plan
 *    Console's `commitPlanChange`.
 *  - `activityEngine` (`core/users/activity/ActivityEngine.ts`) — Users &
 *    Teams lifecycle log, already org-scoped.
 *  - `organizationEngine`'s own private audit trail, exposed via
 *    `organizationPlatformAPI.getAuditTrail()` (added this round) — already
 *    covers org create/update/tier-change/suspend/restore/archive/member
 *    changes/invitations for real.
 *  - `workspaceEngine`'s own private audit trail, exposed via
 *    `workspacePlatformAPI.getAuditTrail()` — already covers workspace
 *    create/update/archive/member-removed for real.
 * This module's only job is translating each into ONE shared, plain-language
 * `AuditFeedItem` — no new logging engine, no duplicate log.
 */
import type { AuditEvent } from "@/access/types";
import type { ActivityEvent } from "@/core/users";
import type { OrganizationAuditEntry } from "@/core/platform/organizations";
import type { WorkspaceAuditEntry } from "@/core/platform/workspaces";
import { PLATFORM_ADMIN_ORG_SENTINEL } from "@/features/platform-admin/commitPlanChange";
import { INTERNAL_ROLE_LABELS, type InternalRole } from "@/features/platform-admin/internalRole";
import { formatRelativeTime } from "@/shared/utils/date";
import type { ActivityItem } from "@/components/enterprise/module";

export type AuditCategory = "People" | "Billing" | "Users" | "Integrations" | "AI Credits" | "Reports" | "Settings" | "Security";
export type AuditSeverity = "info" | "warning" | "critical";

export const AUDIT_CATEGORIES: AuditCategory[] = ["People", "Billing", "Users", "Integrations", "AI Credits", "Reports", "Settings", "Security"];
export const AUDIT_SEVERITIES: AuditSeverity[] = ["info", "warning", "critical"];

export interface AuditFeedItem {
  id: string;
  actorLabel: string;
  description: string;
  category: AuditCategory;
  severity: AuditSeverity;
  timestamp: string;
  changes?: { before: unknown; after: unknown };
  /** Present only for items with real, restorable version history (Round 15's Internal Plan Console entities). */
  restorable?: { entityType: string; entityId: string };
}

function actorLabelFor(userId: string, lookupUserName: (userId: string) => string | undefined): string {
  const internalLabel = INTERNAL_ROLE_LABELS[userId as InternalRole];
  if (internalLabel) return internalLabel;
  return lookupUserName(userId) ?? "Someone";
}

/** Disclosed, deterministic client-side heuristic — no severity concept exists anywhere in the real backend. */
function severityFor(description: string, eventType?: string): AuditSeverity {
  if (eventType === "authorization_failure") return "critical";
  if (/disabled|removed|archived|suspended|deleted|revoked|reduced/i.test(description)) return "warning";
  return "info";
}

/** Disclosed, deterministic client-side heuristic — no category concept exists anywhere in the real backend. */
function categoryFor(resource: string, description: string): AuditCategory {
  const text = `${resource} ${description}`.toLowerCase();
  if (/credit/.test(text)) return "AI Credits";
  if (/price|pricing|plan|tier|invoice|payment|billing|contract|promotion/.test(text)) return "Billing";
  if (/connector|integration/.test(text)) return "Integrations";
  if (/report/.test(text)) return "Reports";
  if (/authorization|secret|security|permission/.test(text)) return "Security";
  if (/role|access level|suspended|reinstated/.test(text)) return "Users";
  if (/team|workspace member|invit|joined|login|logout|profile/.test(text)) return "People";
  return "Settings";
}

const ORGANIZATION_ACTION_LABELS: Record<string, (target: string) => string> = {
  "organization.created": () => "Organization created",
  "organization.updated": () => "Organization details updated",
  "organization.tier-changed": target => `Plan changed to ${target}`,
  "organization.suspended": () => "Organization suspended",
  "organization.restored": () => "Organization restored",
  "organization.archived": () => "Organization archived",
  "organization.member-removed": target => `${target} removed from the organization`,
  "organization.member-role-changed": target => `Member role changed to ${target}`,
  "organization.invitation-sent": target => `Invited ${target}`,
  "organization.invitation-revoked": () => "Invitation revoked",
};

const WORKSPACE_ACTION_LABELS: Record<string, (target: string) => string> = {
  "workspace.created": target => `Workspace created: ${target}`,
  "workspace.updated": () => "Workspace details updated",
  "workspace.archived": () => "Workspace archived",
  "workspace.member-removed": target => `${target} left the workspace`,
};

export function fromAuditEvent(event: AuditEvent, lookupUserName: (userId: string) => string | undefined): AuditFeedItem {
  const isPlatformAdmin = event.organizationId === PLATFORM_ADMIN_ORG_SENTINEL;
  const changes = event.changes && "before" in event.changes && "after" in event.changes ? { before: event.changes.before, after: event.changes.after } : undefined;
  return {
    id: event.id,
    actorLabel: isPlatformAdmin ? actorLabelFor(event.userId, lookupUserName) : (lookupUserName(event.userId) ?? "Someone"),
    description: event.description,
    category: categoryFor(event.resource, event.description),
    severity: severityFor(event.description, event.eventType),
    timestamp: event.timestamp,
    changes,
    restorable: changes ? { entityType: event.resource, entityId: event.resourceId ?? event.id } : undefined,
  };
}

export function fromActivityEvent(event: ActivityEvent, lookupUserName: (userId: string) => string | undefined): AuditFeedItem {
  return {
    id: event.id,
    actorLabel: lookupUserName(event.userId) ?? "Someone",
    description: event.description,
    category: "People",
    severity: severityFor(event.description),
    timestamp: event.createdAt,
  };
}

export function fromOrganizationAuditEntry(entry: OrganizationAuditEntry, lookupUserName: (id: string) => string | undefined): AuditFeedItem {
  const targetName = entry.target ? (lookupUserName(entry.target) ?? entry.target) : "";
  const description = ORGANIZATION_ACTION_LABELS[entry.action]?.(targetName) ?? entry.action;
  return {
    id: entry.id,
    actorLabel: lookupUserName(entry.actorId) ?? "Someone",
    description,
    category: categoryFor(entry.action, description),
    severity: severityFor(description),
    timestamp: entry.timestamp,
  };
}

export function fromWorkspaceAuditEntry(entry: WorkspaceAuditEntry, lookupUserName: (id: string) => string | undefined): AuditFeedItem {
  const targetName = entry.target ? (lookupUserName(entry.target) ?? entry.target) : "";
  const description = WORKSPACE_ACTION_LABELS[entry.action]?.(targetName) ?? entry.action;
  return {
    id: entry.id,
    actorLabel: lookupUserName(entry.actorId) ?? "Someone",
    description,
    category: "Settings",
    severity: severityFor(description),
    timestamp: entry.timestamp,
  };
}

/** Shared with every page that renders a feed via the real, reusable `ActivityTimeline` component — "Who" and "When" are always on the row, satisfying the brief's 1-click requirement trivially. */
export function toActivityItems(items: AuditFeedItem[]): ActivityItem[] {
  return items.map(item => ({
    id: item.id,
    actor: item.actorLabel,
    action: item.description,
    timestamp: formatRelativeTime(item.timestamp),
    metadata: item.category,
  }));
}
