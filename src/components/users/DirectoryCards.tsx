"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/core/users";
import { PRESENCE_DOT_CLASS, PRESENCE_LABEL, STATUS_BADGE_TONE } from "./constants";

interface DirectoryCardsProps {
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
  return <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials}</span>;
}

export function DirectoryCards({ users, selectedUserId, onSelectUser, workspaceNameFor, teamNameFor, lastActiveFor, favorites, onToggleFavorite }: DirectoryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {users.map(user => {
        const lastActive = lastActiveFor(user.id);
        const isFavorite = favorites.has(user.id);
        return (
          <div
            key={user.id}
            onClick={() => onSelectUser(user.id)}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === "Enter") onSelectUser(user.id);
            }}
            className={cn("card cursor-pointer p-4 transition-colors", selectedUserId === user.id && "border-primary/50 ring-1 ring-primary/30")}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <Avatar user={user} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{user.displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onToggleFavorite(user.id);
                }}
                className={cn("flex-shrink-0 text-muted-foreground hover:text-warning", isFavorite && "text-warning")}
                aria-label="Toggle favorite"
              >
                <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <p className="truncate">{user.email}</p>
              <p>{user.department}</p>
              <p>
                {workspaceNameFor(user.workspaceId)} · {teamNameFor(user)}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className={cn("badge", `badge-${STATUS_BADGE_TONE[user.status]}`)}>{user.status}</span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className={cn("h-1.5 w-1.5 rounded-full", PRESENCE_DOT_CLASS[user.presence])} />
                {PRESENCE_LABEL[user.presence]}
              </span>
            </div>

            <p className="mt-2 text-[10px] text-muted-foreground">Last active {lastActive ? new Date(lastActive).toLocaleString() : "—"}</p>
          </div>
        );
      })}
    </div>
  );
}
