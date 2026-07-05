"use client";

import { useState } from "react";
import { ChevronRight, Layers, Plus, Users2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Team, TeamHierarchyNode, User } from "@/core/users";
import type { CreateTeamInput } from "@/hooks/useTeams";
import { TEAM_COLOR_FALLBACK } from "./constants";

interface WorkspaceOption {
  id: string;
  name: string;
}

interface TeamBrowserProps {
  team: Team | null;
  hierarchy: TeamHierarchyNode[];
  parentTeams: Team[];
  childTeams: Team[];
  members: User[];
  managerName?: string;
  workspaces: WorkspaceOption[];
  onCreateTeam: (input: CreateTeamInput) => void;
  onSelectTeam: (teamId: string) => void;
}

function HierarchyNode({ node, currentTeamId, onSelectTeam, depth = 0 }: { node: TeamHierarchyNode; currentTeamId: string | null; onSelectTeam: (id: string) => void; depth?: number }) {
  return (
    <div>
      <button
        type="button"
        onClick={() => onSelectTeam(node.team.id)}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-lg py-1 pr-2 text-left text-xs transition-colors hover:bg-accent",
          node.team.id === currentTeamId ? "font-semibold text-primary" : "text-foreground"
        )}
      >
        {depth > 0 && <ChevronRight size={11} className="text-muted-foreground" />}
        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: node.team.color ?? TEAM_COLOR_FALLBACK }} />
        {node.team.name}
      </button>
      {node.children.map(child => (
        <HierarchyNode key={child.team.id} node={child} currentTeamId={currentTeamId} onSelectTeam={onSelectTeam} depth={depth + 1} />
      ))}
    </div>
  );
}

export function TeamBrowser({ team, hierarchy, parentTeams, childTeams, members, managerName, workspaces, onCreateTeam, onSelectTeam }: TeamBrowserProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id ?? "");
  const [color, setColor] = useState(TEAM_COLOR_FALLBACK);

  const submitCreate = () => {
    if (!name.trim() || !workspaceId) return;
    onCreateTeam({ name: name.trim(), description: description.trim() || undefined, workspaceId, color });
    setName("");
    setDescription("");
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Team Hierarchy</p>
        <button type="button" onClick={() => setShowCreateForm(v => !v)} className="flex items-center gap-1 text-[11px] text-primary hover:underline">
          <Plus size={11} /> New Team
        </button>
      </div>

      {showCreateForm && (
        <div className="card space-y-2 p-3">
          <input className="input h-8 text-xs" placeholder="Team name" value={name} onChange={e => setName(e.target.value)} />
          <input className="input h-8 text-xs" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
          <select className="input h-8 text-xs" value={workspaceId} onChange={e => setWorkspaceId(e.target.value)}>
            {workspaces.map(w => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-8 w-10 rounded-lg border border-border" />
            <button type="button" onClick={submitCreate} className="btn-primary flex-1 rounded-lg px-3 py-1.5 text-xs font-medium">
              Create Team
            </button>
          </div>
        </div>
      )}

      <div className="space-y-0.5">
        {hierarchy.length === 0 ? (
          <p className="text-xs text-muted-foreground">No teams in this workspace yet.</p>
        ) : (
          hierarchy.map(node => <HierarchyNode key={node.team.id} node={node} currentTeamId={team?.id ?? null} onSelectTeam={onSelectTeam} />)
        )}
      </div>

      {!team ? (
        <p className="p-1 text-xs text-muted-foreground">Select a team to see its details.</p>
      ) : (
        <div className="space-y-3 border-t border-border/60 pt-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${team.color ?? TEAM_COLOR_FALLBACK}22` }}>
              <Users2 size={14} style={{ color: team.color ?? TEAM_COLOR_FALLBACK }} />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{team.name}</p>
              <p className="text-xs text-muted-foreground">{team.description ?? "No description"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Manager</p>
              <p className="text-foreground">{managerName ?? "Unassigned"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Members</p>
              <p className="text-foreground">{members.length}</p>
            </div>
          </div>

          {parentTeams.length > 0 && (
            <div>
              <p className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                <Layers size={10} /> Parent Teams
              </p>
              <div className="flex flex-wrap gap-1">
                {parentTeams.map(p => (
                  <button key={p.id} type="button" onClick={() => onSelectTeam(p.id)} className="badge badge-outline hover:border-primary/40">
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {childTeams.length > 0 && (
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Child Teams</p>
              <div className="flex flex-wrap gap-1">
                {childTeams.map(c => (
                  <button key={c.id} type="button" onClick={() => onSelectTeam(c.id)} className="badge badge-outline hover:border-primary/40">
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Members</p>
            <div className="space-y-1">
              {members.slice(0, 10).map(member => (
                <p key={member.id} className="truncate text-xs text-foreground">
                  {member.displayName} <span className="text-muted-foreground">· {member.title}</span>
                </p>
              ))}
              {members.length === 0 && <p className="text-xs text-muted-foreground">No members yet</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
