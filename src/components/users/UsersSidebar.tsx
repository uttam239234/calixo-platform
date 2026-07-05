"use client";

import { useState, type ReactNode } from "react";
import { Building2, ChevronDown, Clock3, Layers, Mail, Search, Star, UserCheck, Users2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DirectorySearchResult, Invitation, Team, User } from "@/core/users";
import { PRESENCE_DOT_CLASS } from "./constants";

interface WorkspaceOption {
  id: string;
  name: string;
}

interface UsersSidebarProps {
  teams: Team[];
  currentTeamId: string | null;
  onSelectTeam: (teamId: string) => void;
  departments: string[];
  onSelectDepartment: (department: string) => void;
  workspaces: WorkspaceOption[];
  currentWorkspaceId: string | null;
  onSelectWorkspace: (workspaceId: string) => void;
  favoriteUsers: User[];
  recentlyActiveUsers: User[];
  pendingInvitations: Invitation[];
  onlineUsers: User[];
  onSelectUser: (userId: string) => void;
  onSelectInvitations: () => void;
  searchQuery: string;
  searchResults: DirectorySearchResult;
  onSearch: (query: string) => void;
  onClearSearch: () => void;
}

function Section({ title, icon, defaultOpen = false, children }: { title: string; icon: ReactNode; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/50 pb-2 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:bg-accent"
      >
        <span className="flex items-center gap-1.5">
          {icon}
          {title}
        </span>
        <ChevronDown size={12} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="mt-1 space-y-1 px-0.5">{children}</div>}
    </div>
  );
}

function UserLink({ user, onSelect, meta }: { user: User; onSelect: (userId: string) => void; meta?: string }) {
  return (
    <button type="button" onClick={() => onSelect(user.id)} className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-accent">
      <span className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", PRESENCE_DOT_CLASS[user.presence])} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium text-foreground">{user.displayName}</span>
        <span className="block truncate text-[10px] text-muted-foreground">{meta ?? `${user.title} · ${user.department}`}</span>
      </span>
    </button>
  );
}

export function UsersSidebar({
  teams,
  currentTeamId,
  onSelectTeam,
  departments,
  onSelectDepartment,
  workspaces,
  currentWorkspaceId,
  onSelectWorkspace,
  favoriteUsers,
  recentlyActiveUsers,
  pendingInvitations,
  onlineUsers,
  onSelectUser,
  onSelectInvitations,
  searchQuery,
  searchResults,
  onSearch,
  onClearSearch,
}: UsersSidebarProps) {
  return (
    <aside className="flex h-full w-[300px] flex-shrink-0 flex-col rounded-3xl border border-border bg-card">
      <div className="scrollbar-thin flex-1 space-y-1 overflow-y-auto p-3">
        <div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => onSearch(e.target.value)}
              placeholder="Search directory..."
              className="h-8.5 w-full rounded-xl border border-border bg-accent/30 pl-8 pr-7 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40"
            />
            {searchQuery && (
              <button type="button" onClick={onClearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Clear search">
                <X size={13} />
              </button>
            )}
          </div>

          {searchQuery && (
            <div className="mt-2 space-y-1">
              <p className="px-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                {searchResults.total} result{searchResults.total === 1 ? "" : "s"}
              </p>
              {searchResults.items.length === 0 ? (
                <p className="px-1 py-2 text-xs text-muted-foreground">No matches</p>
              ) : (
                searchResults.items.slice(0, 30).map(item => (
                  <UserLink key={item.user.id} user={item.user} onSelect={onSelectUser} meta={`${item.user.department} · score ${item.score}`} />
                ))
              )}
            </div>
          )}
        </div>

        {!searchQuery && (
          <>
            <Section title={`Teams (${teams.length})`} icon={<Layers size={11} />} defaultOpen>
              {teams.map(team => (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => onSelectTeam(team.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-accent",
                    currentTeamId === team.id && "bg-accent"
                  )}
                >
                  <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: team.color ?? "#4F46E5" }} />
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">{team.name}</span>
                  <span className="flex-shrink-0 text-[10px] text-muted-foreground">{team.memberIds.length}</span>
                </button>
              ))}
            </Section>

            <Section title={`Departments (${departments.length})`} icon={<Building2 size={11} />}>
              <div className="flex flex-wrap gap-1 px-1">
                {departments.map(department => (
                  <button
                    key={department}
                    type="button"
                    onClick={() => onSelectDepartment(department)}
                    className="rounded-lg border border-border px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {department}
                  </button>
                ))}
              </div>
            </Section>

            <Section title={`Workspaces (${workspaces.length})`} icon={<Users2 size={11} />}>
              {workspaces.map(workspace => (
                <button
                  key={workspace.id}
                  type="button"
                  onClick={() => onSelectWorkspace(workspace.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-accent",
                    currentWorkspaceId === workspace.id && "bg-accent"
                  )}
                >
                  {workspace.name}
                </button>
              ))}
            </Section>

            <Section title={`Favorites (${favoriteUsers.length})`} icon={<Star size={11} />}>
              {favoriteUsers.length === 0 ? (
                <p className="px-1 py-2 text-xs text-muted-foreground">No favorites yet</p>
              ) : (
                favoriteUsers.map(user => <UserLink key={user.id} user={user} onSelect={onSelectUser} />)
              )}
            </Section>

            <Section title="Recently Active" icon={<Clock3 size={11} />}>
              {recentlyActiveUsers.length === 0 ? (
                <p className="px-1 py-2 text-xs text-muted-foreground">No recent activity</p>
              ) : (
                recentlyActiveUsers.map(user => <UserLink key={user.id} user={user} onSelect={onSelectUser} />)
              )}
            </Section>

            <Section title={`Pending Invitations (${pendingInvitations.length})`} icon={<Mail size={11} />}>
              {pendingInvitations.length === 0 ? (
                <p className="px-1 py-2 text-xs text-muted-foreground">No pending invitations</p>
              ) : (
                <>
                  {pendingInvitations.slice(0, 8).map(invitation => (
                    <button
                      key={invitation.id}
                      type="button"
                      onClick={onSelectInvitations}
                      className="flex w-full flex-col items-start rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-accent"
                    >
                      <span className="truncate text-xs font-medium text-foreground">{invitation.email}</span>
                      <span className="text-[10px] text-muted-foreground">Expires {new Date(invitation.expiresAt).toLocaleDateString()}</span>
                    </button>
                  ))}
                  <button type="button" onClick={onSelectInvitations} className="w-full px-2.5 py-1 text-left text-[10px] text-primary hover:underline">
                    View all invitations
                  </button>
                </>
              )}
            </Section>

            <Section title={`Online Users (${onlineUsers.length})`} icon={<UserCheck size={11} />}>
              {onlineUsers.length === 0 ? (
                <p className="px-1 py-2 text-xs text-muted-foreground">No one is online</p>
              ) : (
                onlineUsers.slice(0, 12).map(user => <UserLink key={user.id} user={user} onSelect={onSelectUser} />)
              )}
            </Section>
          </>
        )}
      </div>
    </aside>
  );
}
