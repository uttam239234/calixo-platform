import type {
  ActivityItem,
  ConnectedPlatform,
  KpiItem,
  NotificationItem,
  PerformancePoint,
  QuickActionItem,
  RecommendationItem,
  UpcomingTask,
  WelcomeHeroData,
  ChannelData,
} from "./types";

export const welcomeHeroData: WelcomeHeroData = {
  greeting: "Good morning",
  workspace: "Royal Global University",
  healthScore: 87,
  healthLabel: "Marketing Health",
  aiSummary: "Campaigns trending up 12.4% this week. Lead quality improving across all channels. Three high-impact recommendations are ready for your review.",
  date: "Thursday, July 3, 2026",
};

export const kpiData: KpiItem[] = [
  {
    id: "revenue",
    title: "Revenue",
    value: "$84.2K",
    change: "+12.4%",
    trend: "up",
    sparkline: [38, 52, 54, 67, 71, 86, 94],
    comparison: "vs $74.9K last month",
    aiScore: 94,
  },
  {
    id: "leads",
    title: "Leads",
    value: "1,240",
    change: "+8.1%",
    trend: "up",
    sparkline: [18, 24, 29, 33, 41, 49, 52],
    comparison: "vs 1,146 last month",
    aiScore: 87,
  },
  {
    id: "conversions",
    title: "Conversion Rate",
    value: "6.8%",
    change: "+1.2%",
    trend: "up",
    sparkline: [21, 28, 32, 35, 39, 46, 48],
    comparison: "vs 5.6% last month",
    aiScore: 91,
  },
  {
    id: "campaigns",
    title: "Active Campaigns",
    value: "12",
    change: "+2 new",
    trend: "up",
    sparkline: [8, 9, 9, 10, 10, 11, 12],
    comparison: "this week",
    aiScore: 82,
  },
  {
    id: "health-score",
    title: "Health Score",
    value: "87",
    change: "+4 pts",
    trend: "up",
    sparkline: [62, 67, 71, 76, 80, 84, 87],
    comparison: "overall performance index",
    aiScore: 100,
  },
];

export const quickActions: QuickActionItem[] = [
  { id: "create-campaign", title: "Create Campaign", description: "Launch a new AI-powered campaign", icon: "megaphone" },
  { id: "compose-post", title: "Compose Post", description: "Create and schedule a post", icon: "pen-square" },
  { id: "generate-report", title: "Generate Report", description: "Export executive summary", icon: "file-text" },
  { id: "open-analytics", title: "View Analytics", description: "Deep dive into metrics", icon: "bar-chart" },
  { id: "launch-workflow", title: "Launch Workflow", description: "Trigger an automation", icon: "zap" },
  { id: "ask-ai", title: "Ask AI Copilot", description: "Get AI-powered insights", icon: "bot" },
];

export const performanceSeries: PerformancePoint[] = [
  { label: "Mon", revenue: 74, leads: 42, conversions: 28, impressions: 120 },
  { label: "Tue", revenue: 82, leads: 48, conversions: 32, impressions: 135 },
  { label: "Wed", revenue: 88, leads: 52, conversions: 35, impressions: 148 },
  { label: "Thu", revenue: 91, leads: 55, conversions: 38, impressions: 155 },
  { label: "Fri", revenue: 97, leads: 60, conversions: 41, impressions: 162 },
  { label: "Sat", revenue: 93, leads: 58, conversions: 39, impressions: 158 },
  { label: "Sun", revenue: 102, leads: 64, conversions: 44, impressions: 170 },
];

export const channelData: ChannelData[] = [
  { id: "google-ads", name: "Google Ads", platform: "google", spend: "$12,450", clicks: "8,230", ctr: "3.2%", trend: "up", status: "active" },
  { id: "meta-ads", name: "Meta Ads", platform: "meta", spend: "$9,820", clicks: "6,140", ctr: "2.8%", trend: "up", status: "active" },
  { id: "linkedin", name: "LinkedIn", platform: "linkedin", spend: "$5,300", clicks: "2,890", ctr: "1.9%", trend: "down", status: "active" },
  { id: "instagram", name: "Instagram", platform: "instagram", spend: "$4,150", clicks: "3,420", ctr: "4.1%", trend: "up", status: "active" },
  { id: "youtube", name: "YouTube", platform: "youtube", spend: "$3,800", clicks: "1,950", ctr: "1.5%", trend: "steady", status: "paused" },
];

