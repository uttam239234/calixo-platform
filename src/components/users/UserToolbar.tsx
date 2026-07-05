"use client";

import { LayoutGrid, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Team, UserStatus } from "@/core/users";
import { DirectoryFilters } from "./DirectoryFilters";
import type { DirectoryViewMode } from "./types";

interface WorkspaceOption {
  id: string;
  name: string;
}

interface UserToolbarProps {
  viewMode: DirectoryViewMode;
  onViewModeChange: (mode: DirectoryViewMode) => void;
  resultCount: number;
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
  onClearFilters: () => void;
}

export function UserToolbar({ viewMode, onViewModeChange, resultCount, onClearFilters, ...filters }: UserToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-3">
      <DirectoryFilters {...filters} onClear={onClearFilters} />

      <div className="flex flex-shrink-0 items-center gap-3">
        <span className="text-[11px] text-muted-foreground">
          {resultCount} user{resultCount === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            className={cn("rounded-md p-1.5 transition-colors", viewMode === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
            aria-label="Table view"
          >
            <Table2 size={14} />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("cards")}
            className={cn("rounded-md p-1.5 transition-colors", viewMode === "cards" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
            aria-label="Cards view"
          >
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
