"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Lock, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useCalixoIdentity } from "@/identity/bridge/useCalixoIdentity";
import { useOrganization, useOrganizationId } from "@/organizations/hooks/useOrganization";
import { organizationPlatformAPI } from "@/core/platform/organizations";
import type { Organization, OrganizationMemberRole, UpdateOrganizationInput } from "@/core/platform/organizations";
import { authorizationPlatformAPI, permissionName } from "@/core/platform/access";
import { initializePlatformFoundation } from "@/core/platform";
import { ModuleEmptyState } from "@/components/enterprise/module";
import { recordSettingsUsage } from "./commercial/SettingsUsageAdapter";
import { logSettingsError, trackSettingsAction } from "./observability/SettingsTelemetry";

/**
 * The brief's dotted permission names (settings.read/update/admin) consolidate onto the platform's
 * 15-verb vocabulary, same as every other module this session. `"settings"` is already a real
 * `ResourceType`; `"admin"` (distinct from `"update"`) gates Advanced Settings specifically.
 */
const SETTINGS_ACTION_PERMISSIONS = {
  read: permissionName("settings", "read"),
  update: permissionName("settings", "update"),
  admin: permissionName("settings", "admin"),
} as const;

/** Users & Teams uses the real `"user"`/`"team"` resources, distinct from `"settings"` — a person can have access to one section without the other. */
const USERS_ACTION_PERMISSIONS = {
  read: permissionName("user", "read"),
  update: permissionName("user", "update"),
  manage: permissionName("user", "manage"),
} as const;

/** Roles & Permissions uses its own `"role"` resource — viewing roles is distinct from editing them, which is distinct from managing role assignments/policies. */
const ROLES_ACTION_PERMISSIONS = {
  read: permissionName("role", "read"),
  update: permissionName("role", "update"),
  manage: permissionName("role", "manage"),
} as const;

/** Workspaces uses the real `"workspace"` resource — already part of the platform's tenant-containment hierarchy, no new resource type needed. */
const WORKSPACES_ACTION_PERMISSIONS = {
  read: permissionName("workspace", "read"),
  update: permissionName("workspace", "update"),
  manage: permissionName("workspace", "manage"),
} as const;

/** Integrations uses the real `"connector"` resource — already a valid `ResourceType`, already used elsewhere (Roles & Permissions' capability list, Ads/Social connector adapters) — no new resource type needed. */
const INTEGRATIONS_ACTION_PERMISSIONS = {
  read: permissionName("connector", "read"),
  update: permissionName("connector", "update"),
  manage: permissionName("connector", "manage"),
} as const;

/** Billing & Plans uses the real `"billing"` resource — already a valid `ResourceType`, already referenced by Roles & Permissions' capability list and Access Matrix ("Manage Billing") — no new resource type needed. */
const BILLING_ACTION_PERMISSIONS = {
  read: permissionName("billing", "read"),
  update: permissionName("billing", "update"),
  manage: permissionName("billing", "manage"),
} as const;

/** Audit Logs is the first Settings module to need a brand-new `"audit"` resource type — confirmed nothing else in the codebase used that name, added additively to `ResourceType`. */
const AUDIT_ACTION_PERMISSIONS = {
  read: permissionName("audit", "read"),
  update: permissionName("audit", "update"),
  manage: permissionName("audit", "manage"),
} as const;

/** API & Webhooks reuses the real `"api"` resource — already a valid `ResourceType`, no new type needed. */
const API_ACTION_PERMISSIONS = {
  read: permissionName("api", "read"),
  update: permissionName("api", "update"),
  manage: permissionName("api", "manage"),
} as const;

interface SettingsTenantContext {
  organizationId: string;
  workspaceId?: string;
  userId: string;
}

