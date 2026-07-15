import { BrandSubNav } from "@/components/brand/BrandSubNav";
import { BrandCommandPalette } from "@/components/brand/BrandCommandPalette";
import { BrandMonitoringProvider } from "@/features/brand/BrandMonitoringProvider";
import { requireModuleAccess } from "../requireModuleAccess";
import { EntitlementDeniedState } from "@/components/enterprise/module/EntitlementDeniedState";

export default async function BrandLayout({ children }: { children: React.ReactNode }) {
  const { allowed, result } = await requireModuleAccess("brand");
  if (!allowed) return <EntitlementDeniedState moduleLabel="Brand Monitoring" result={result} />;

  return (
    <BrandMonitoringProvider>
      <div>
        <BrandSubNav />
        {children}
      </div>
      <BrandCommandPalette />
    </BrandMonitoringProvider>
  );
}