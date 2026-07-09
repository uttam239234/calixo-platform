import type { AdsPlatformMeta, Campaign, CampaignStatus } from "../types";

/**
 * Static per-provider identity only — every numeric field (spend, clicks, campaignCount, ...)
 * that used to be hand-authored alongside these in `features/ads/mock-data.ts` is now computed
 * live by `AdsEngine.getPlatforms()` from the real campaign array below. That earlier hardcoded
 * data was internally inconsistent with the campaign records (e.g. Google Ads claimed a
 * `campaignCount` of 14 while only 5 campaigns actually referenced `platformId: "google"`) —
 * exactly the "hardcoded metrics / fake spend" class of issue this certification pass fixes.
 */
export const ADS_PLATFORM_META: AdsPlatformMeta[] = [
  { id: "google", name: "Google Ads", shortName: "G", color: "#4285F4" },
  { id: "meta", name: "Meta Ads", shortName: "M", color: "#8b5cf6" },
  { id: "linkedin", name: "LinkedIn Ads", shortName: "in", color: "#0A66C2" },
  { id: "microsoft", name: "Microsoft Ads", shortName: "MS", color: "#00A4EF" },
  { id: "tiktok", name: "TikTok Ads", shortName: "TT", color: "#ec4899" },
  { id: "pinterest", name: "Pinterest Ads", shortName: "P", color: "#E60023" },
];

const initialCampaigns = [
  { id: "c1", platformId: "google", name: "Brand Search — Global", objective: "Conversions", budget: 12000, spend: 9840, status: "Active", conversions: 426, ctr: 6.82, roas: 7.4 },
  { id: "c2", platformId: "meta", name: "Summer Growth Prospecting", objective: "Acquisition", budget: 18000, spend: 14220, status: "Active", conversions: 318, ctr: 2.74, roas: 5.1 },
  { id: "c3", platformId: "linkedin", name: "Enterprise Decision Makers", objective: "Lead generation", budget: 9500, spend: 7180, status: "Active", conversions: 92, ctr: 1.94, roas: 3.8 },
  { id: "c4", platformId: "tiktok", name: "Creator Spark — Product Demo", objective: "Awareness", budget: 15000, spend: 13240, status: "Active", conversions: 247, ctr: 1.62, roas: 3.6 },
  { id: "c5", platformId: "microsoft", name: "Competitor Search Capture", objective: "Conversions", budget: 7200, spend: 5820, status: "Active", conversions: 188, ctr: 3.42, roas: 4.9 },
  { id: "c6", platformId: "google", name: "Performance Max — APAC", objective: "Revenue", budget: 22000, spend: 18650, status: "Active", conversions: 512, ctr: 2.18, roas: 6.2 },
  { id: "c7", platformId: "meta", name: "Cart Recovery — 14 Day", objective: "Retargeting", budget: 8000, spend: 6340, status: "Active", conversions: 209, ctr: 3.86, roas: 8.1 },
  { id: "c8", platformId: "linkedin", name: "Q3 Webinar Registrations", objective: "Lead generation", budget: 6800, spend: 4190, status: "Paused", conversions: 54, ctr: 1.32, roas: 2.4 },
  { id: "c9", platformId: "tiktok", name: "UGC Creative Test Batch 04", objective: "Engagement", budget: 5000, spend: 1960, status: "Draft", conversions: 31, ctr: 1.12, roas: 1.8 },
  { id: "c10", platformId: "microsoft", name: "B2B Search — UK & Europe", objective: "Lead generation", budget: 8400, spend: 7670, status: "Active", conversions: 163, ctr: 2.92, roas: 4.2 },
  { id: "c11", platformId: "google", name: "YouTube Product Stories", objective: "Awareness", budget: 11000, spend: 10920, status: "Completed", conversions: 118, ctr: 1.46, roas: 2.9 },
  { id: "c12", platformId: "meta", name: "Lookalike Expansion — 3%", objective: "Acquisition", budget: 12500, spend: 8160, status: "Paused", conversions: 142, ctr: 2.08, roas: 3.2 },
] as const;

