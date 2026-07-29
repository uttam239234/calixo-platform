import "server-only";
import { getServerSupabase } from "@/shared/server/supabaseClient";
import type { Organization, OrganizationMember, OrganizationMemberRole } from "@/core/platform/organizations/types";
import type { User } from "@/core/users/types";
import type { SubscriptionTier } from "@/core/platform/subscription/types";

/**
 * Database persistence layer for the core platform registries.
 *
 * This module bridges the in-memory registries (OrganizationRegistry,
 * UserRegistry, etc.) with the live Supabase database. It provides
 * async write-through and read-back functions that the engines call
 * after their in-memory mutations, so the existing synchronous APIs
 * remain unchanged while data survives across server restarts.
 *
 * All writes use the service-role Supabase client (bypasses RLS) since
 * auth is already verified by Clerk before any of these code paths run.
 */

const TIER_TO_PLAN: Record<SubscriptionTier, string> = {
  trial: "FREE",
  starter: "STARTER",
  growth: "PROFESSIONAL",
  enterprise: "ENTERPRISE",
};

const PLAN_TO_TIER: Record<string, SubscriptionTier> = {
  FREE: "trial",
  STARTER: "starter",
  PROFESSIONAL: "growth",
  ENTERPRISE: "enterprise",
  AGENCY: "growth",
};

const ORG_ROLE_TO_DB: Record<OrganizationMemberRole, string> = {
  owner: "SUPER_ADMIN",
  admin: "ADMIN",
  member: "EDITOR",
  guest: "VIEWER",
};

const DB_ROLE_TO_ORG: Record<string, OrganizationMemberRole> = {
  SUPER_ADMIN: "owner",
  ADMIN: "admin",
  EDITOR: "member",
  VIEWER: "guest",
  CUSTOM: "member",
};

// ---------------------------------------------------------------------------
// Organizations
// ---------------------------------------------------------------------------

export async function dbCreateOrganization(org: Organization): Promise<void> {
  const supabase = getServerSupabase();
  const { error } = await supabase.from("organizations").upsert({
    id: org.id,
    name: org.name,
    slug: org.slug,
    plan: TIER_TO_PLAN[org.tier] ?? "FREE",
    is_deleted: false,
    metadata: { clerkOrgId: org.clerkOrgId, tier: org.tier, status: org.status, ownerId: org.ownerId },
    created_at: org.createdAt,
    updated_at: org.updatedAt,
  });
  if (error) console.error("[DatabasePersistence] dbCreateOrganization error:", error.message);

  // Upsert the extension relation
  const { error: relError } = await supabase.from("organization_relations").upsert({
    organization_id: org.id,
    owner_id: org.ownerId,
    billing_email: org.profile.email ?? null,
    website: org.profile.website ?? null,
    industry: org.profile.industry ?? null,
    size: org.profile.companySize ?? null,
    branding: org.branding,
    security: org.settings.security,
    settings: { ...org.settings, ...org.preferences },
    feature_flags: org.featureFlagOverrides,
  });
  if (relError) console.error("[DatabasePersistence] dbCreateOrganization relation error:", relError.message);
}

export async function dbUpdateOrganization(org: Organization): Promise<void> {
  const supabase = getServerSupabase();
  const { error } = await supabase.from("organizations").update({
    name: org.name,
    slug: org.slug,
    plan: TIER_TO_PLAN[org.tier] ?? "FREE",
    updated_at: org.updatedAt,
  }).eq("id", org.id);
  if (error) console.error("[DatabasePersistence] dbUpdateOrganization error:", error.message);

  const { error: relError } = await supabase.from("organization_relations").upsert({
    organization_id: org.id,
    owner_id: org.ownerId,
    billing_email: org.profile.email ?? null,
    website: org.profile.website ?? null,
    industry: org.profile.industry ?? null,
    size: org.profile.companySize ?? null,
    branding: org.branding,
    security: org.settings.security,
    settings: { ...org.settings, ...org.preferences },
    feature_flags: org.featureFlagOverrides,
  });
  if (relError) console.error("[DatabasePersistence] dbUpdateOrganization relation error:", relError.message);
}

export async function dbAddOrgMember(organizationId: string, userId: string, role: OrganizationMemberRole): Promise<void> {
  const supabase = getServerSupabase();
  const { error } = await supabase.from("organization_members").upsert({
    organization_id: organizationId,
    user_id: userId,
    role: ORG_ROLE_TO_DB[role] ?? "VIEWER",
    is_active: true,
  });
  if (error) console.error("[DatabasePersistence] dbAddOrgMember error:", error.message);
}

