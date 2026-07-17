"use client";

import { useMemo, useState } from "react";
import { UserPlus, Search, Pencil, UserX, UserCheck, Trash2, RotateCcw, MoreVertical } from "lucide-react";
import Link from "next/link";
import { ModuleHeader, EnterpriseDataTable, type DataTableColumn } from "@/components/enterprise/module";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useUsers } from "@/hooks/useUsers";
import { useTeams } from "@/hooks/useTeams";
import { usePresence } from "@/hooks/usePresence";
import { ACCESS_LEVEL_LABELS, PEOPLE_ACCESS_LEVELS } from "@/core/users";
import type { PeopleAccessLevel, User, UserStatus } from "@/core/users";
import { formatRelativeTime } from "@/shared/utils/date";

const STATUS_LABELS: Record<UserStatus, string> = {
  active: "Active",
  invited: "Invited",
  suspended: "Suspended",
  disabled: "Disabled",
  archived: "Archived",
  pending: "Pending",
};

const STATUS_BADGE: Record<UserStatus, string> = {
  active: "bg-success/10 text-success",
  invited: "bg-info/10 text-info",
  suspended: "bg-warning/10 text-warning",
  disabled: "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground",
  pending: "bg-info/10 text-info",
};

function initials(name: string): string {
  return name
    .split(" ")
    .map(p => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function PeoplePage() {
  const { tenantContext, canUpdateUsers, canManageUsers } = useSettingsContext();
  const organizationId = tenantContext.organizationId;
  const users = useUsers(organizationId);
  const teams = useTeams(organizationId);
  const presence = usePresence();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [teamFilter, setTeamFilter] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<User | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const teamNameFor = (user: User) => (user.teamIds.length > 0 ? (teams.lookup(user.teamIds[0])?.name ?? "—") : "—");

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.users
      .filter(u => !q || u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.title.toLowerCase().includes(q))
      .filter(u => !statusFilter || u.status === statusFilter)
      .filter(u => !teamFilter || u.teamIds.includes(teamFilter));
  }, [users.users, search, statusFilter, teamFilter]);

  const columns: DataTableColumn<User>[] = [
    {
      id: "person",
      header: "Person",
      accessor: user => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials(user.displayName)}</div>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{user.displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user.title}</p>
          </div>
        </div>
      ),
    },
    { id: "email", header: "Email", accessor: "email", sortable: true },
    { id: "team", header: "Team", accessor: user => teamNameFor(user) },
    { id: "role", header: "Role", accessor: user => ACCESS_LEVEL_LABELS[user.accessLevel] },
    {
      id: "status",
      header: "Status",
      accessor: user => <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[user.status]}`}>{STATUS_LABELS[user.status]}</span>,
    },
    {
      id: "lastActive",
      header: "Last Active",
      accessor: user => formatRelativeTime(presence.recordFor(user.id)?.lastActiveAt ?? user.updatedAt),
      sortable: true,
    },
  ];

  return (
    <div>
      <ModuleHeader
        title="People"
        description="Everyone in your organization."
        quickActions={
          <Button asChild>
            <Link href="/dashboard/settings/users/invitations">
              <UserPlus size={16} />
              Invite Person
            </Link>
          </Button>
        }
      />

      {actionError && <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{actionError}</p>}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input inputSize="sm" placeholder="Search people…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as UserStatus | "")} className="input input-sm w-auto">
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)} className="input input-sm w-auto">
          <option value="">All teams</option>
          {teams.teams.map(team => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <EnterpriseDataTable
        data={filteredUsers}
        columns={columns}
        emptyMessage="No one matches these filters."
        onRowClick={canUpdateUsers ? user => setEditingUser(user) : undefined}
        renderExtra={user => (
          <div className="relative">
            <button
              onClick={e => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === user.id ? null : user.id);
              }}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label={`Actions for ${user.displayName}`}
            >
              <MoreVertical size={15} />
            </button>
            {openMenuId === user.id && (
              <div onClick={e => e.stopPropagation()} className="absolute right-0 top-full z-10 mt-1 w-44 rounded-xl border border-border bg-card p-1 shadow-xl">
                <button
                  onClick={() => {
                    setEditingUser(user);
                    setOpenMenuId(null);
                  }}
                  disabled={!canUpdateUsers}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-foreground hover:bg-accent disabled:opacity-40"
                >
                  <Pencil size={14} /> Edit User
                </button>
                {user.status === "suspended" ? (
                  <button
                    onClick={() => {
                      setActionError(null);
                      const result = users.reinstate(user.id);
                      if (!result.success) setActionError(result.errors[0] ?? `Couldn't reinstate ${user.displayName}.`);
                      setOpenMenuId(null);
                    }}
                    disabled={!canManageUsers}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-foreground hover:bg-accent disabled:opacity-40"
                  >
                    <UserCheck size={14} /> Reinstate
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActionError(null);
                      const result = users.suspend(user.id);
                      if (!result.success) setActionError(result.errors[0] ?? `Couldn't suspend ${user.displayName}.`);
                      setOpenMenuId(null);
                    }}
                    disabled={!canManageUsers}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-foreground hover:bg-accent disabled:opacity-40"
                  >
                    <UserX size={14} /> Suspend User
                  </button>
                )}
                <button
                  onClick={() => {
                    setActionError(null);
                    const result = users.resetAccess(user.id);
                    if (!result.success) setActionError(result.errors[0] ?? `Couldn't reset access for ${user.displayName}.`);
                    setOpenMenuId(null);
                  }}
                  disabled={!canManageUsers}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-foreground hover:bg-accent disabled:opacity-40"
                >
                  <RotateCcw size={14} /> Reset Access
                </button>
                <button
                  onClick={() => {
                    setConfirmRemove(user);
                    setOpenMenuId(null);
                  }}
                  disabled={!canManageUsers}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-destructive hover:bg-destructive/10 disabled:opacity-40"
                >
                  <Trash2 size={14} /> Remove User
                </button>
              </div>
            )}
          </div>
        )}
      />

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          canUpdate={canUpdateUsers}
          onClose={() => setEditingUser(null)}
          onSave={patch => {
            users.updateProfile(editingUser.id, patch);
            if (patch.accessLevel !== undefined) users.updateAccessLevel(editingUser.id, patch.accessLevel);
            setEditingUser(null);
          }}
        />
      )}

      {confirmRemove && (
        <SimpleDialog title={`Remove ${confirmRemove.displayName}?`} description="They'll lose access to this organization immediately. This can't be undone." onClose={() => setConfirmRemove(null)}>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmRemove(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setActionError(null);
                const removed = users.remove(confirmRemove.id, tenantContext.userId);
                if (removed) {
                  setConfirmRemove(null);
                } else {
                  setActionError(`Couldn't remove ${confirmRemove.displayName}. Please try again.`);
                }
              }}
            >
              Remove
            </Button>
          </div>
        </SimpleDialog>
      )}
    </div>
  );
}

