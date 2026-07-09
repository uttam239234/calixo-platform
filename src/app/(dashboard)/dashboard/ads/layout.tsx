import { CampaignProvider } from "@/features/ads/CampaignProvider";
import { AdsCommandPalette } from "@/components/ads/AdsCommandPalette";

export default function AdsLayout({ children }: { children: React.ReactNode }) {
  return (
    <CampaignProvider>
      {children}
      <AdsCommandPalette />
    </CampaignProvider>
  );
}
