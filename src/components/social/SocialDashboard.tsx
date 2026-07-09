"use client";
import { SocialHeader } from "./SocialHeader";
import { SocialKpiGrid } from "./SocialKpiGrid";
import { QuickActions } from "./QuickActions";
import { PlatformOverview } from "./PlatformOverview";
import { RecentPosts } from "./RecentPosts";
import { AiRecommendations } from "./AiRecommendations";
import { ConnectedAccounts } from "./ConnectedAccounts";
import { CompetitorIntelligenceCard } from "./CompetitorIntelligenceCard";
import { SocialAutomationPanel } from "./SocialAutomationPanel";
import { SocialHealthScoreCard } from "./SocialHealthScoreCard";
import { SocialActionCenter } from "./SocialActionCenter";
export function SocialDashboard(){return <div className="space-y-6 pb-8"><SocialHeader/><QuickActions/><SocialKpiGrid/><div className="grid gap-6 xl:grid-cols-2"><SocialHealthScoreCard/><SocialActionCenter/></div><PlatformOverview/><div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]"><RecentPosts/><div id="ai-recommendations" className="space-y-6"><AiRecommendations/><div id="connected-accounts"><ConnectedAccounts/></div></div></div><SocialAutomationPanel/><CompetitorIntelligenceCard/></div>}
