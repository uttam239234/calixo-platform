"use client";

import { useCallback, useMemo, useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import { useTeams } from "@/hooks/useTeams";
import { usePresence } from "@/hooks/usePresence";
import { useInvitations } from "@/hooks/useInvitations";
import { useDirectory } from "@/hooks/useDirectory";
import { useActivity } from "@/hooks/useActivity";
import {
  UsersHeader,
  UsersSidebar,
  DirectoryTable,
  DirectoryCards,
  UserProfilePanel,
  TeamBrowser,
  InvitationPanel,
  PresencePanel,
  ActivityPanel,
  MetadataPanel,
  UserToolbar,
  UserStats,
  QuickActions,
  UsersEmptyState,
} from "@/components/users";
import type { DirectoryViewMode, UsersRightPanelTab } from "@/components/users";
import { CURRENT_ACTOR } from "@/components/users";
import {
  userRegistry,
  initializeUsersFoundation,
  seedUsersPlatformMockData,
  registerUsersSkills,
  WORKSPACES,
  DEPARTMENTS,
} from "@/core/users";
import type { User, UserStatus } from "@/core/users";

// Bootstraps the Users & Teams platform with realistic demo data once per
// browser session (idempotent — guarded by the registry's own count).
if (userRegistry.count() === 0) {
  initializeUsersFoundation();
  seedUsersPlatformMockData();
}
registerUsersSkills();

const RIGHT_TABS: { id: UsersRightPanelTab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "presence", label: "Presence" },
  { id: "activity", label: "Activity" },
  { id: "metadata", label: "Metadata" },
  { id: "team", label: "Team" },
  { id: "workspace", label: "Workspace" },
  { id: "invitations", label: "Invitations" },
];

