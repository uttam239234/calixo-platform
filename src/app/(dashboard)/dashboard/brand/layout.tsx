import { BrandSubNav } from "@/components/brand/BrandSubNav";
import { BrandCommandPalette } from "@/components/brand/BrandCommandPalette";
import { BrandMonitoringProvider } from "@/features/brand/BrandMonitoringProvider";

export default function BrandLayout({ children }: { children: React.ReactNode }) {
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