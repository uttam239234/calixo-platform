import type { ReactNode } from "react";
import { SettingsProvider } from "@/features/settings/SettingsProvider";
import { SettingsAdminSidebar } from "@/components/settings/SettingsAdminSidebar";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <SettingsAdminSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </SettingsProvider>
  );
}
