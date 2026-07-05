"use client";

import { Mail, UserCheck, UserPlus, Users2 } from "lucide-react";

interface QuickActionsProps {
  pendingInvitationsCount: number;
  onlineUsersCount: number;
  onInviteUser: () => void;
  onCreateTeam: () => void;
  onViewPendingInvitations: () => void;
  onViewOnlineUsers: () => void;
}

export function QuickActions({ pendingInvitationsCount, onlineUsersCount, onInviteUser, onCreateTeam, onViewPendingInvitations, onViewOnlineUsers }: QuickActionsProps) {
  const tiles = [
    { key: "invite", label: "Invite User", icon: UserPlus, onClick: onInviteUser },
    { key: "team", label: "Create Team", icon: Users2, onClick: onCreateTeam },
    { key: "pending", label: "Pending Invitations", icon: Mail, onClick: onViewPendingInvitations, count: pendingInvitationsCount },
    { key: "online", label: "Online Users", icon: UserCheck, onClick: onViewOnlineUsers, count: onlineUsersCount },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 border-b border-border/60 px-5 py-3 sm:grid-cols-4">
      {tiles.map(tile => (
        <button
          key={tile.key}
          type="button"
          onClick={tile.onClick}
          className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-accent"
        >
          <tile.icon size={14} className="flex-shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">{tile.label}</span>
          {tile.count !== undefined && <span className="badge badge-outline flex-shrink-0">{tile.count}</span>}
        </button>
      ))}
    </div>
  );
}