const additionalCampaigns = [
  ["c13", "pinterest", "Evergreen Product Collections", "Catalog sales", 9200, 5140, "Running", 136, 1.88, 4.1],
  ["c14", "google", "Non-Brand Search — India", "Acquisition", 16000, 9820, "Running", 284, 4.12, 5.5],
  ["c15", "meta", "Founder Story Video", "Awareness", 6400, 2880, "Scheduled", 42, 1.79, 2.2],
  ["c16", "linkedin", "ABM — Financial Services", "Lead generation", 12800, 8040, "Running", 76, 1.48, 3.9],
  ["c17", "microsoft", "Brand Defense — US", "Conversions", 5400, 4920, "Completed", 149, 5.08, 6.7],
  ["c18", "tiktok", "Behind the Product Series", "Engagement", 7800, 3370, "Review", 68, 1.95, 2.7],
  ["c19", "pinterest", "Holiday Planning Boards", "Traffic", 6300, 2120, "Draft", 38, 2.14, 2.4],
  ["c20", "google", "Demand Gen — New Markets", "Awareness", 14200, 11420, "Running", 231, 1.72, 4.3],
  ["c21", "meta", "Customer Stories Retargeting", "Retargeting", 8800, 7810, "Running", 194, 3.28, 6.2],
  ["c22", "linkedin", "Executive Report Download", "Lead generation", 10800, 3260, "Paused", 39, 1.16, 2.1],
  ["c23", "microsoft", "Dynamic Search Expansion", "Acquisition", 7600, 6840, "Running", 172, 2.84, 4.7],
  ["c24", "tiktok", "Summer Creator Partnership", "Awareness", 19400, 19120, "Archived", 304, 1.38, 3.1],
  ["c25", "pinterest", "Workspace Inspiration", "Traffic", 7200, 4480, "Running", 97, 2.32, 3.5],
] as const;

const owners = ["Aarav Mehta", "Maya Chen", "Noah Williams", "Sofia Rossi", "Liam Patel"];
const statusMap = { Active: "Running", Paused: "Paused", Draft: "Draft", Completed: "Completed" } as const;

const campaignCore = [
  ...initialCampaigns.map(item => ({ ...item, status: statusMap[item.status] })),
  ...additionalCampaigns.map(([id, platformId, name, objective, budget, spend, status, conversions, ctr, roas]) => ({ id, platformId, name, objective, budget, spend, status, conversions, ctr, roas })),
];

export function generateAdsCampaigns(organizationId: string): Campaign[] {
  return campaignCore.map((item, index) => {
    const clicks = Math.round(Number(item.conversions) * (9.2 + (index % 5)));
    const impressions = Math.round(clicks / (Number(item.ctr) / 100));
    const revenue = Math.round(Number(item.spend) * Number(item.roas));
    return {
      ...item,
      status: item.status as CampaignStatus,
      budget: Number(item.budget),
      spend: Number(item.spend),
      conversions: Number(item.conversions),
      ctr: Number(item.ctr),
      roas: Number(item.roas),
      revenue,
      clicks,
      impressions,
      cpa: Number(item.conversions) ? Number(item.spend) / Number(item.conversions) : 0,
      qualityScore: 6 + (index % 4),
      owner: owners[index % owners.length],
      createdAt: `2026-${String((index % 6) + 1).padStart(2, "0")}-${String((index % 24) + 1).padStart(2, "0")}`,
      startDate: `2026-07-${String((index % 12) + 1).padStart(2, "0")}`,
      endDate: `2026-09-${String((index % 20) + 8).padStart(2, "0")}`,
      audience: ["High-intent professionals", "Past website visitors", "Lookalike customers", "Enterprise decision makers"][index % 4],
      keywords: ["marketing automation", "growth platform", "campaign management", "AI marketing"].slice(0, 2 + (index % 3)),
      creatives: 2 + (index % 6),
      organizationId,
    } satisfies Campaign;
  });
}
