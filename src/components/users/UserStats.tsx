"use client";

import { cn } from "@/lib/utils";
import type { UserStatus } from "@/core/users";
import { STATUS_BADGE_TONE } from "./constants";

interface UserStatsProps {
  totalUsers: number;
  onlineCount: number;
  teamsCount: number;
  departmentsCount: number;
  byStatus: Partial<Record<UserStatus, number>>;
  byDepartment: Array<{ department: string; count: number }>;
}

export function UserStats({ totalUsers, onlineCount, teamsCount, departmentsCount, byStatus, byDepartment }: UserStatsProps) {
  return (
    <div className="border-t border-border/60 px-5 py-4">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Statistics</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card p-3">
          <p className="text-[10px] text-muted-foreground">Total Users</p>
          <p className="text-lg font-semibold text-foreground">{totalUsers}</p>
        </div>
        <div className="card p-3">
          <p className="text-[10px] text-muted-foreground">Online Now</p>
          <p className="text-lg font-semibold text-foreground">{onlineCount}</p>
        </div>
        <div className="card p-3">
          <p className="text-[10px] text-muted-foreground">Teams</p>
          <p className="text-lg font-semibold text-foreground">{teamsCount}</p>
        </div>
        <div className="card p-3">
          <p className="text-[10px] text-muted-foreground">Departments</p>
          <p className="text-lg font-semibold text-foreground">{departmentsCount}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="card p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">By Status</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(byStatus).map(([status, count]) => (
              <span key={status} className={cn("badge", `badge-${STATUS_BADGE_TONE[status as UserStatus]}`)}>
                {status} · {count}
              </span>
            ))}
          </div>
        </div>
        <div className="card p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Top Departments</p>
          <div className="space-y-1">
            {byDepartment.slice(0, 5).map(({ department, count }) => (
              <div key={department} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{department}</span>
                <span className="font-medium text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
