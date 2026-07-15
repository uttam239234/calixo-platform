import type { ReactNode } from "react";
import { ReportsProvider } from "@/features/reports/ReportsProvider";
import { ReportsSubNav } from "@/components/reports/ReportsSubNav";
import { requireModuleAccess } from "../requireModuleAccess";
import { EntitlementDeniedState } from "@/components/enterprise/module/EntitlementDeniedState";

export default async function ReportsLayout({ children }: { children: ReactNode }) {
  const { allowed, result } = await requireModuleAccess("reports");
  if (!allowed) return <EntitlementDeniedState moduleLabel="Reports" result={result} />;

  return (
    <ReportsProvider>
      <ReportsSubNav />
      {children}
    </ReportsProvider>
  );
}
