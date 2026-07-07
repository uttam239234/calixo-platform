/**
 * Calixo Platform - Permission Templates
 *
 * Named permission bundles for common job functions. `applyTemplate()`
 * creates a real `Role` via the EXISTING `roleService.createRole()` —
 * templates are a convenience layer over RBAC, not a parallel system.
 */
import { roleService } from "@/access/services/RoleService";
import type { Role } from "@/access/types";
import { permissionName } from "./PermissionRegistry";
import type { PermissionTemplateDefinition } from "./types";

const DEFAULT_TEMPLATES: PermissionTemplateDefinition[] = [
  {
    id: "marketing-team",
    name: "Marketing Team",
    description: "Plans and executes campaigns, content, and assets within a workspace.",
    permissions: [
      permissionName("campaign", "read"), permissionName("campaign", "create"), permissionName("campaign", "update"), permissionName("campaign", "publish"),
      permissionName("content", "read"), permissionName("content", "create"), permissionName("content", "update"), permissionName("content", "publish"),
      permissionName("asset", "read"), permissionName("asset", "create"), permissionName("asset", "update"),
      permissionName("report", "read"), permissionName("report", "export"),
      permissionName("analytics", "read"),
      permissionName("workflow", "read"), permissionName("workflow", "create"), permissionName("workflow", "approve"),
    ],
  },
  {
    id: "agency",
    name: "Agency",
    description: "External agency partner managing a client's brand and campaigns.",
    permissions: [
      permissionName("workspace", "read"), permissionName("brand", "read"), permissionName("brand", "update"),
      permissionName("campaign", "read"), permissionName("campaign", "create"), permissionName("campaign", "update"), permissionName("campaign", "publish"), permissionName("campaign", "manage"),
      permissionName("content", "read"), permissionName("content", "create"), permissionName("content", "update"), permissionName("content", "publish"),
      permissionName("asset", "read"), permissionName("asset", "create"), permissionName("asset", "update"), permissionName("asset", "share"),
      permissionName("report", "read"), permissionName("report", "export"), permissionName("report", "create"),
    ],
  },
  {
    id: "client",
    name: "Client",
    description: "Read-mostly access with approval rights, no publishing.",
    permissions: [
      permissionName("workspace", "read"), permissionName("brand", "read"), permissionName("campaign", "read"),
      permissionName("content", "read"), permissionName("content", "approve"),
      permissionName("asset", "read"), permissionName("report", "read"), permissionName("report", "export"), permissionName("analytics", "read"),
    ],
  },
  {
    id: "executive",
    name: "Executive",
    description: "Cross-workspace visibility into performance and billing, no operational edit rights.",
    permissions: [
      permissionName("organization", "read"), permissionName("workspace", "read"), permissionName("brand", "read"), permissionName("campaign", "read"),
      permissionName("report", "read"), permissionName("report", "export"), permissionName("analytics", "read"), permissionName("billing", "read"),
    ],
  },
  {
    id: "finance",
    name: "Finance",
    description: "Billing and subscription management with read-only visibility elsewhere.",
    permissions: [permissionName("billing", "read"), permissionName("billing", "manage"), permissionName("billing", "export"), permissionName("organization", "read"), permissionName("report", "read"), permissionName("report", "export")],
  },
  {
    id: "sales",
    name: "Sales",
    description: "Campaign and content visibility to support sales conversations.",
    permissions: [permissionName("campaign", "read"), permissionName("content", "read"), permissionName("report", "read"), permissionName("report", "export"), permissionName("analytics", "read")],
  },
  {
    id: "support",
    name: "Support",
    description: "Customer support access to users, teams, and notifications.",
    permissions: [permissionName("user", "read"), permissionName("team", "read"), permissionName("notification", "read"), permissionName("notification", "manage"), permissionName("workflow", "read")],
  },
  {
    id: "hr",
    name: "HR",
    description: "Manages users, teams, and departments across the organization.",
    permissions: [
      permissionName("user", "read"), permissionName("user", "create"), permissionName("user", "update"), permissionName("user", "manage"),
      permissionName("team", "read"), permissionName("team", "create"), permissionName("team", "update"), permissionName("team", "manage"),
      permissionName("department", "read"), permissionName("department", "create"), permissionName("department", "update"), permissionName("department", "manage"),
    ],
  },
  {
    id: "regional-manager",
    name: "Regional Manager",
    description: "Manages workspaces and approves campaigns within an assigned region.",
    permissions: [permissionName("workspace", "read"), permissionName("workspace", "manage"), permissionName("campaign", "read"), permissionName("campaign", "approve"), permissionName("report", "read"), permissionName("report", "export"), permissionName("analytics", "read")],
  },
  {
    id: "administrator",
    name: "Administrator",
    description: "Full administrative control over organization settings, users, and teams (not billing).",
    permissions: [
      permissionName("organization", "manage"), permissionName("settings", "admin"),
      permissionName("user", "manage"), permissionName("team", "manage"), permissionName("department", "manage"),
      permissionName("module", "admin"),
    ],
  },
];

export class PermissionTemplateRegistry {
  private templates = new Map<string, PermissionTemplateDefinition>(DEFAULT_TEMPLATES.map(t => [t.id, t]));

  register(template: PermissionTemplateDefinition): void {
    this.templates.set(template.id, template);
  }

  get(id: string): PermissionTemplateDefinition | undefined {
    return this.templates.get(id);
  }

  list(): PermissionTemplateDefinition[] {
    return Array.from(this.templates.values());
  }

  count(): number {
    return this.templates.size;
  }

  /** Creates a real `Role` (via the existing `roleService`) seeded with the template's permission bundle — a starting point, not a locked-in shape; the resulting role can be edited like any other. */
  async applyTemplate(templateId: string, roleName?: string): Promise<Role> {
    const template = this.templates.get(templateId);
    if (!template) throw new Error(`Unknown permission template: ${templateId}`);
    return roleService.createRole({ name: roleName ?? template.name, description: template.description, permissions: template.permissions });
  }
}

export const permissionTemplateRegistry = new PermissionTemplateRegistry();
