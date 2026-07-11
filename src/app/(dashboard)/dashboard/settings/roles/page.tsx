"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Copy, Archive, Check, X, Search } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useRoles } from "@/hooks/useRoles";
import { useUsers } from "@/hooks/useUsers";
import { permissionName } from "@/core/platform/access";
import type { Role } from "@/access/types";
import { CAPABILITY_CHECKS, FEATURE_CHECKS, ROLE_ICONS, roleHasPermission } from "@/features/settings/roles/capabilities";

export default function RolesPage() {
  const { tenantContext, canUpdateRoles, canManageRoles } = useSettingsContext();
  const organizationId = tenantContext.organizationId;
  const roles = useRoles(organizationId);
  const users = useUsers(organizationId);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [confirmArchive, setConfirmArchive] = useState<Role | null>(null);

  const [checkPersonId, setCheckPersonId] = useState("");
  const [checkFeatureId, setCheckFeatureId] = useState("");

  const checkResult = useMemo(() => {
    if (!checkPersonId || !checkFeatureId) return null;
    const feature = FEATURE_CHECKS.find(f => f.id === checkFeatureId);
    if (!feature) return null;
    const permissions = roles.permissionsForPerson(checkPersonId);
    return roleHasPermission(permissions, permissionName(feature.resource, feature.action));
  }, [checkPersonId, checkFeatureId, roles]);

  const checkPersonName = users.users.find(u => u.id === checkPersonId)?.displayName;
  const checkFeatureLabel = FEATURE_CHECKS.find(f => f.id === checkFeatureId)?.label;

  return (
    <div>
      <ModuleHeader
        title="Roles"
        description="Who can do what in your organization."
        quickActions={
          canManageRoles && (
            <Button onClick={() => setCreating(true)}>
              <Plus size={16} />
              Create Role
            </Button>
          )
        }
      />

      <div className="mb-6 rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <Search size={15} className="text-muted-foreground" />
          Quick Check
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label className="label">Can</label>
            <select className="input" value={checkPersonId} onChange={e => setCheckPersonId(e.target.value)}>
              <option value="">Choose a person…</option>
              {users.users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.displayName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">access</label>
            <select className="input" value={checkFeatureId} onChange={e => setCheckFeatureId(e.target.value)}>
              <option value="">Choose a feature…</option>
              {FEATURE_CHECKS.map(f => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div className="pb-0.5">
            {checkResult !== null ? (
              <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${checkResult ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                {checkResult ? <Check size={15} /> : <X size={15} />}
                {checkPersonName} {checkResult ? "can" : "cannot"} access {checkFeatureLabel}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">Pick both to see the answer instantly.</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roles.roles.map(role => {
          const permissions = roles.permissionsByRole[role.id] ?? [];
          const isDefault = roles.isDefaultRole(role);
          return (
            <div key={role.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl">{ROLE_ICONS[role.slug] ?? "🔑"}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{role.name}</p>
                  <p className="text-xs text-muted-foreground">{roles.countByRole[role.id] ?? 0} people</p>
                </div>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">{role.description}</p>

              <div className="mt-4 space-y-1.5 border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{role.name} can:</p>
                {CAPABILITY_CHECKS.map(capability => {
                  const allowed = roleHasPermission(permissions, capability.permission);
                  return (
                    <div key={capability.label} className="flex items-center gap-2 text-sm">
                      {allowed ? <Check size={14} className="flex-shrink-0 text-success" /> : <X size={14} className="flex-shrink-0 text-muted-foreground" />}
                      <span className={allowed ? "text-foreground" : "text-muted-foreground"}>{capability.label}</span>
                    </div>
                  );
                })}
              </div>

              {canUpdateRoles && (
                <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-4">
                  <Button size="xs" variant="outline" onClick={() => setEditing(role)}>
                    <Pencil size={12} /> Edit
                  </Button>
                  <Button size="xs" variant="outline" onClick={() => roles.duplicateRole(role)}>
                    <Copy size={12} /> Duplicate
                  </Button>
                  {!isDefault && canManageRoles && (
                    <Button size="xs" variant="outline" onClick={() => setConfirmArchive(role)}>
                      <Archive size={12} /> Archive
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {creating && (
        <RoleFormDialog
          title="Create Role"
          onClose={() => setCreating(false)}
          onSave={async (name, description, permissions) => {
            await roles.createRole({ name, description, permissions });
            setCreating(false);
          }}
        />
      )}

      {editing && (
        <RoleFormDialog
          title="Edit Role"
          initialName={editing.name}
          initialDescription={editing.description}
          initialPermissions={roles.permissionsByRole[editing.id] ?? []}
          onClose={() => setEditing(null)}
          onSave={async (name, description, permissions) => {
            await roles.updateRole(editing.id, { name, description, permissions });
            setEditing(null);
          }}
        />
      )}

      {confirmArchive && (
        <SimpleDialog title={`Archive ${confirmArchive.name}?`} description="People currently assigned this role keep it until you reassign them. Archived roles are hidden from this list." onClose={() => setConfirmArchive(null)}>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmArchive(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await roles.archiveRole(confirmArchive.id);
                setConfirmArchive(null);
              }}
            >
              Archive
            </Button>
          </div>
        </SimpleDialog>
      )}
    </div>
  );
}

function RoleFormDialog({
  title,
  initialName = "",
  initialDescription = "",
  initialPermissions = [],
  onClose,
  onSave,
}: {
  title: string;
  initialName?: string;
  initialDescription?: string;
  initialPermissions?: string[];
  onClose: () => void;
  onSave: (name: string, description: string, permissions: string[]) => void | Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [selected, setSelected] = useState<Set<string>>(new Set(initialPermissions));

  const toggle = (permission: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(permission)) next.delete(permission);
      else next.add(permission);
      return next;
    });
  };

  return (
    <SimpleDialog title={title} onClose={onClose}>
      <div className="space-y-3">
        <Input label="Role Name" placeholder="Admissions Manager" value={name} onChange={e => setName(e.target.value)} />
        <Input label="Description" placeholder="What does this role let someone do?" value={description} onChange={e => setDescription(e.target.value)} />
        <div>
          <label className="label">This role can:</label>
          <div className="space-y-1.5 rounded-xl border border-border p-3">
            {CAPABILITY_CHECKS.map(capability => (
              <label key={capability.permission} className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={selected.has(capability.permission)} onChange={() => toggle(capability.permission)} className="accent-primary" />
                {capability.label}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={!name.trim()} onClick={() => onSave(name.trim(), description.trim(), Array.from(selected))}>
          Save
        </Button>
      </div>
    </SimpleDialog>
  );
}
