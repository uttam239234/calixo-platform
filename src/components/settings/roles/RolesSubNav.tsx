"use client";

import { ShieldCheck, Grid3x3, LayoutTemplate, ScrollText } from "lucide-react";
import { ModuleTabs, type ModuleTab } from "@/components/enterprise/module";

const TABS: ModuleTab[] = [
  { id: "roles", label: "Roles", href: "/dashboard/settings/roles", icon: ShieldCheck },
  { id: "matrix", label: "Access Matrix", href: "/dashboard/settings/roles/matrix", icon: Grid3x3 },
  { id: "templates", label: "Templates", href: "/dashboard/settings/roles/templates", icon: LayoutTemplate },
  { id: "policies", label: "Policies", href: "/dashboard/settings/roles/policies", icon: ScrollText },
];

/** Exactly 4 sections, per the brief — Roles is the default landing page. */
export function RolesSubNav() {
  return (
    <div className="mb-6">
      <ModuleTabs tabs={TABS} baseUrl="/dashboard/settings/roles" />
    </div>
  );
}
