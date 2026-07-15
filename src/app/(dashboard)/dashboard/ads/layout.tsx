import { CampaignProvider } from "@/features/ads/CampaignProvider";
import { AdsCommandPalette } from "@/components/ads/AdsCommandPalette";
import { requireModuleAccess } from "../requireModuleAccess";
import { EntitlementDeniedState } from "@/components/enterprise/module/EntitlementDeniedState";

export default async function AdsLayout({ children }: { children: React.ReactNode }) {
  const { allowed, result } = await requireModuleAccess("ads");
  if (!allowed) return <EntitlementDeniedState moduleLabel="Ads Manager" result={result} />;

  return (
    <CampaignProvider>
      {children}
      <AdsCommandPalette />
    </CampaignProvider>
  );
}