interface SettingsContextValue {
  hydrated: boolean;
  organization: Organization | null;
  myRole: OrganizationMemberRole | null;
  tenantContext: SettingsTenantContext;
  currentUserName: string;
  canRead: boolean;
  canUpdate: boolean;
  canAdmin: boolean;
  canReadUsers: boolean;
  canUpdateUsers: boolean;
  canManageUsers: boolean;
  canReadRoles: boolean;
  canUpdateRoles: boolean;
  canManageRoles: boolean;
  canReadWorkspaces: boolean;
  canUpdateWorkspaces: boolean;
  canManageWorkspaces: boolean;
  canReadIntegrations: boolean;
  canUpdateIntegrations: boolean;
  canManageIntegrations: boolean;
  canReadBilling: boolean;
  canUpdateBilling: boolean;
  canManageBilling: boolean;
  canReadAudit: boolean;
  canUpdateAudit: boolean;
  canManageAudit: boolean;
  canReadApi: boolean;
  canUpdateApi: boolean;
  canManageApi: boolean;
  updateOrganization: (input: UpdateOrganizationInput) => Promise<Organization | undefined>;
  archiveOrganization: () => Promise<void>;
  refresh: () => void;
  showToast: (message: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

/**
 * The single Context for Settings — mirrors `ReportsProvider.tsx` exactly (tenant context,
 * permission gating, toast). Unlike Reports, Settings reads/writes the canonical `Organization`
 * record directly via `organizationPlatformAPI` rather than through the legacy
 * `useOrganization()` adapter shape (`OrganizationProfile`) — that adapter exists for the 12
 * pre-existing consumers' display needs, not as the primary read/write path for the module that
 * now owns organization data end to end. After every write this also calls the shared hook's
 * `refreshOrganizations()` so the rest of the app's cached org list stays in sync.
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");
  const [permissions, setPermissions] = useState<string[] | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [myRole, setMyRole] = useState<OrganizationMemberRole | null>(null);

  const { user: clerkUser } = useUser();
  const { identity } = useCalixoIdentity();
  const organizationId = useOrganizationId();
  const { refreshOrganizations } = useOrganization();

  const userId = identity?.userId ?? "";
  const currentUserName = clerkUser?.fullName ?? clerkUser?.firstName ?? "";

  const tenantContext = useMemo<SettingsTenantContext>(() => ({ organizationId: organizationId ?? "", userId }), [organizationId, userId]);

  const loadOrganization = useCallback(() => {
    if (!organizationId) {
      setOrganization(null);
      setMyRole(null);
      return;
    }
    setOrganization(organizationPlatformAPI.get(organizationId) ?? null);
    setMyRole(organizationPlatformAPI.getMembers(organizationId).find(m => m.userId === userId)?.role ?? null);
  }, [organizationId, userId]);

  useEffect(() => {
    (async () => {
      loadOrganization();
    })();
  }, [loadOrganization]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(id);
    }
  }, [toast]);

  /** `null` while identity resolution is still in flight — `middleware.ts` already blocks unauthenticated requests before this component ever renders, so this is a brief loading state, not a permissive "no session" fallback. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!identity) {
        if (!cancelled) setPermissions(null);
        return;
      }
      await initializePlatformFoundation();
      const effective = await authorizationPlatformAPI.getEffectivePermissions(identity.userId, organizationId ?? undefined);
      if (!cancelled) setPermissions(effective);
    })();
    return () => {
      cancelled = true;
    };
  }, [identity, organizationId]);

  const hasPermission = useCallback((permission: string) => !permissions || permissions.includes(permission), [permissions]);
  const canRead = hasPermission(SETTINGS_ACTION_PERMISSIONS.read);
  const canUpdate = hasPermission(SETTINGS_ACTION_PERMISSIONS.update);
  const canAdmin = hasPermission(SETTINGS_ACTION_PERMISSIONS.admin);
  const canReadUsers = hasPermission(USERS_ACTION_PERMISSIONS.read);
  const canUpdateUsers = hasPermission(USERS_ACTION_PERMISSIONS.update);
  const canManageUsers = hasPermission(USERS_ACTION_PERMISSIONS.manage);
  const canReadRoles = hasPermission(ROLES_ACTION_PERMISSIONS.read);
  const canUpdateRoles = hasPermission(ROLES_ACTION_PERMISSIONS.update);
  const canManageRoles = hasPermission(ROLES_ACTION_PERMISSIONS.manage);
  const canReadWorkspaces = hasPermission(WORKSPACES_ACTION_PERMISSIONS.read);
  const canUpdateWorkspaces = hasPermission(WORKSPACES_ACTION_PERMISSIONS.update);
  const canManageWorkspaces = hasPermission(WORKSPACES_ACTION_PERMISSIONS.manage);
  const canReadIntegrations = hasPermission(INTEGRATIONS_ACTION_PERMISSIONS.read);
  const canUpdateIntegrations = hasPermission(INTEGRATIONS_ACTION_PERMISSIONS.update);
  const canManageIntegrations = hasPermission(INTEGRATIONS_ACTION_PERMISSIONS.manage);
  const canReadBilling = hasPermission(BILLING_ACTION_PERMISSIONS.read);
  const canUpdateBilling = hasPermission(BILLING_ACTION_PERMISSIONS.update);
  const canManageBilling = hasPermission(BILLING_ACTION_PERMISSIONS.manage);
  const canReadAudit = hasPermission(AUDIT_ACTION_PERMISSIONS.read);
  const canUpdateAudit = hasPermission(AUDIT_ACTION_PERMISSIONS.update);
  const canManageAudit = hasPermission(AUDIT_ACTION_PERMISSIONS.manage);
  const canReadApi = hasPermission(API_ACTION_PERMISSIONS.read);
  const canUpdateApi = hasPermission(API_ACTION_PERMISSIONS.update);
  const canManageApi = hasPermission(API_ACTION_PERMISSIONS.manage);

  const showToast = useCallback((message: string) => setToast(message), []);

  const updateOrganization = useCallback(
    async (input: UpdateOrganizationInput) => {
      if (!organizationId) return undefined;
      if (!canUpdate) {
        showToast("You don't have permission to update this organization.");
        return undefined;
      }
      try {
        const updated = organizationPlatformAPI.update(organizationId, input, userId);
        if (updated) {
          setOrganization(updated);
          recordSettingsUsage(tenantContext, "settings.organizationUpdated");
          trackSettingsAction("organizationUpdated");
          showToast("Saved.");
          void refreshOrganizations();
        }
        return updated;
      } catch (error) {
        logSettingsError("Failed to update organization", error);
        showToast("Something went wrong saving that change.");
        return undefined;
      }
    },
    [organizationId, canUpdate, userId, tenantContext, showToast, refreshOrganizations]
  );

  const archiveOrganization = useCallback(async () => {
    if (!organizationId) return;
    if (!canAdmin) {
      showToast("You don't have permission to archive this organization.");
      return;
    }
    try {
      organizationPlatformAPI.archive(organizationId, userId);
      showToast("Organization archived.");
      void refreshOrganizations();
      loadOrganization();
    } catch (error) {
      logSettingsError("Failed to archive organization", error);
      showToast("Something went wrong archiving this organization.");
    }
  }, [organizationId, canAdmin, userId, showToast, refreshOrganizations, loadOrganization]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      hydrated,
      organization,
      myRole,
      tenantContext,
      currentUserName,
      canRead,
      canUpdate,
      canAdmin,
      canReadUsers,
      canUpdateUsers,
      canManageUsers,
      canReadRoles,
      canUpdateRoles,
      canManageRoles,
      canReadWorkspaces,
      canUpdateWorkspaces,
      canManageWorkspaces,
      canReadIntegrations,
      canUpdateIntegrations,
      canManageIntegrations,
      canReadBilling,
      canUpdateBilling,
      canManageBilling,
      canReadAudit,
      canUpdateAudit,
      canManageAudit,
      canReadApi,
      canUpdateApi,
      canManageApi,
      updateOrganization,
      archiveOrganization,
      refresh: loadOrganization,
      showToast,
    }),
    [
      hydrated,
      organization,
      myRole,
      tenantContext,
      currentUserName,
      canRead,
      canUpdate,
      canAdmin,
      canReadUsers,
      canUpdateUsers,
      canManageUsers,
      canReadRoles,
      canUpdateRoles,
      canManageRoles,
      canReadWorkspaces,
      canUpdateWorkspaces,
      canManageWorkspaces,
      canReadIntegrations,
      canUpdateIntegrations,
      canManageIntegrations,
      canReadBilling,
      canUpdateBilling,
      canManageBilling,
      canReadAudit,
      canUpdateAudit,
      canManageAudit,
      canReadApi,
      canUpdateApi,
      canManageApi,
      updateOrganization,
      archiveOrganization,
      loadOrganization,
      showToast,
    ]
  );

  if (hydrated && !canRead && !canReadUsers && !canReadRoles && !canReadWorkspaces && !canReadIntegrations && !canReadBilling && !canReadAudit && !canReadApi) {
    return (
      <div className="flex items-center justify-center py-24">
        <ModuleEmptyState icon={<Lock size={32} />} title="You don't have access to Settings" description="Ask an administrator to grant access to Organization, Users & Teams, Roles & Permissions, Workspaces, Integrations, or Billing." />
      </div>
    );
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
      {toast && (
        <div role="status" className="fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3 rounded-2xl border border-success/20 bg-card px-4 py-3 text-sm text-foreground shadow-2xl">
          <CheckCircle2 size={18} className="text-success" />
          <span>{toast}</span>
          <button onClick={() => setToast("")} className="ml-2 text-muted-foreground hover:text-foreground">
            <X size={15} />
          </button>
        </div>
      )}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettingsContext must be used within SettingsProvider");
  return context;
}