export const connectedPlatforms: ConnectedPlatform[] = [
  { id: "google-ads", name: "Google Ads", platform: "google", status: "connected", lastSync: "2 min ago" },
  { id: "meta", name: "Meta", platform: "meta", status: "connected", lastSync: "5 min ago" },
  { id: "linkedin", name: "LinkedIn", platform: "linkedin", status: "syncing", lastSync: "Syncing..." },
  { id: "instagram", name: "Instagram", platform: "instagram", status: "connected", lastSync: "15 min ago" },
  { id: "youtube", name: "YouTube", platform: "youtube", status: "error", lastSync: "Connection error" },
];

export const recentActivity: ActivityItem[] = [
  { id: "a1", user: "Sarah Chen", initials: "SC", action: "updated", target: "Summer Sale campaign", timestamp: "2 min ago", type: "user" },
  { id: "a2", user: "System", initials: "SY", action: "acquired new lead:", target: "sam@company.com", timestamp: "15 min ago", type: "system" },
  { id: "a3", user: "AI Copilot", initials: "AI", action: "flagged budget alert:", target: "Facebook Ads 85% spent", timestamp: "1 hour ago", type: "ai" },
  { id: "a4", user: "System", initials: "SY", action: "generated", target: "Monthly performance report", timestamp: "2 hours ago", type: "system" },
  { id: "a5", user: "Mike Torres", initials: "MT", action: "scheduled", target: "LinkedIn post for Friday", timestamp: "3 hours ago", type: "user" },
  { id: "a6", user: "Integration", initials: "IN", action: "synced", target: "Salesforce CRM data", timestamp: "4 hours ago", type: "integration" },
];

export const recommendationData: RecommendationItem[] = [
  {
    id: "r1",
    title: "Boost retargeting spend",
    description: "Highest-intent segment converting 22% better than average. Increase budget allocation.",
    impact: "+18% pipeline",
    impactType: "positive",
    confidence: 94,
    action: "Increase Budget",
    priority: "high",
  },
  {
    id: "r2",
    title: "Refine AI copy variants",
    description: "Three subject lines outperforming baseline by 34% in open rate. Deploy to all campaigns.",
    impact: "+9% open rate",
    impactType: "opportunity",
    confidence: 91,
    action: "Apply Variants",
    priority: "high",
  },
  {
    id: "r3",
    title: "Automate lead handoff",
    description: "Sales receiving leads 2 hours earlier after workflow updates. Expand to all segments.",
    impact: "+14% faster follow-up",
    impactType: "positive",
    confidence: 88,
    action: "Expand Workflow",
    priority: "medium",
  },
  {
    id: "r4",
    title: "Facebook CTR dropping",
    description: "CTR declined 24% in 3 days. New creative may need A/B testing.",
    impact: "-24% CTR",
    impactType: "critical",
    confidence: 82,
    action: "Review Creative",
    priority: "high",
  },
];

export const upcomingTasks: UpcomingTask[] = [
  { id: "t1", title: "Leadership Review", date: "Today", time: "10:00 AM", type: "meeting", priority: "high", assignee: "Uttam" },
  { id: "t2", title: "Product Launch Campaign", date: "Tomorrow", time: "2:30 PM", type: "campaign", priority: "high", assignee: "Sarah" },
  { id: "t3", title: "Revenue Sync Deadline", date: "Thu, Jul 5", time: "9:00 AM", type: "deadline", priority: "medium", assignee: "Finance" },
  { id: "t4", title: "Weekly Report Due", date: "Fri, Jul 6", time: "5:00 PM", type: "report", priority: "medium", assignee: "Mike" },
  { id: "t5", title: "Q3 Budget Review", date: "Mon, Jul 9", time: "11:00 AM", type: "meeting", priority: "low", assignee: "Team" },
];

export const notifications: NotificationItem[] = [
  { id: "n1", title: "Google Ads budget 85% spent", description: 'Campaign "Summer Sale" is approaching budget limit.', timestamp: "2h ago", severity: "warning", read: false, action: "View Campaign" },
  { id: "n2", title: "New lead: sam@company.com", description: "High-value lead from Google Ads. Assigned to Sarah.", timestamp: "15m ago", severity: "info", read: false, action: "View Lead" },
  { id: "n3", title: "Monthly report ready", description: "Your July performance report is available for download.", timestamp: "1d ago", severity: "success", read: true, action: "Download PDF" },
  { id: "n4", title: "Instagram API error", description: "Connection to Instagram Business account failed.", timestamp: "3h ago", severity: "critical", read: false, action: "Reconnect" },
  { id: "n5", title: "Campaign milestone reached", description: "Q2 revenue target exceeded by 18%.", timestamp: "1d ago", severity: "success", read: true },
];