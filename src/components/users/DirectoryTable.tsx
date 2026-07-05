"use client";

import { Star } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { User } from "@/core/users";
import { PRESENCE_DOT_CLASS, PRESENCE_LABEL, STATUS_BADGE_TONE } from "./constants";

interface DirectoryTableProps {
  users: User[];
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  workspaceNameFor: (workspaceId: string) => string;
  teamNameFor: (user: User) => string;
  lastActiveFor: (userId: string) => string | undefined;
  favorites: Set<string>;
  onToggleFavorite: (userId: string) => void;
}

function Avatar({ user }: { user: User }) {
  const initials = user.displayName
    .split(" ")
    .map(part => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">{initials}</span>;
}

export function DirectoryTable({ users, selectedUserId, onSelectUser, workspaceNameFor, teamNameFor, lastActiveFor, favorites, onToggleFavorite }: DirectoryTableProps) {
  return (
    <Table containerClassName="scrollbar-thin">
      <TableHeader>
        <tr>
          <TableCell header className="w-8">
            {" "}
          </TableCell>
          <TableCell header>Name</TableCell>
          <TableCell header>Email</TableCell>
          <TableCell header>Department</TableCell>
          <TableCell header>Job Title</TableCell>
          <TableCell header>Status</TableCell>
          <TableCell header>Presence</TableCell>
          <TableCell header>Workspace</TableCell>
          <TableCell header>Team</TableCell>
          <TableCell header>Last Active</TableCell>
        </tr>
      </TableHeader>
      <TableBody>
        {users.map(user => {
          const lastActive = lastActiveFor(user.id);
          const isFavorite = favorites.has(user.id);
          return (
            <TableRow key={user.id} selected={selectedUserId === user.id} onClick={() => onSelectUser(user.id)}>
              <TableCell>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    onToggleFavorite(user.id);
                  }}
                  className={cn("text-muted-foreground hover:text-warning", isFavorite && "text-warning")}
                  aria-label="Toggle favorite"
                >
                  <Star size={13} fill={isFavorite ? "currentColor" : "none"} />
                </button>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar user={user} />
                  <span className="truncate text-xs font-medium text-foreground">{user.displayName}</span>
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{user.email}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{user.department}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{user.title}</TableCell>
              <TableCell>
                <span className={cn("badge", `badge-${STATUS_BADGE_TONE[user.status]}`)}>{user.status}</span>
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={cn("h-1.5 w-1.5 rounded-full", PRESENCE_DOT_CLASS[user.presence])} />
                  {PRESENCE_LABEL[user.presence]}
                </span>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{workspaceNameFor(user.workspaceId)}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{teamNameFor(user)}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{lastActive ? new Date(lastActive).toLocaleString() : "—"}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
