"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Archive, ExternalLink, Sparkles, Users } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { SimpleDialog } from "@/components/settings/users/SimpleDialog";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useWorkspaces, type WorkspaceCard } from "@/hooks/useWorkspaces";
import { iconForDepartment, WORKSPACE_TEMPLATES } from "@/features/settings/workspaces/constants";
import { formatRelativeTime } from "@/shared/utils/date";

export default function WorkspaceOverviewPage() {
  const router = useRouter();
  const { tenantContext, canUpdateWorkspaces, canManageWorkspaces } = useSettingsContext();
  const organizationId = tenantContext.organizationId;
  const workspaces = useWorkspaces(organizationId);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<WorkspaceCard | null>(null);
  const [confirmArchive, setConfirmArchive] = useState<WorkspaceCard | null>(null);
  const [applyingTemplate, setApplyingTemplate] = useState(false);

  const applyTemplate = (templateId: string) => {
    const template = WORKSPACE_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    for (const department of template.departments) {
      workspaces.createDepartment(department);
    }
    setApplyingTemplate(false);
  };

  return (
    <div>
      <ModuleHeader
        title="Workspace Overview"
        description="Your departments — Marketing, Admissions, Finance, and the rest."
        quickActions={
          canManageWorkspaces && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setApplyingTemplate(true)}>
                <Sparkles size={16} />
                Use a Template
              </Button>
              <Button onClick={() => setCreating(true)}>
                <Plus size={16} />
                Create Workspace
              </Button>
            </div>
          )
        }
      />

      {workspaces.cards.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No workspaces yet. Create one or use a template to get started.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.cards.map(card => (
            <div key={card.workspace.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl">{iconForDepartment(card.workspace.name)}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{card.workspace.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{card.workspace.description}</p>
                </div>
              </div>

              <dl className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Workspace Lead</dt>
                  <dd className="font-medium text-foreground">{card.leadName ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Members</dt>
                  <dd className="font-medium text-foreground">{card.memberCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Integrations</dt>
                  <dd className="font-medium text-foreground">{card.connectedIntegrations}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Reports</dt>
                  <dd className="font-medium text-foreground">{card.reportsCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Content</dt>
                  <dd className="font-medium text-foreground">{card.contentCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Last Activity</dt>
                  <dd className="font-medium text-foreground">{card.lastActivityAt ? formatRelativeTime(card.lastActivityAt) : "—"}</dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-4">
                <Button size="xs" variant="outline" onClick={() => router.push(`/dashboard/settings/workspaces/members?workspace=${card.workspace.id}`)}>
                  <ExternalLink size={12} /> Open
                </Button>
                {canUpdateWorkspaces && (
                  <Button size="xs" variant="outline" onClick={() => setEditing(card)}>
                    <Pencil size={12} /> Edit
                  </Button>
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
      )}

      {creating && (
        <WorkspaceFormDialog
          title="Create Workspace"
          onClose={() => setCreating(false)}
          onSave={(name, description) => {
            workspaces.createDepartment({ name, description });
            setCreating(false);
          }}
        />
      )}

      {editing && (
        <WorkspaceFormDialog
          title="Edit Workspace"
          initialName={editing.workspace.name}
          initialDescription={editing.workspace.description}
          onClose={() => setEditing(null)}
          onSave={(name, description) => {
            workspaces.updateDepartment(editing.workspace.id, { name, description });
            setEditing(null);
          }}
        />
      )}

      {confirmArchive && (
        <SimpleDialog title={`Archive ${confirmArchive.workspace.name}?`} description="People currently in this workspace keep their history, but it's hidden from this list." onClose={() => setConfirmArchive(null)}>
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

      {applyingTemplate && (
        <SimpleDialog title="Use a Template" description="Creates several workspaces at once, ready to go." onClose={() => setApplyingTemplate(false)}>
          <div className="space-y-2">
            {WORKSPACE_TEMPLATES.map(template => (
              <button
                key={template.id}
                type="button"
                onClick={() => applyTemplate(template.id)}
                className="flex w-full items-start gap-3 rounded-xl border border-border p-3 text-left hover:bg-accent"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{template.name}</p>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </div>
              </button>
            ))}
          </div>
        </SimpleDialog>
      )}
    </div>
  );
}

function WorkspaceFormDialog({
  title,
  initialName = "",
  initialDescription = "",
  onClose,
  onSave,
}: {
  title: string;
  initialName?: string;
  initialDescription?: string;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  return (
    <SimpleDialog title={title} onClose={onClose}>
      <div className="space-y-3">
        <Input label="Workspace Name" placeholder="Marketing" value={name} onChange={e => setName(e.target.value)} />
        <Input label="Description" placeholder="Brand, campaigns, and growth." value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={!name.trim()} onClick={() => onSave(name.trim(), description.trim())}>
          Save
        </Button>
      </div>
    </SimpleDialog>
  );
}
