"use client";

import { AdsHeader } from "@/components/ads/AdsHeader";
import { BudgetOverview } from "@/components/ads/BudgetOverview";
import { CampaignSummary } from "@/components/ads/CampaignSummary";
import { CampaignTable } from "@/components/ads/CampaignTable";
import { PerformanceSnapshot } from "@/components/ads/PerformanceSnapshot";
import { PlatformOverview } from "@/components/ads/PlatformOverview";
import { PlatformStatus } from "@/components/ads/PlatformStatus";
import { QuickActions } from "@/components/ads/QuickActions";
import { RecommendationPanel } from "@/components/ads/RecommendationPanel";

export default function AdsManagerPage() {
  return (
    <div className="space-y-6 pb-8">
      <AdsHeader />
      <QuickActions />
      <PlatformOverview />
      <CampaignSummary />
      <CampaignTable />
      <div className="grid gap-6 xl:grid-cols-2">
        <BudgetOverview />
        <PerformanceSnapshot />
        <RecommendationPanel />
        <PlatformStatus />
      </div>
    </div>
  );
}
