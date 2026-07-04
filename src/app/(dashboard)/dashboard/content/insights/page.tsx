"use client";

import { ContentHeader, ContentChartSection } from "@/components/content/ContentSharedComponents";
import { AIRecommendationPanel } from "@/components/content/ContentSharedComponents";
import { contentProductionData, platformDistributionData, aiSessions } from "@/lib/content-data";

export default function InsightsPage() {
  return (
    <div className="space-y-6 pb-8">
      <ContentHeader title="Content Insights" description="Performance analytics and AI-powered recommendations" />
      <div className="grid gap-6 xl:grid-cols-2">
        <ContentChartSection title="Content Production" description="Monthly output" span="two-thirds">
          <div className="h-48 flex items-end gap-2">
            {contentProductionData.map((point) => (
              <div key={point.month} className="flex-1 flex flex-col justify-end">
                <div className="w-full bg-cyan-500/60 rounded-t-sm" style={{ height: `${point.blog * 2 + point.social}px` }} />
                <span className="text-[9px] text-slate-500 text-center mt-1">{point.month}</span>
              </div>
            ))}
          </div>
        </ContentChartSection>
        <AIRecommendationPanel sessions={aiSessions} />
      </div>
    </div>
  );
}