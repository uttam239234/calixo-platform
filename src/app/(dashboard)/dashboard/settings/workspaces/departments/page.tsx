"use client";

import { useState } from "react";
import { Pencil, Archive, UserCog } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useWorkspaces, type WorkspaceCard } from "@/hooks/useWorkspaces";
import { useTeams } from "@/hooks/useTeams";
import { useUsers } from "@/hooks/useUsers";
import { iconForDepartment, DEPARTMENT_STARTERS } from "@/features/settings/workspaces/constants";

export default function DepartmentsPage() {
  const { tenantContext, canUpdateWorkspaces, canManageWorkspaces } = useSettingsContext();
  const organizationId = tenantContext.organizationId;
  const workspaces = useWorkspaces(organizationId);
  const teams = useTeams(organizationId);
  const users = useUsers(organizationId);

  const [renaming, setRenaming] = useState<WorkspaceCard | null>(null);
  const [assigningLead, setAssigningLead] = useState<WorkspaceCard | null>(null);
  const [confirmArchive, setConfirmArchive] = useState<WorkspaceCard | null>(null);

  const usedNames = new Set(workspaces.cards.map(c => c.workspace.name.toLowerCase()));

  return (
    <div>
      <ModuleHeader title="Departments" description="Create and manage departments, with starter templates for common ones." />

      {canManageWorkspaces && (
        <div className="mb-6 rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Starter templates — one click setup</h3>
          <div className="flex flex-wrap gap-2">
            {DEPARTMENT_STARTERS.map(starter => {
              const alreadyExists = usedNames.has(starter.name.toLowerCase());
              return (
                <button
                  key={starter.name}
                  type="button"
                  disabled={alreadyExists}
                  onClick={() => workspaces.createDepartment(starter)}
                  className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span>{iconForDepartment(starter.name)}</span>
                  {starter.name}
                  {alreadyExists && <span className="text-xs text-muted-foreground">(added)</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {workspaces.cards.map(card => (
          <div key={card.workspace.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg">{iconForDepartment(card.workspace.name)}</div>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{card.workspace.name}</p>
                <p className="truncate text-xs text-muted-foreground">{card.workspace.description || "No description yet"}</p>
              </div>
            </div>
            <div className="flex flex-shrink-0 flex-wrap items-center gap-3 text-sm">
              <span className="text-muted-foreground">
                Lead: <span className="font-medium text-foreground">{card.leadName ?? "Unassigned"}</span>
              </span>
              {canUpdateWorkspaces && (
                <>
                  <Button size="xs" variant="outline" onClick={() => setRenaming(card)}>
                    <Pencil size={12} /> Rename
                  </Button>
                  <Button size="xs" variant="outline" onClick={() => setAssigningLead(card)}>
                    <UserCog size={12} /> Assign Lead
                  </Button>
                </>
              )}
              {canManageWorkspaces && (
                <Button size="xs" variant="outline" onClick={() => setConfirmArchive(card)}>
                  <Archive size={12} /> Archive
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {renaming && (
        <SimpleDialog title="Rename Department" onClose={() => setRenaming(null)}>
          <RenameForm
            initialName={renaming.workspace.name}
            initialDescription={renaming.workspace.description}
            onSave={(name, description) => {
              workspaces.updateDepartment(renaming.workspace.id, { name, description });
              setRenaming(null);
            }}
            onCancel={() => setRenaming(null)}
          />
        </SimpleDialog>
      )}

      {assigningLead && (
        <SimpleDialog title={`Assign ${assigningLead.workspace.name}'s Lead`} onClose={() => setAssigningLead(null)}>
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {users.users.map(person => (
              <button
                key={person.id}
                type="button"
                onClick={() => {
                  if (assigningLead.team) teams.setLead(assigningLead.team.id, person.id);
                  setAssigningLead(null);
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
              >
                <span className="text-foreground">{person.displayName}</span>
                {assigningLead.leadId === person.id && <span className="text-xs text-primary">Current lead</span>}
              </button>
            ))}
          </div>
        </SimpleDialog>
      )}

      {confirmArchive && (
        <SimpleDialog title={`Archive ${confirmArchive.workspace.name}?`} description="People currently in this department keep their history, but it's hidden from this list." onClose={() => setConfirmArchive(null)}>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmArchive(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                workspaces.archiveDepartment(confirmArchive.workspace.id);
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

function RenameForm({
  initialName,
  initialDescription,
  onSave,
  onCancel,
}: {
  initialName: string;
  initialDescription?: string;
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");

  return (
    <div>
      <div className="space-y-3">
        <Input label="Department Name" value={name} onChange={e => setName(e.target.value)} />
        <Input label="Description" value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={!name.trim()} onClick={() => onSave(name.trim(), description.trim())}>
          Save
        </Button>
      </div>
    </div>
  );
}
