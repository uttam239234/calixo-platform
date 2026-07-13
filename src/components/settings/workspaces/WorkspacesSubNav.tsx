"use client";

import { LayoutGrid, Building2, Users, ShieldCheck, History } from "lucide-react";
import { ModuleTabs, type ModuleTab } from "@/components/enterprise/module";

const TABS: ModuleTab[] = [
  { id: "overview", label: "Workspace Overview", href: "/dashboard/settings/workspaces", icon: LayoutGrid },
  { id: "departments", label: "Departments", href: "/dashboard/settings/workspaces/departments", icon: Building2 },
  { id: "members", label: "Members", href: "/dashboard/settings/workspaces/members", icon: Users },
  { id: "access", label: "Access", href: "/dashboard/settings/workspaces/access", icon: ShieldCheck },
  { id: "activity", label: "Activity", href: "/dashboard/settings/workspaces/activity", icon: History },
];

/** Exactly 5 sections, per the brief — Workspace Overview is the default landing page. */
export function WorkspacesSubNav() {
  return (
    <div className="mb-6">
      <ModuleTabs tabs={TABS} baseUrl="/dashboard/settings/workspaces" />
    </div>
  );
}
