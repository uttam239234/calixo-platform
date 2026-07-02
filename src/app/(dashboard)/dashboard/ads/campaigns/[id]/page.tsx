import { CampaignDetails } from "@/components/ads/campaigns/CampaignDetails";
export default async function CampaignDetailsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ edit?: string }> }) { const [{ id }, query] = await Promise.all([params, searchParams]); return <CampaignDetails id={id} initialEdit={query.edit === "true"} />; }
