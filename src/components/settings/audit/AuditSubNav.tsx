"use client";

import { Activity, Search, SlidersHorizontal, GitCompare, History } from "lucide-react";
import { ModuleTabs, type ModuleTab } from "@/components/enterprise/module";

const TABS: ModuleTab[] = [
  { id: "feed", label: "Activity Feed", href: "/dashboard/settings/audit", icon: Activity },
  { id: "search", label: "Search", href: "/dashboard/settings/audit/search", icon: Search },
  { id: "filters", label: "Filters", href: "/dashboard/settings/audit/filters", icon: SlidersHorizontal },
  { id: "history", label: "Change History", href: "/dashboard/settings/audit/history", icon: GitCompare },
  { id: "restore", label: "Restore Points", href: "/dashboard/settings/audit/restore", icon: History },
];

/** Exactly 5 sections, per the brief — Activity Feed is the default landing page. */
export function AuditSubNav() {
  return (
    <div className="mb-6">
      <ModuleTabs tabs={TABS} baseUrl="/dashboard/settings/audit" />
    </div>
  );
}
