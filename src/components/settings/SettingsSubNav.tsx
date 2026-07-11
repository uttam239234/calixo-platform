"use client";

import { Building2, Palette, SlidersHorizontal, Bell, Shield, Lock } from "lucide-react";
import { ModuleTabs, type ModuleTab } from "@/components/enterprise/module";
import { useSettingsContext } from "@/features/settings/SettingsProvider";

const BASE_TABS: ModuleTab[] = [
  { id: "profile", label: "Organization Profile", href: "/dashboard/settings", icon: Building2 },
  { id: "branding", label: "Branding", href: "/dashboard/settings/branding", icon: Palette },
  { id: "preferences", label: "Preferences", href: "/dashboard/settings/preferences", icon: SlidersHorizontal },
  { id: "notifications", label: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
  { id: "security", label: "Security", href: "/dashboard/settings/security", icon: Shield },
];

const ADVANCED_TAB: ModuleTab = { id: "advanced", label: "Advanced Settings", href: "/dashboard/settings/advanced", icon: Lock };

/** Exactly 6 top-level sections, per the rebuild brief — Advanced Settings only appears for admins, never regular users. */
export function SettingsSubNav() {
  const { canAdmin } = useSettingsContext();
  const tabs = canAdmin ? [...BASE_TABS, ADVANCED_TAB] : BASE_TABS;

  return (
    <div className="mb-6">
      <ModuleTabs tabs={tabs} baseUrl="/dashboard/settings" />
    </div>
  );
}
