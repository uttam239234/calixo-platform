"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Crown, Plus, X } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { Button } from "@/components/ui/button";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useWorkspaces, type WorkspaceCard } from "@/hooks/useWorkspaces";
import { useUsers } from "@/hooks/useUsers";
import { useTeams } from "@/hooks/useTeams";
import { iconForDepartment } from "@/features/settings/workspaces/constants";
import { ACCESS_LEVEL_LABELS, PEOPLE_ACCESS_LEVELS } from "@/core/users";
import type { PeopleAccessLevel, User } from "@/core/users";

const STATUS_DOT: Record<string, string> = {
  active: "bg-success",
  invited: "bg-info",
  suspended: "bg-warning",
  disabled: "bg-muted-foreground",
  archived: "bg-muted-foreground",
  pending: "bg-info",
};

function initials(name: string): string {
  return name
    .split(" ")
    .map(p => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function MembersPage() {
  const { tenantContext, canManageWorkspaces } = useSettingsContext();
  const organizationId = tenantContext.organizationId;
  const openedWorkspaceId = useSearchParams().get("workspace");
  const workspaces = useWorkspaces(organizationId);
  const users = useUsers(organizationId);
  const teams = useTeams(organizationId);

  const [draggingPersonId, setDraggingPersonId] = useState<string | null>(null);
  const [dragOverWorkspaceId, setDragOverWorkspaceId] = useState<string | null>(null);
  const [addingTo, setAddingTo] = useState<WorkspaceCard | null>(null);
  const [changingRoleFor, setChangingRoleFor] = useState<User | null>(null);

  const personWorkspaceId = (personId: string) => users.users.find(u => u.id === personId)?.workspaceId;

  const handleDrop = (toWorkspaceId: string, personId: string) => {
    workspaces.moveMember(personId, personWorkspaceId(personId), toWorkspaceId);
    setDraggingPersonId(null);
    setDragOverWorkspaceId(null);
  };

  return (
    <div>
      <ModuleHeader title="Members" description="Who's in each workspace — drag a person onto another workspace to move them." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workspaces.cards.map(card => {
          const members = users.users.filter(u => card.memberIds.includes(u.id));
          const isDragOver = dragOverWorkspaceId === card.workspace.id;
          return (
            <div
              key={card.workspace.id}
              onDragOver={e => {
                if (!draggingPersonId) return;
                e.preventDefault();
                setDragOverWorkspaceId(card.workspace.id);
              }}
              onDragLeave={() => setDragOverWorkspaceId(prev => (prev === card.workspace.id ? null : prev))}
              onDrop={e => {
                e.preventDefault();
                if (draggingPersonId) handleDrop(card.workspace.id, draggingPersonId);
              }}
              className={`rounded-2xl border bg-card p-4 transition-colors ${
                isDragOver ? "border-primary bg-primary/5" : openedWorkspaceId === card.workspace.id ? "border-primary ring-2 ring-primary/30" : "border-border"
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-lg">{iconForDepartment(card.workspace.name)}</span>
                  <p className="truncate font-semibold text-foreground">{card.workspace.name}</p>
                </div>
                {canManageWorkspaces && (
                  <button type="button" onClick={() => setAddingTo(card)} className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label={`Add member to ${card.workspace.name}`}>
                    <Plus size={15} />
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {members.length === 0 ? (
                  <p className="py-3 text-center text-xs text-muted-foreground">No one here yet.</p>
                ) : (
                  members.map(person => (
                    <div
                      key={person.id}
                      draggable={canManageWorkspaces}
                      onDragStart={() => setDraggingPersonId(person.id)}
                      onDragEnd={() => {
                        setDraggingPersonId(null);
                        setDragOverWorkspaceId(null);
                      }}
                      className="flex items-center gap-2 rounded-xl border border-transparent px-2 py-1.5 hover:border-border hover:bg-accent/60"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">{initials(person.displayName)}</div>
                        <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-card ${STATUS_DOT[person.status]}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-foreground">{person.displayName}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{ACCESS_LEVEL_LABELS[person.accessLevel]}</p>
                      </div>
                      {canManageWorkspaces && (
                        <div className="flex flex-shrink-0 items-center gap-0.5">
                          {card.leadId === person.id ? (
                            <span title="Workspace lead">
                              <Crown size={13} className="text-warning" />
                            </span>
                          ) : (
                            <button
                              type="button"
                              title="Transfer workspace ownership"
                              onClick={() => card.team && teams.setLead(card.team.id, person.id)}
                              className="rounded p-1 text-muted-foreground hover:text-warning"
                            >
                              <Crown size={13} />
                            </button>
                          )}
                          <button type="button" title="Change role" onClick={() => setChangingRoleFor(person)} className="rounded px-1 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground">
                            Role
                          </button>
                          <button type="button" title="Remove from workspace" onClick={() => teams.removeMembers(card.team?.id ?? "", [person.id])} className="rounded p-1 text-muted-foreground hover:text-destructive">
                            <X size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Keyboard/non-drag fallback for the same reassignment action. */}
              {canManageWorkspaces && members.length > 0 && (
                <label className="mt-3 block">
                  <span className="sr-only">Move a person into {card.workspace.name}</span>
                  <select
                    className="input input-sm w-full"
                    value=""
                    onChange={e => {
                      if (e.target.value) handleDrop(card.workspace.id, e.target.value);
                    }}
                  >
                    <option value="">Move a person here…</option>
                    {users.users
                      .filter(u => !card.memberIds.includes(u.id))
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          {u.displayName}
                        </option>
                      ))}
                  </select>
                </label>
              )}
            </div>
          );
        })}
      </div>

      {addingTo && (
        <SimpleDialog title={`Add to ${addingTo.workspace.name}`} onClose={() => setAddingTo(null)}>
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {users.users
              .filter(u => !addingTo.memberIds.includes(u.id))
              .map(person => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => {
                    workspaces.moveMember(person.id, personWorkspaceId(person.id), addingTo.workspace.id);
                    setAddingTo(null);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">{initials(person.displayName)}</div>
                  <span className="text-foreground">{person.displayName}</span>
                </button>
              ))}
            {users.users.filter(u => !addingTo.memberIds.includes(u.id)).length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">Everyone is already in this workspace.</p>}
          </div>
        </SimpleDialog>
      )}

      {changingRoleFor && (
        <SimpleDialog title={`${changingRoleFor.displayName}'s Role`} onClose={() => setChangingRoleFor(null)}>
          <div className="space-y-1">
            {PEOPLE_ACCESS_LEVELS.map((level: PeopleAccessLevel) => (
              <button
                key={level}
                type="button"
                onClick={() => {
                  users.updateAccessLevel(changingRoleFor.id, level);
                  setChangingRoleFor(null);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-accent ${changingRoleFor.accessLevel === level ? "bg-primary/10" : ""}`}
              >
                {ACCESS_LEVEL_LABELS[level]}
              </button>
            ))}
          </div>
        </SimpleDialog>
      )}
    </div>
  );
}
