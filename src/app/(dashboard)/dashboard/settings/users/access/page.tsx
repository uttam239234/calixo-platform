"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useUsers } from "@/hooks/useUsers";
import { useRoles } from "@/hooks/useRoles";
import { ACCESS_LEVEL_LABELS } from "@/core/users";
import { CAPABILITY_CHECKS, roleHasPermission } from "@/features/settings/roles/capabilities";

/**
 * Round 10 shipped this page with a hardcoded capability matrix, disclosed
 * as a placeholder: no real `UserRoleAssignment` existed for the People
 * roster yet. Round 11 (Roles & Permissions) closes that gap — every
 * roster person now has a real role assignment — so this reads the actual
 * `AuthorizationPlatformAPI`-backed permission set via `useRoles`'s
 * `permissionsForPerson()`, not a lookup table.
 */
export default function AccessSummaryPage() {
  const { tenantContext } = useSettingsContext();
  const users = useUsers(tenantContext.organizationId);
  const roles = useRoles(tenantContext.organizationId);

  const [viewAsUserId, setViewAsUserId] = useState("");
  const selectedId = viewAsUserId || users.users[0]?.id || "";
  const selectedUser = users.users.find(u => u.id === selectedId) ?? null;
  const permissions = selectedUser ? roles.permissionsForPerson(selectedUser.id) : [];

  return (
    <div>
      <ModuleHeader title="Access Summary" description="A plain-language view of what each person can do — no permission codes." />

      <div className="mb-6 max-w-xs">
        <label className="label">View As User</label>
        <select className="input" value={selectedId} onChange={e => setViewAsUserId(e.target.value)}>
          {users.users.map(user => (
            <option key={user.id} value={user.id}>
              {user.displayName}
            </option>
          ))}
        </select>
      </div>

      {selectedUser && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="mb-4 text-base">
            <span className="font-semibold text-foreground">{selectedUser.displayName}</span>{" "}
            <span className="text-muted-foreground">({ACCESS_LEVEL_LABELS[selectedUser.accessLevel]}) can:</span>
          </p>
          <ul className="space-y-2.5">
            {CAPABILITY_CHECKS.map(capability => {
              const allowed = roleHasPermission(permissions, capability.permission);
              return (
                <li key={capability.label} className="flex items-center gap-2.5 text-sm">
                  {allowed ? <Check size={16} className="flex-shrink-0 text-success" /> : <X size={16} className="flex-shrink-0 text-muted-foreground" />}
                  <span className={allowed ? "text-foreground" : "text-muted-foreground"}>{capability.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
