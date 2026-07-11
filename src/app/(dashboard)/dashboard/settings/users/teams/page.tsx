"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Users, Archive, UserPlus, UserMinus } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useTeams } from "@/hooks/useTeams";
import { useUsers } from "@/hooks/useUsers";
import type { Team, User } from "@/core/users";

const TEAM_COLORS = ["#4F46E5", "#0EA5E9", "#16A34A", "#D97706", "#DC2626", "#7C3AED", "#0891B2", "#DB2777"];

function initials(name: string): string {
  return name
    .split(" ")
    .map(p => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function TeamsPage() {
  const { tenantContext, canUpdateUsers, canManageUsers } = useSettingsContext();
  const organizationId = tenantContext.organizationId;
  const teams = useTeams(organizationId);
  const users = useUsers(organizationId);

  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState<Team | null>(null);
  const [managingMembers, setManagingMembers] = useState<Team | null>(null);
  const [confirmArchive, setConfirmArchive] = useState<Team | null>(null);

  const leadNameFor = (team: Team) => (team.managerId ? (users.lookup(team.managerId)?.displayName ?? "—") : "—");

  return (
    <div>
      <ModuleHeader
        title="Teams"
        description="Group people by team, with a lead and shared access."
        quickActions={
          canManageUsers && (
            <Button onClick={() => setCreating(true)}>
              <Plus size={16} />
              Create Team
            </Button>
          )
        }
      />

      {teams.teams.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No teams yet. Create one to get started.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.teams.map(team => (
            <div key={team.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: team.color ?? "#4F46E5" }}>
                  {initials(team.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{team.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{team.description}</p>
                </div>
              </div>

              <dl className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Team Lead</dt>
                  <dd className="font-medium text-foreground">{leadNameFor(team)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Members</dt>
                  <dd className="font-medium text-foreground">{team.memberIds.length}</dd>
                </div>
              </dl>

              {canUpdateUsers && (
                <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-4">
                  <Button size="xs" variant="outline" onClick={() => setRenaming(team)}>
                    <Pencil size={12} /> Rename
                  </Button>
                  <Button size="xs" variant="outline" onClick={() => setManagingMembers(team)}>
                    <Users size={12} /> Members
                  </Button>
                  {canManageUsers && (
                    <Button size="xs" variant="outline" onClick={() => setConfirmArchive(team)}>
                      <Archive size={12} /> Archive
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {creating && (
        <CreateTeamDialog
          onClose={() => setCreating(false)}
          onCreate={input => {
            teams.createTeam(input);
            setCreating(false);
          }}
        />
      )}

      {renaming && (
        <RenameTeamDialog
          team={renaming}
          onClose={() => setRenaming(null)}
          onSave={name => {
            teams.renameTeam(renaming.id, name);
            setRenaming(null);
          }}
        />
      )}

      {managingMembers && (
        <ManageMembersDialog
          team={managingMembers}
          allPeople={users.users}
          onClose={() => setManagingMembers(null)}
          onAdd={ids => teams.addMembers(managingMembers.id, ids)}
          onRemove={ids => teams.removeMembers(managingMembers.id, ids)}
        />
      )}

      {confirmArchive && (
        <SimpleDialog title={`Archive ${confirmArchive.name}?`} description="Archived teams are hidden from People and Teams, but their history is kept." onClose={() => setConfirmArchive(null)}>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmArchive(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                teams.archiveTeam(confirmArchive.id);
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

function CreateTeamDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (input: { name: string; description?: string; workspaceId: string; color: string }) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(TEAM_COLORS[0]);

  return (
    <SimpleDialog title="Create Team" onClose={onClose}>
      <div className="space-y-3">
        <Input label="Team Name" placeholder="Marketing" value={name} onChange={e => setName(e.target.value)} />
        <Input label="Description" placeholder="Brand, campaigns, and growth." value={description} onChange={e => setDescription(e.target.value)} />
        <div>
          <label className="label">Color</label>
          <div className="flex flex-wrap gap-2">
            {TEAM_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Choose color ${c}`}
                className="h-7 w-7 rounded-full ring-offset-2 ring-offset-card"
                style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px var(--card), 0 0 0 4px ${c}` : undefined }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={!name.trim()} onClick={() => onCreate({ name: name.trim(), description: description.trim() || undefined, workspaceId: "workspace-growth-engine", color })}>
          Create Team
        </Button>
      </div>
    </SimpleDialog>
  );
}

function RenameTeamDialog({ team, onClose, onSave }: { team: Team; onClose: () => void; onSave: (name: string) => void }) {
  const [name, setName] = useState(team.name);
  return (
    <SimpleDialog title="Rename Team" onClose={onClose}>
      <Input label="Team Name" value={name} onChange={e => setName(e.target.value)} />
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={!name.trim()} onClick={() => onSave(name.trim())}>
          Save
        </Button>
      </div>
    </SimpleDialog>
  );
}

function ManageMembersDialog({
  team,
  allPeople,
  onClose,
  onAdd,
  onRemove,
}: {
  team: Team;
  allPeople: User[];
  onClose: () => void;
  onAdd: (ids: string[]) => void;
  onRemove: (ids: string[]) => void;
}) {
  const memberIds = useMemo(() => new Set(team.memberIds), [team.memberIds]);

  return (
    <SimpleDialog title={`${team.name} Members`} description="Choose who belongs to this team." onClose={onClose}>
      <div className="max-h-80 space-y-1 overflow-y-auto">
        {allPeople.map(person => {
          const isMember = memberIds.has(person.id);
          return (
            <div key={person.id} className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-accent">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{person.displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{person.title}</p>
              </div>
              <Button size="xs" variant={isMember ? "outline" : "primary"} onClick={() => (isMember ? onRemove([person.id]) : onAdd([person.id]))}>
                {isMember ? (
                  <>
                    <UserMinus size={12} /> Remove
                  </>
                ) : (
                  <>
                    <UserPlus size={12} /> Add
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Done
        </Button>
      </div>
    </SimpleDialog>
  );
}
