"use client";

import { Download, UserPlus, Upload, Users2 } from "lucide-react";
import { Button } from "@/components/ui";

interface UsersHeaderProps {
  workspaceName: string;
  totalUsers: number;
  onlineUsers: number;
  teamsCount: number;
  departmentsCount: number;
  invitationsCount: number;
  onInviteUser: () => void;
  onCreateTeam: () => void;
}

export function UsersHeader({
  workspaceName,
  totalUsers,
  onlineUsers,
  teamsCount,
  departmentsCount,
  invitationsCount,
  onInviteUser,
  onCreateTeam,
}: UsersHeaderProps) {
  return (
    <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5">
      <div className="min-w-0">
        <h1 className="flex items-center gap-2 truncate text-[15px] font-semibold text-foreground">
          <Users2 size={16} className="text-primary" /> {workspaceName}
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="badge badge-outline">{totalUsers} users</span>
          <span className="badge badge-success">{onlineUsers} online</span>
          <span className="badge badge-outline">{teamsCount} teams</span>
          <span className="badge badge-outline">{departmentsCount} departments</span>
          {invitationsCount > 0 && <span className="badge badge-warning">{invitationsCount} pending invites</span>}
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-1.5">
        <Button size="sm" variant="outline" disabled title="Import (coming soon)" className="gap-1.5">
          <Upload size={13} /> Import
        </Button>
        <Button size="sm" variant="outline" disabled title="Export (coming soon)" className="gap-1.5">
          <Download size={13} /> Export
        </Button>
        <Button size="sm" variant="outline" onClick={onCreateTeam} className="gap-1.5">
          <Users2 size={13} /> Create Team
        </Button>
        <Button size="sm" onClick={onInviteUser} className="gap-1.5">
          <UserPlus size={13} /> Invite User
        </Button>
      </div>
    </div>
  );
}