function EditUserDialog({ user, canUpdate, onClose, onSave }: { user: User; canUpdate: boolean; onClose: () => void; onSave: (patch: Partial<User> & { accessLevel?: PeopleAccessLevel }) => void }) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [title, setTitle] = useState(user.title);
  const [department, setDepartment] = useState(user.department);
  const [accessLevel, setAccessLevel] = useState<PeopleAccessLevel>(user.accessLevel);

  return (
    <SimpleDialog title="Edit Person" onClose={onClose}>
      <div className="space-y-3">
        <Input label="Name" value={displayName} onChange={e => setDisplayName(e.target.value)} disabled={!canUpdate} />
        <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} disabled={!canUpdate} />
        <Input label="Department" value={department} onChange={e => setDepartment(e.target.value)} disabled={!canUpdate} />
        <div>
          <label className="label">Access Level</label>
          <select className="input" value={accessLevel} onChange={e => setAccessLevel(e.target.value as PeopleAccessLevel)} disabled={!canUpdate}>
            {PEOPLE_ACCESS_LEVELS.map(level => (
              <option key={level} value={level}>
                {ACCESS_LEVEL_LABELS[level]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={!canUpdate} onClick={() => onSave({ displayName, title, department, accessLevel })}>
          Save Changes
        </Button>
      </div>
    </SimpleDialog>
  );
}
