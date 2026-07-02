import { CampaignProvider } from "@/features/ads/CampaignProvider";
export default function AdsLayout({ children }: { children: React.ReactNode }) { return <CampaignProvider>{children}</CampaignProvider>; }
