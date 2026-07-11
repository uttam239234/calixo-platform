"use client";

import { Users, UsersRound, Mail, ShieldCheck, History } from "lucide-react";
import { ModuleTabs, type ModuleTab } from "@/components/enterprise/module";

const TABS: ModuleTab[] = [
  { id: "people", label: "People", href: "/dashboard/settings/users", icon: Users },
  { id: "teams", label: "Teams", href: "/dashboard/settings/users/teams", icon: UsersRound },
  { id: "invitations", label: "Invitations", href: "/dashboard/settings/users/invitations", icon: Mail },
  { id: "access", label: "Access Summary", href: "/dashboard/settings/users/access", icon: ShieldCheck },
  { id: "activity", label: "Activity", href: "/dashboard/settings/users/activity", icon: History },
];

/** Exactly 5 sections, per the brief — People is the default landing page. */
export function UsersSubNav() {
  return (
    <div className="mb-6">
      <ModuleTabs tabs={TABS} baseUrl="/dashboard/settings/users" />
    </div>
  );
}
