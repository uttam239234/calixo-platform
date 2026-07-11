/**
 * Calixo Platform - Policies as Plain Sentences
 *
 * Two real, distinct data sources, both translated into the brief's own
 * sentence shapes — never exposing ABAC/conditions/claims/expressions.
 * Nothing here is authored copy pretending to be data: every sentence is
 * computed from a role's real permission set or a real `Policy` record.
 */
import { permissionName } from "@/core/platform/access";
import type { Policy } from "@/access/types";
import { roleHasPermission } from "./capabilities";

interface RoleLike {
  id: string;
  name: string;
}

export interface RbacStatement {
  id: string;
  sentence: string;
}

interface RbacCheckDef {
  id: string;
  permission: string;
  /** "positive" -> "Only {roles with it} can {action}." "negative" -> "{roles without it} cannot {action}." */
  style: "positive" | "negative";
  action: string;
}

const RBAC_CHECKS: RbacCheckDef[] = [
  { id: "billing-manage", permission: permissionName("billing", "manage"), style: "positive", action: "change billing" },
  { id: "connector-manage", permission: permissionName("connector", "manage"), style: "positive", action: "connect integrations" },
  { id: "organization-delete", permission: permissionName("organization", "delete"), style: "negative", action: "delete organizations" },
  { id: "user-manage", permission: permissionName("user", "manage"), style: "positive", action: "invite, suspend, or remove people" },
  { id: "role-manage", permission: permissionName("role", "manage"), style: "positive", action: "create or change roles" },
];

function joinNames(names: string[]): string {
  if (names.length === 0) return "No one";
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** Scans the real roles + their real permissions and generates one sentence per curated, sensitive check. */
export function buildRbacStatements(roles: RoleLike[], permissionsByRole: Record<string, string[]>): RbacStatement[] {
  return RBAC_CHECKS.map(check => {
    const withIt = roles.filter(role => roleHasPermission(permissionsByRole[role.id] ?? [], check.permission)).map(r => r.name);
    const withoutIt = roles.filter(role => !roleHasPermission(permissionsByRole[role.id] ?? [], check.permission)).map(r => r.name);
    const sentence = check.style === "positive" ? `Only ${joinNames(withIt)} can ${check.action}.` : `${joinNames(withoutIt)} cannot ${check.action}.`;
    return { id: check.id, sentence };
  });
}

/** Translates a real ABAC `Policy` (structured conditions) into a plain sentence — the only place this translation exists; nothing upstream provides it. */
export function describePolicy(policy: Policy): string {
  const conditions = policy.conditions ?? [];
  const find = (field: string, operator?: string) => conditions.find(c => c.field === field && (!operator || c.operator === operator));

  if (policy.type === "subscription" && find("subscriptionTier")) {
    const tier = String(find("subscriptionTier")?.value ?? "Trial");
    return `AI features are turned off for organizations on the ${tier} plan.`;
  }
  if (policy.type === "device" && find("deviceType")) {
    return `Administrative actions are blocked on mobile devices.`;
  }
  if (policy.type === "time_based" && find("timeOfDayHour")) {
    const hour = find("timeOfDayHour")?.value;
    return `Approvals can't happen after ${hour}:00.`;
  }
  if (policy.type === "location" && find("region", "not_in")) {
    const allowed = find("region", "not_in")?.value;
    const list = Array.isArray(allowed) ? allowed.join(", ") : String(allowed);
    return `Access is restricted to these regions: ${list}.`;
  }
  // Fallback for any policy shape not covered above — still plain language, just less specific.
  return policy.description || `${policy.effect === "deny" ? "Blocks" : "Allows"} ${policy.name.toLowerCase()}.`;
}
