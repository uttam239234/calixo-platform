import type {
  ActivityItem,
  CalendarEventItem,
  ConnectedAccountItem,
  HealthScoreData,
  KpiItem,
  PerformancePoint,
  QuickActionItem,
  RecommendationItem,
  WelcomeBannerData,
} from "./types";

export const welcomeBannerData: WelcomeBannerData = {
  eyebrow: "AI Marketing Copilot is active",
  title: "Welcome back, Uttam. Your growth engine is performing strongly.",
  description:
    "Campaigns are trending up, lead quality is improving, and Calixo has three high-impact recommendations ready for you.",
  focus: "Scale the best-performing acquisition funnel",
};

export const healthScoreData: HealthScoreData = {
  score: 87,
  label: "Marketing health",
  description: "Strong momentum across campaigns, automation, and activation.",
};

export const kpiData: KpiItem[] = [
  { id: "revenue", title: "Revenue", value: "$84.2K", change: "+12.4%", trend: "up", sparkline: [38, 52, 54, 67, 71, 86], comparison: "vs $74.9K previous period" },
  { id: "leads", title: "Qualified Leads", value: "1,240", change: "+8.1%", trend: "up", sparkline: [18, 24, 29, 33, 41, 49], comparison: "vs 1,146 previous period" },
  { id: "automation", title: "Automation", value: "73%", change: "+4.2%", trend: "steady", sparkline: [41, 45, 48, 54, 57, 61], comparison: "vs 70% previous period" },
  { id: "conversion", title: "Conversion", value: "6.8%", change: "+1.2%", trend: "up", sparkline: [21, 28, 32, 35, 39, 46], comparison: "vs 5.6% previous period" },
  { id: "retention", title: "Retention", value: "91%", change: "+3.5%", trend: "up", sparkline: [57, 61, 66, 72, 78, 83], comparison: "vs 88% previous period" },
  { id: "engagement", title: "Engagement", value: "68%", change: "+11%", trend: "up", sparkline: [44, 49, 53, 57, 64, 71], comparison: "vs 61% previous period" },
  { id: "response", title: "Response Time", value: "2.1h", change: "-14%", trend: "steady", sparkline: [92, 85, 79, 72, 69, 62], comparison: "vs 2.4h previous period" },
  { id: "attribution", title: "Attribution", value: "94%", change: "+5.6%", trend: "up", sparkline: [51, 58, 63, 69, 74, 81], comparison: "vs 89% previous period" },
];

export const recommendationData: RecommendationItem[] = [
  {
    id: "retargeting",
    title: "Boost retargeting spend",
    description: "The highest-intent segment is converting 22% better than average.",
    impact: "+18% pipeline",
    confidence: 94,
  },
  {
    id: "copy",
    title: "Refine AI copy variants",
    description: "Three subject lines are outperforming your launch baseline in open rate.",
    impact: "+9% open rate",
    confidence: 91,
  },
  {
    id: "handoff",
    title: "Automate lead handoff",
    description: "Sales is receiving leads 2 hours earlier after recent workflow updates.",
    impact: "+14% faster follow-up",
    confidence: 88,
  },
];

export const quickActions: QuickActionItem[] = [
  { id: "launch", title: "Launch campaign", description: "Start a new AI-powered acquisition sequence" },
  { id: "automations", title: "Adjust automations", description: "Tune rules and triggers for better efficiency" },
  { id: "report", title: "Generate report", description: "Share executive insights with the team" },
];

export const recentActivity: ActivityItem[] = [
  { id: "optimize", title: "Campaign optimized", detail: "Email nurture flow improved by 14%", time: "5 min ago" },
  { id: "sync", title: "Lead sync completed", detail: "221 new contacts connected", time: "32 min ago" },
  { id: "insight", title: "Insight generated", detail: "Audience trend report ready", time: "1 hr ago" },
];

export const connectedAccounts: ConnectedAccountItem[] = [
  { id: "hubspot", name: "HubSpot", status: "Connected" },
  { id: "google", name: "Google Ads", status: "Synced 10m ago" },
  { id: "slack", name: "Slack", status: "Connected" },
  { id: "stripe", name: "Stripe", status: "Synced 2h ago" },
];

export const performanceSeries: PerformancePoint[] = [
  { label: "Mon", value: 74 },
  { label: "Tue", value: 82 },
  { label: "Wed", value: 88 },
  { label: "Thu", value: 91 },
  { label: "Fri", value: 97 },
  { label: "Sat", value: 93 },
  { label: "Sun", value: 102 },
];

export const calendarEvents: CalendarEventItem[] = [
  { id: "review", title: "Leadership review", date: "Today", time: "10:00", tone: "cyan" },
  { id: "launch", title: "Product launch", date: "Tomorrow", time: "14:30", tone: "amber" },
  { id: "sync", title: "Revenue sync", date: "Thu", time: "09:00", tone: "emerald" },
];