export async function dbRemoveOrgMember(organizationId: string, userId: string): Promise<void> {
  const supabase = getServerSupabase();
  const { error } = await supabase.from("organization_members")
    .update({ is_active: false })
    .eq("organization_id", organizationId)
    .eq("user_id", userId);
  if (error) console.error("[DatabasePersistence] dbRemoveOrgMember error:", error.message);
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function dbCreateUser(user: User): Promise<void> {
  const supabase = getServerSupabase();
  const { error } = await supabase.from("users").upsert({
    id: user.id,
    email: user.email,
    name: user.displayName,
    avatar: user.avatar ?? null,
    phone: user.phone ?? null,
    locale: user.locale,
    timezone: user.timezone,
    is_active: user.status === "active",
    metadata: { ...user.metadata, username: user.username, department: user.department, title: user.title, organizationId: user.organizationId, workspaceId: user.workspaceId },
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  });
  if (error) console.error("[DatabasePersistence] dbCreateUser error:", error.message);
}

export async function dbUpdateUser(user: User): Promise<void> {
  const supabase = getServerSupabase();
  const { error } = await supabase.from("users").update({
    email: user.email,
    name: user.displayName,
    avatar: user.avatar ?? null,
    phone: user.phone ?? null,
    locale: user.locale,
    timezone: user.timezone,
    is_active: user.status === "active",
    metadata: { ...user.metadata, username: user.username, department: user.department, title: user.title, organizationId: user.organizationId, workspaceId: user.workspaceId },
    updated_at: user.updatedAt,
  }).eq("id", user.id);
  if (error) console.error("[DatabasePersistence] dbUpdateUser error:", error.message);
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export async function dbCreateNotification(notification: {
  userId: string;
  organizationId?: string;
  title: string;
  description?: string;
  type: string;
  severity?: string;
  isRead?: boolean;
}): Promise<void> {
  const supabase = getServerSupabase();
  const { error } = await supabase.from("notifications").insert({
    user_id: notification.userId,
    organization_id: notification.organizationId ?? null,
    title: notification.title,
    description: notification.description ?? null,
    type: notification.type,
    severity: notification.severity ?? "INFO",
    is_read: notification.isRead ?? false,
  });
  if (error) console.error("[DatabasePersistence] dbCreateNotification error:", error.message);
}

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

export async function dbRecordActivity(activity: {
  userId: string;
  organizationId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const supabase = getServerSupabase();
  const { error } = await supabase.from("activities").insert({
    user_id: activity.userId,
    organization_id: activity.organizationId ?? null,
    action: activity.action,
    resource: activity.resource,
    resource_id: activity.resourceId ?? null,
    description: activity.description ?? null,
    metadata: activity.metadata ?? null,
  });
  if (error) console.error("[DatabasePersistence] dbRecordActivity error:", error.message);
}

// ---------------------------------------------------------------------------
// Audit Logs
// ---------------------------------------------------------------------------

export async function dbRecordAudit(audit: {
  organizationId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, unknown>;
}): Promise<void> {
  const supabase = getServerSupabase();
  const { error } = await supabase.from("audit_logs").insert({
    organization_id: audit.organizationId,
    user_id: audit.userId,
    action: audit.action,
    resource: audit.resource,
    resource_id: audit.resourceId,
    changes: audit.changes ?? null,
  });
  if (error) console.error("[DatabasePersistence] dbRecordAudit error:", error.message);
}

// ---------------------------------------------------------------------------
// Workflows
// ---------------------------------------------------------------------------

export async function dbCreateWorkflow(workflow: {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  status: string;
  triggerType: string;
  config?: Record<string, unknown>;
}): Promise<void> {
  const supabase = getServerSupabase();
  const { error } = await supabase.from("workflows").upsert({
    id: workflow.id,
    organization_id: workflow.organizationId,
    name: workflow.name,
    description: workflow.description ?? null,
    status: workflow.status,
    trigger_type: workflow.triggerType,
    config: workflow.config ?? null,
  });
  if (error) console.error("[DatabasePersistence] dbCreateWorkflow error:", error.message);
}

// ---------------------------------------------------------------------------
// AI Usage
// ---------------------------------------------------------------------------

export async function dbRecordAiUsage(usage: {
  organizationId: string;
  model: string;
  tokens: number;
  cost: number;
  latencyMs?: number;
}): Promise<void> {
  const supabase = getServerSupabase();
  const { error } = await supabase.from("ai_usage").insert({
    organization_id: usage.organizationId,
    model: usage.model,
    tokens: usage.tokens,
    cost: usage.cost,
    latency_ms: usage.latencyMs ?? null,
  });
  if (error) console.error("[DatabasePersistence] dbRecordAiUsage error:", error.message);
}
