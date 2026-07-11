"use client";

import { useMemo, useState } from "react";
import { LogIn, LogOut, UserCog, UsersRound, KeyRound, Building2, Mail, ShieldCheck, UserX, UserCheck, Shuffle } from "lucide-react";
import { ModuleHeader, ActivityTimeline, type ActivityItem } from "@/components/enterprise/module";
import { useSettingsContext } from "@/features/settings/SettingsProvider";
import { useUsers } from "@/hooks/useUsers";
import { useActivity } from "@/hooks/useActivity";
import type { ActivityType } from "@/core/users";
import { formatRelativeTime } from "@/shared/utils/date";

const TYPE_ICON: Record<ActivityType, React.ReactNode> = {
  login: <LogIn size={13} />,
  logout: <LogOut size={13} />,
  "profile-update": <UserCog size={13} />,
  "team-join": <UsersRound size={13} />,
  "team-leave": <UsersRound size={13} />,
  "password-change": <KeyRound size={13} />,
  "workspace-switch": <Shuffle size={13} />,
  "organization-joined": <Building2 size={13} />,
  "invite-accepted": <Mail size={13} />,
  "role-changed": <ShieldCheck size={13} />,
  suspended: <UserX size={13} />,
  reinstated: <UserCheck size={13} />,
};

export default function ActivityPage() {
  const { tenantContext } = useSettingsContext();
  const organizationId = tenantContext.organizationId;
  const users = useUsers(organizationId);
  const activity = useActivity(organizationId);

  const [personFilter, setPersonFilter] = useState("");

  const events = useMemo(() => (personFilter ? activity.historyFor(personFilter, 100) : activity.recentEvents), [personFilter, activity]);

  const items: ActivityItem[] = events.map(event => ({
    id: event.id,
    actor: users.lookup(event.userId)?.displayName ?? "Someone",
    action: event.description,
    timestamp: formatRelativeTime(event.createdAt),
    icon: TYPE_ICON[event.type],
  }));

  return (
    <div>
      <ModuleHeader title="Activity" description="A readable timeline of what happened and when." />

      <div className="mb-6 max-w-xs">
        <label className="label">Person</label>
        <select className="input" value={personFilter} onChange={e => setPersonFilter(e.target.value)}>
          <option value="">Everyone</option>
          {users.users.map(user => (
            <option key={user.id} value={user.id}>
              {user.displayName}
            </option>
          ))}
        </select>
      </div>

      <ActivityTimeline activities={items} title={personFilter ? `${users.lookup(personFilter)?.displayName ?? "Person"}'s Activity` : "Organization Activity"} maxItems={items.length || 1} />
    </div>
  );
}
