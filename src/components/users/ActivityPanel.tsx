"use client";

import { KeyRound, LogIn, LogOut, Repeat, UserCog, Users, UserMinus } from "lucide-react";
import type { ActivityEvent, ActivityType } from "@/core/users";

interface ActivityPanelProps {
  events: ActivityEvent[];
}

const ACTIVITY_ICON: Record<ActivityType, typeof LogIn> = {
  login: LogIn,
  logout: LogOut,
  "profile-update": UserCog,
  "team-join": Users,
  "team-leave": UserMinus,
  "password-change": KeyRound,
  "workspace-switch": Repeat,
};

export function ActivityPanel({ events }: ActivityPanelProps) {
  if (events.length === 0) {
    return <p className="p-1 text-xs text-muted-foreground">No recent activity for this user.</p>;
  }

  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Recent Activity</p>
      <div className="space-y-3 border-l border-border/60 pl-3">
        {events.map(event => {
          const Icon = ACTIVITY_ICON[event.type];
          return (
            <div key={event.id} className="relative">
              <span className="absolute -left-[18px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon size={9} />
              </span>
              <p className="text-xs font-medium text-foreground">{event.description}</p>
              <p className="text-[10px] text-muted-foreground">
                {event.type} · {new Date(event.createdAt).toLocaleString()}
              </p>
              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{JSON.stringify(event.metadata)}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
