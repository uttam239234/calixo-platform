"use client";

import dynamic from "next/dynamic";
import { DashboardTenantProviders } from "./TenantProviders";

const AppShell = dynamic(() => import("@/components/layout/AppShell"), { ssr: false });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardTenantProviders>
      <AppShell>{children}</AppShell>
    </DashboardTenantProviders>
  );
}
