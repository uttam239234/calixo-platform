export type CampaignStatus = "Draft" | "Review" | "Scheduled" | "Running" | "Paused" | "Completed" | "Archived";

export type PlatformStatus = "Connected" | "Syncing" | "Attention required";

export interface Campaign {
  id: string;
  platformId: string;
  name: string;
  objective: string;
  budget: number;
  spend: number;
  status: CampaignStatus;
  conversions: number;
  ctr: number;
  roas: number;
  revenue: number;
  clicks: number;
  impressions: number;
  cpa: number;
  qualityScore: number;
  owner: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  audience: string;
  keywords: string[];
  creatives: number;
}

export type CampaignSortKey = "spend" | "conversions" | "ctr" | "roas" | "cpa" | "createdAt" | "name";

export interface Platform {
  id: string;
  name: string;
  shortName: string;
  color: string;
  status: PlatformStatus;
  lastSync: string;
  campaignCount: number;
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
  roas: number;
  ctr: number;
}

export interface Budget {
  total: number;
  spent: number;
  remaining: number;
  projected: number;
  period: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: "High" | "Medium";
  category: "Budget" | "Performance" | "Creative" | "Audience";
}

export interface PerformanceSummary {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  roas: number;
  spendChange: number;
  conversionChange: number;
  roasChange: number;
}
