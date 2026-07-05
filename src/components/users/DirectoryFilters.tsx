"use client";

import { USER_STATUSES } from "@/core/users";
import type { Team, UserStatus } from "@/core/users";

interface WorkspaceOption {
  id: string;
  name: string;
}

interface DirectoryFiltersProps {
  status: UserStatus | "";
  onStatusChange: (status: UserStatus | "") => void;
  department: string;
  onDepartmentChange: (department: string) => void;
  departments: string[];
  teamId: string;
  onTeamChange: (teamId: string) => void;
  teams: Team[];
  workspaceId: string;
  onWorkspaceChange: (workspaceId: string) => void;
  workspaces: WorkspaceOption[];
  onClear: () => void;
}

export function DirectoryFilters({
  status,
  onStatusChange,
  department,
  onDepartmentChange,
  departments,
  teamId,
  onTeamChange,
  teams,
  workspaceId,
  onWorkspaceChange,
  workspaces,
  onClear,
}: DirectoryFiltersProps) {
  const hasFilters = !!status || !!department || !!teamId || !!workspaceId;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select value={status} onChange={e => onStatusChange(e.target.value as UserStatus | "")} className="input h-8 w-auto text-xs">
        <option value="">All statuses</option>
        {USER_STATUSES.map(s => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select value={department} onChange={e => onDepartmentChange(e.target.value)} className="input h-8 w-auto text-xs">
        <option value="">All departments</option>
        {departments.map(d => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select value={teamId} onChange={e => onTeamChange(e.target.value)} className="input h-8 w-auto text-xs">
        <option value="">All teams</option>
        {teams.map(t => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <select value={workspaceId} onChange={e => onWorkspaceChange(e.target.value)} className="input h-8 w-auto text-xs">
        <option value="">All workspaces</option>
        {workspaces.map(w => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button type="button" onClick={onClear} className="text-[11px] text-muted-foreground hover:text-foreground hover:underline">
          Clear filters
        </button>
      )}
    </div>
  );
}
