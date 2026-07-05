"use client";

import type { Team, User } from "@/core/users";

interface MetadataPanelProps {
  user: User | null;
  section: "metadata" | "workspace";
  workspaceName?: string;
  workspaceUsers?: User[];
  workspaceTeams?: Team[];
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="break-words text-xs text-foreground">{value || "—"}</p>
    </div>
  );
}

export function MetadataPanel({ user, section, workspaceName, workspaceUsers = [], workspaceTeams = [] }: MetadataPanelProps) {
  if (!user) {
    return <p className="p-1 text-xs text-muted-foreground">Select a user to see this information.</p>;
  }

  if (section === "workspace") {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Workspace</p>
          <p className="text-sm font-semibold text-foreground">{workspaceName ?? user.workspaceId}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Members</p>
            <p className="text-foreground">{workspaceUsers.length}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Teams</p>
            <p className="text-foreground">{workspaceTeams.length}</p>
          </div>
        </div>
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Teams in Workspace</p>
          <div className="flex flex-wrap gap-1">
            {workspaceTeams.map(team => (
              <span key={team.id} className="badge badge-outline">
                {team.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="User ID" value={user.id} />
        <Field label="Status" value={user.status} />
        <Field label="Created" value={new Date(user.createdAt).toLocaleString()} />
        <Field label="Updated" value={new Date(user.updatedAt).toLocaleString()} />
      </div>

      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Roles</p>
        <div className="flex flex-wrap gap-1">
          {user.roleIds.length === 0 ? <span className="text-xs text-muted-foreground">None</span> : user.roleIds.map(role => <span key={role} className="badge badge-outline">{role}</span>)}
        </div>
      </div>

      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Permissions</p>
        <div className="flex flex-wrap gap-1">
          {user.permissions.length === 0 ? (
            <span className="text-xs text-muted-foreground">None</span>
          ) : (
            user.permissions.map(permission => <span key={permission} className="badge badge-outline">{permission}</span>)
          )}
        </div>
      </div>

      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Tags</p>
        <div className="flex flex-wrap gap-1">
          {user.tags.length === 0 ? <span className="text-xs text-muted-foreground">None</span> : user.tags.map(tag => <span key={tag} className="badge badge-secondary">{tag}</span>)}
        </div>
      </div>

      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Raw Metadata</p>
        <pre className="scrollbar-thin max-h-32 overflow-auto rounded-lg bg-accent/40 p-2 text-[10px] text-muted-foreground">{JSON.stringify(user.metadata ?? {}, null, 2)}</pre>
      </div>
    </div>
  );
}
