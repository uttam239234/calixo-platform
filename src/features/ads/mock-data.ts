import type { Budget, Campaign, PerformanceSummary, Platform, Recommendation } from "./types";

export const platforms: Platform[] = [
  { id: "google", name: "Google Ads", shortName: "G", color: "#4285F4", status: "Connected", lastSync: "2 min ago", campaignCount: 14, spend: 48250, clicks: 42120, impressions: 1860000, conversions: 1482, roas: 5.2, ctr: 2.26 },
  { id: "meta", name: "Meta Ads", shortName: "M", color: "#8b5cf6", status: "Connected", lastSync: "5 min ago", campaignCount: 11, spend: 36780, clicks: 38640, impressions: 1540000, conversions: 1136, roas: 4.6, ctr: 2.51 },
  { id: "linkedin", name: "LinkedIn Ads", shortName: "in", color: "#0A66C2", status: "Connected", lastSync: "12 min ago", campaignCount: 6, spend: 18320, clicks: 8960, impressions: 418000, conversions: 286, roas: 3.4, ctr: 2.14 },
  { id: "microsoft", name: "Microsoft Ads", shortName: "MS", color: "#00A4EF", status: "Syncing", lastSync: "Syncing now", campaignCount: 5, spend: 12140, clicks: 11280, impressions: 532000, conversions: 374, roas: 4.1, ctr: 2.12 },
  { id: "tiktok", name: "TikTok Ads", shortName: "TT", color: "#ec4899", status: "Attention required", lastSync: "48 min ago", campaignCount: 8, spend: 22410, clicks: 29150, impressions: 2100000, conversions: 642, roas: 3.8, ctr: 1.39 },
  { id: "pinterest", name: "Pinterest Ads", shortName: "P", color: "#E60023", status: "Connected", lastSync: "8 min ago", campaignCount: 4, spend: 9860, clicks: 13440, impressions: 782000, conversions: 214, roas: 3.6, ctr: 1.72 },
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
  ...initialCampaigns.map((item) => ({ ...item, status: statusMap[item.status] })),
  ...additionalCampaigns.map(([id, platformId, name, objective, budget, spend, status, conversions, ctr, roas]) => ({ id, platformId, name, objective, budget, spend, status, conversions, ctr, roas })),
];

export const campaigns: Campaign[] = campaignCore.map((item, index) => {
  const clicks = Math.round(Number(item.conversions) * (9.2 + (index % 5)));
  const impressions = Math.round(clicks / (Number(item.ctr) / 100));
  const revenue = Math.round(Number(item.spend) * Number(item.roas));
  return {
    ...item,
    budget: Number(item.budget), spend: Number(item.spend), conversions: Number(item.conversions), ctr: Number(item.ctr), roas: Number(item.roas),
    revenue, clicks, impressions, cpa: Number(item.conversions) ? Number(item.spend) / Number(item.conversions) : 0,
    qualityScore: 6 + (index % 4), owner: owners[index % owners.length],
    createdAt: `2026-${String((index % 6) + 1).padStart(2, "0")}-${String((index % 24) + 1).padStart(2, "0")}`,
    startDate: `2026-07-${String((index % 12) + 1).padStart(2, "0")}`, endDate: `2026-09-${String((index % 20) + 8).padStart(2, "0")}`,
    audience: ["High-intent professionals", "Past website visitors", "Lookalike customers", "Enterprise decision makers"][index % 4],
    keywords: ["marketing automation", "growth platform", "campaign management", "AI marketing"].slice(0, 2 + (index % 3)), creatives: 2 + (index % 6),
  } as Campaign;
});

export const budget: Budget = { total: 180000, spent: 137900, remaining: 42100, projected: 172400, period: "July 2026" };

export const performance: PerformanceSummary = { spend: 137900, impressions: 6450000, clicks: 130150, conversions: 3920, revenue: 626600, ctr: 2.02, roas: 4.54, spendChange: 8.4, conversionChange: 14.2, roasChange: 6.8 };

export const recommendations: Recommendation[] = [
  { id: "r1", title: "Increase Brand Search budget", description: "Demand exceeds the daily cap. An extra $120/day could generate 38 more conversions weekly.", impact: "High", category: "Budget" },
  { id: "r2", title: "Pause Q3 Webinar ads", description: "Cost per lead is 41% above your LinkedIn account average over the last 14 days.", impact: "High", category: "Performance" },
  { id: "r3", title: "Duplicate Cart Recovery winner", description: "This campaign has sustained an 8.1x ROAS. Test the winning structure with a 30-day audience.", impact: "High", category: "Performance" },
  { id: "r4", title: "Refresh TikTok creatives", description: "Frequency is rising while CTR has declined for six consecutive days.", impact: "Medium", category: "Creative" },
  { id: "r5", title: "Expand enterprise audience", description: "Add adjacent IT leadership segments to unlock an estimated 84K qualified profiles.", impact: "Medium", category: "Audience" },
];