export default function UsersCenterPage() {
  const users = useUsers();
  const teams = useTeams();
  const presence = usePresence();
  const invitations = useInvitations();
  const directory = useDirectory();
  const activity = useActivity();

  const [rightTab, setRightTab] = useState<UsersRightPanelTab>("profile");
  const [viewMode, setViewMode] = useState<DirectoryViewMode>("table");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [workspaceFilter, setWorkspaceFilter] = useState("");
  const [onlineOnly, setOnlineOnly] = useState(false);

  const onlineUserIds = useMemo(() => new Set(presence.onlineUserIds()), [presence]);

  const filteredUsers = useMemo(() => {
    return users.users
      .filter(u => !statusFilter || u.status === statusFilter)
      .filter(u => !departmentFilter || u.department === departmentFilter)
      .filter(u => !teamFilter || u.teamIds.includes(teamFilter))
      .filter(u => !workspaceFilter || u.workspaceId === workspaceFilter)
      .filter(u => !onlineOnly || onlineUserIds.has(u.id));
  }, [users.users, statusFilter, departmentFilter, teamFilter, workspaceFilter, onlineOnly, onlineUserIds]);

  const workspaceNameFor = useCallback((workspaceId: string) => WORKSPACES.find(w => w.id === workspaceId)?.name ?? workspaceId, []);
  const teamNameFor = useCallback((user: User) => (user.teamIds.length > 0 ? (teams.lookup(user.teamIds[0])?.name ?? "—") : "—"), [teams]);
  const lastActiveFor = useCallback((userId: string) => presence.recordFor(userId)?.lastActiveAt, [presence]);

  const teamsForWorkspace = useMemo(() => teams.teams.filter(t => !workspaceFilter || t.workspaceId === workspaceFilter), [teams.teams, workspaceFilter]);

  const byStatus = useMemo(() => {
    const counts: Partial<Record<UserStatus, number>> = {};
    for (const u of filteredUsers) counts[u.status] = (counts[u.status] ?? 0) + 1;
    return counts;
  }, [filteredUsers]);

  const byDepartment = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const u of filteredUsers) counts[u.department] = (counts[u.department] ?? 0) + 1;
    return Object.entries(counts)
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredUsers]);

  const recentlyActiveUsers = useMemo(
    () => activity.recentlyActiveUserIds.map(id => users.lookup(id)).filter((u): u is NonNullable<typeof u> => !!u),
    [activity.recentlyActiveUserIds, users]
  );

  const onlineUsersList = useMemo(() => users.users.filter(u => onlineUserIds.has(u.id)), [users.users, onlineUserIds]);
  const pendingInvitations = useMemo(() => invitations.byStatus("pending"), [invitations]);

  const handleSelectUser = useCallback(
    (userId: string) => {
      users.setSelectedUserId(userId);
      const target = users.lookup(userId);
      if (target && target.teamIds.length > 0) teams.setSelectedTeamId(target.teamIds[0]);
      setRightTab("profile");
    },
    [users, teams]
  );

  const handleSelectTeam = useCallback(
    (teamId: string) => {
      teams.setSelectedTeamId(teamId);
      setRightTab("team");
    },
    [teams]
  );

  const handleSelectDepartment = useCallback((department: string) => setDepartmentFilter(department), []);
  const handleSelectWorkspace = useCallback((workspaceId: string) => setWorkspaceFilter(workspaceId), []);
  const handleClearFilters = useCallback(() => {
    setStatusFilter("");
    setDepartmentFilter("");
    setTeamFilter("");
    setWorkspaceFilter("");
    setOnlineOnly(false);
  }, []);

  const handleInviteUser = useCallback(() => setRightTab("invitations"), []);
  const handleCreateTeam = useCallback(() => setRightTab("team"), []);
  const handleViewPendingInvitations = useCallback(() => setRightTab("invitations"), []);
  const handleViewOnlineUsers = useCallback(() => setOnlineOnly(true), []);

  const selectedUser = users.selectedUser;
  const selectedTeam = teams.selectedTeam;

  const managerName = selectedUser?.managerId ? users.lookup(selectedUser.managerId)?.displayName : undefined;
  const teamNames = selectedUser ? selectedUser.teamIds.map(id => teams.lookup(id)?.name).filter((n): n is string => !!n) : [];
  const workspaceUsers = selectedUser ? users.users.filter(u => u.workspaceId === selectedUser.workspaceId) : [];
  const workspaceTeams = selectedUser ? teams.teams.filter(t => t.workspaceId === selectedUser.workspaceId) : [];

  const teamMembers = selectedTeam ? selectedTeam.memberIds.map(id => users.lookup(id)).filter((u): u is NonNullable<typeof u> => !!u) : [];
  const teamManagerName = selectedTeam?.managerId ? users.lookup(selectedTeam.managerId)?.displayName : undefined;

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      <UsersSidebar
        teams={teams.teams}
        currentTeamId={teams.selectedTeamId}
        onSelectTeam={handleSelectTeam}
        departments={DEPARTMENTS}
        onSelectDepartment={handleSelectDepartment}
        workspaces={WORKSPACES}
        currentWorkspaceId={workspaceFilter || null}
        onSelectWorkspace={handleSelectWorkspace}
        favoriteUsers={users.favoriteUsers}
        recentlyActiveUsers={recentlyActiveUsers}
        pendingInvitations={pendingInvitations}
        onlineUsers={onlineUsersList}
        onSelectUser={handleSelectUser}
        onSelectInvitations={handleViewPendingInvitations}
        searchQuery={directory.query.keyword ?? ""}
        searchResults={directory.result}
        onSearch={directory.searchKeyword}
        onClearSearch={directory.clear}
      />

      <div className="flex min-w-0 flex-1 flex-col rounded-3xl border border-border bg-card">
        <UsersHeader
          workspaceName={workspaceFilter ? workspaceNameFor(workspaceFilter) : "All Workspaces"}
          totalUsers={filteredUsers.length}
          onlineUsers={onlineUsersList.length}
          teamsCount={teamsForWorkspace.length}
          departmentsCount={DEPARTMENTS.length}
          invitationsCount={pendingInvitations.length}
          onInviteUser={handleInviteUser}
          onCreateTeam={handleCreateTeam}
        />

        <QuickActions
          pendingInvitationsCount={pendingInvitations.length}
          onlineUsersCount={onlineUsersList.length}
          onInviteUser={handleInviteUser}
          onCreateTeam={handleCreateTeam}
          onViewPendingInvitations={handleViewPendingInvitations}
          onViewOnlineUsers={handleViewOnlineUsers}
        />

        <UserToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          resultCount={filteredUsers.length}
          status={statusFilter}
          onStatusChange={setStatusFilter}
          department={departmentFilter}
          onDepartmentChange={setDepartmentFilter}
          departments={DEPARTMENTS}
          teamId={teamFilter}
          onTeamChange={setTeamFilter}
          teams={teamsForWorkspace}
          workspaceId={workspaceFilter}
          onWorkspaceChange={setWorkspaceFilter}
          workspaces={WORKSPACES}
          onClearFilters={handleClearFilters}
        />

        <div className="scrollbar-thin flex-1 overflow-y-auto p-5">
          {filteredUsers.length === 0 ? (
            <UsersEmptyState title="No users match these filters" description="Try clearing filters or searching the directory." action={{ label: "Clear filters", onClick: handleClearFilters }} />
          ) : viewMode === "table" ? (
            <DirectoryTable
              users={filteredUsers}
              selectedUserId={users.selectedUserId}
              onSelectUser={handleSelectUser}
              workspaceNameFor={workspaceNameFor}
              teamNameFor={teamNameFor}
              lastActiveFor={lastActiveFor}
              favorites={users.favorites}
              onToggleFavorite={users.toggleFavorite}
            />
          ) : (
            <DirectoryCards
              users={filteredUsers}
              selectedUserId={users.selectedUserId}
              onSelectUser={handleSelectUser}
              workspaceNameFor={workspaceNameFor}
              teamNameFor={teamNameFor}
              lastActiveFor={lastActiveFor}
              favorites={users.favorites}
              onToggleFavorite={users.toggleFavorite}
            />
          )}
        </div>

        <UserStats
          totalUsers={filteredUsers.length}
          onlineCount={onlineUsersList.length}
          teamsCount={teamsForWorkspace.length}
          departmentsCount={byDepartment.length}
          byStatus={byStatus}
          byDepartment={byDepartment}
        />
      </div>

      <div className="w-[340px] flex-shrink-0 rounded-3xl border border-border bg-card">
        <div className="scrollbar-thin flex flex-wrap border-b border-border/60 px-2 pt-2">
          {RIGHT_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRightTab(tab.id)}
              className={
                rightTab === tab.id
                  ? "rounded-t-xl border-b-2 border-primary px-2.5 py-2 text-[11px] font-semibold text-primary"
                  : "rounded-t-xl px-2.5 py-2 text-[11px] font-medium text-muted-foreground hover:text-foreground"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="scrollbar-thin h-[calc(100%-42px)] overflow-y-auto p-4">
          {rightTab === "profile" &&
            (selectedUser ? (
              <UserProfilePanel
                user={selectedUser}
                managerName={managerName}
                teamNames={teamNames}
                workspaceName={workspaceNameFor(selectedUser.workspaceId)}
                onUpdateProfile={patch => users.updateProfile(selectedUser.id, patch)}
                onResetProfile={() => users.resetProfile(selectedUser.id)}
                validate={users.validateProfile}
              />
            ) : (
              <UsersEmptyState />
            ))}

          {rightTab === "presence" && (
            <PresencePanel
              status={selectedUser ? presence.statusFor(selectedUser.id) : null}
              record={selectedUser ? presence.recordFor(selectedUser.id) : undefined}
              sessionCount={selectedUser ? presence.sessionCountFor(selectedUser.id) : 0}
            />
          )}

          {rightTab === "activity" && <ActivityPanel events={selectedUser ? activity.historyFor(selectedUser.id, 30) : []} />}

          {rightTab === "metadata" && <MetadataPanel user={selectedUser} section="metadata" />}

          {rightTab === "workspace" && (
            <MetadataPanel user={selectedUser} section="workspace" workspaceName={selectedUser ? workspaceNameFor(selectedUser.workspaceId) : undefined} workspaceUsers={workspaceUsers} workspaceTeams={workspaceTeams} />
          )}

          {rightTab === "team" && (
            <TeamBrowser
              team={selectedTeam}
              hierarchy={teams.hierarchy(selectedTeam?.workspaceId)}
              parentTeams={selectedTeam ? teams.parentTeams(selectedTeam.id) : []}
              childTeams={selectedTeam ? teams.childTeams(selectedTeam.id) : []}
              members={teamMembers}
              managerName={teamManagerName}
              workspaces={WORKSPACES}
              onCreateTeam={teams.createTeam}
              onSelectTeam={handleSelectTeam}
            />
          )}

          {rightTab === "invitations" && (
            <InvitationPanel
              invitations={invitations.invitations}
              workspaces={WORKSPACES}
              teams={teams.teams}
              currentActor={CURRENT_ACTOR}
              onCreate={invitations.create}
              onResend={invitations.resend}
              onCancel={invitations.cancel}
            />
          )}
        </div>
      </div>
    </div>
  );
}
