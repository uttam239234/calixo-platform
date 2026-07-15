import DashboardShell from "@/components/dashboard/DashboardShell";
import { requireModuleAccess } from "./requireModuleAccess";
import { EntitlementDeniedState } from "@/components/enterprise/module/EntitlementDeniedState";

// `/dashboard` shares its route segment's `layout.tsx` with every other
// module (`/dashboard/ads`, `/dashboard/social`, ...) via the existing
// tenant-bootstrap layout, so the Dashboard module's own gate can't live in
// a layout there without also gating its siblings — it's checked inline
// here instead, the one module with no dedicated child segment of its own.
export default async function DashboardPage() {
  const { allowed, result } = await requireModuleAccess("dashboard");
  if (!allowed) return <EntitlementDeniedState moduleLabel="Dashboard" result={result} />;

  return <DashboardShell />;
}