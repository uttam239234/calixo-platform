import type { ReactNode } from "react";
import { requireModuleAccess } from "../requireModuleAccess";
import { EntitlementDeniedState } from "@/components/enterprise/module/EntitlementDeniedState";

export default async function AnalyticsLayout({ children }: { children: ReactNode }) {
  const { allowed, result } = await requireModuleAccess("analytics");
  if (!allowed) return <EntitlementDeniedState moduleLabel="Analytics" result={result} />;

  return <>{children}</>;
}
