"use client";
import { SocialHeader } from "./SocialHeader";
import { SocialKpiGrid } from "./SocialKpiGrid";
import { QuickActions } from "./QuickActions";
import { PlatformOverview } from "./PlatformOverview";
import { RecentPosts } from "./RecentPosts";
import { AiRecommendations } from "./AiRecommendations";
import { ConnectedAccounts } from "./ConnectedAccounts";
export function SocialDashboard(){return <div className="space-y-6 pb-8"><SocialHeader/><QuickActions/><SocialKpiGrid/><PlatformOverview/><div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]"><RecentPosts/><div className="space-y-6"><AiRecommendations/><ConnectedAccounts/></div></div></div>}
