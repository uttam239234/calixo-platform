import type {
  AIInsight,
  AudienceItem,
  CampaignPerformanceRow,
  ChannelPerformanceRow,
  FunnelStage,
  GeoMetric,
  ReportItem,
  RevenuePoint,
  SummaryCardData,
  TrafficMetricData,
} from "./types";

export const summaryCards: SummaryCardData[] = [
  {
    label: "Revenue",
    value: "$842.4K",
    trend: "+18.2%",
    percentage: "vs last month",
    comparison: "Peak day: $46.3K",
    sparkline: [34, 41, 36, 48, 52, 57, 61],
    tone: "positive",
  },
  {
    label: "Marketing Spend",
    value: "$212.7K",
    trend: "-6.1%",
    percentage: "efficient pacing",
    comparison: "Forecast variance: 2.3%",
    sparkline: [28, 30, 27, 29, 31, 30, 28],
    tone: "neutral",
  },
  {
    label: "ROAS",
    value: "4.8x",
    trend: "+0.7x",
    percentage: "above target",
    comparison: "Best channel: Meta",
    sparkline: [22, 24, 26, 29, 31, 34, 37],
    tone: "positive",
  },
  {
    label: "CPA",
    value: "$91",
    trend: "-11%",
    percentage: "lower than benchmark",
    comparison: "Goal: $100",
    sparkline: [40, 39, 35, 34, 32, 30, 29],
    tone: "positive",
  },
  {
    label: "Conversion Rate",
    value: "6.2%",
    trend: "+1.1 pts",
    percentage: "from landing pages",
    comparison: "Top page: /enterprise",
    sparkline: [18, 19, 22, 24, 25, 27, 29],
    tone: "positive",
  },
  {
    label: "Leads",
    value: "2,184",
    trend: "+14%",
    percentage: "new pool",
    comparison: "Qualified: 41%",
    sparkline: [15, 19, 21, 24, 26, 28, 30],
    tone: "positive",
  },
  {
    label: "Sales",
    value: "318",
    trend: "+9.3%",
    percentage: "from pipeline",
    comparison: "Average order: $2.6K",
    sparkline: [20, 22, 21, 24, 26, 27, 30],
    tone: "positive",
  },
  {
    label: "Growth",
    value: "+24%",
    trend: "QoQ",
    percentage: "momentum accelerating",
    comparison: "Momentum score: 8.9/10",
    sparkline: [12, 15, 18, 22, 24, 27, 29],
    tone: "positive",
  },
];

export const revenueSeries: Record<string, RevenuePoint[]> = {
  "7d": [
    { label: "Mon", revenue: 112000, spend: 26000 },
    { label: "Tue", revenue: 121000, spend: 27000 },
    { label: "Wed", revenue: 131000, spend: 28000 },
    { label: "Thu", revenue: 142000, spend: 29000 },
    { label: "Fri", revenue: 158000, spend: 30000 },
    { label: "Sat", revenue: 169000, spend: 32000 },
    { label: "Sun", revenue: 177000, spend: 33000 },
  ],
  "30d": [
    { label: "W1", revenue: 314000, spend: 76000 },
    { label: "W2", revenue: 352000, spend: 81000 },
    { label: "W3", revenue: 388000, spend: 84000 },
    { label: "W4", revenue: 421000, spend: 86000 },
  ],
  "90d": [
    { label: "Jan", revenue: 712000, spend: 188000 },
    { label: "Feb", revenue: 748000, spend: 192000 },
    { label: "Mar", revenue: 798000, spend: 201000 },
    { label: "Apr", revenue: 842000, spend: 213000 },
  ],
  custom: [
    { label: "Apr 1", revenue: 186000, spend: 42000 },
    { label: "Apr 8", revenue: 208000, spend: 46000 },
    { label: "Apr 15", revenue: 231000, spend: 50000 },
    { label: "Apr 22", revenue: 247000, spend: 52000 },
    { label: "Apr 29", revenue: 269000, spend: 56000 },
  ],
};

export const trafficMetrics: TrafficMetricData[] = [
  { label: "Sessions", value: "184.2K", change: "+12.8%" },
  { label: "Users", value: "96.8K", change: "+8.5%" },
  { label: "Returning Users", value: "41.3%", change: "+4.1%" },
  { label: "Bounce Rate", value: "31.4%", change: "-2.2%" },
  { label: "Average Time", value: "4m 28s", change: "+18s" },
];

export const channelPerformance: ChannelPerformanceRow[] = [
  { channel: "Google Ads", spend: "$48.2K", revenue: "$243K", roas: "5.0x", cpa: "$84", leads: "612", status: "Healthy" },
  { channel: "Meta", spend: "$37.9K", revenue: "$228K", roas: "6.0x", cpa: "$76", leads: "498", status: "Optimizing" },
  { channel: "LinkedIn", spend: "$22.4K", revenue: "$98K", roas: "4.4x", cpa: "$119", leads: "189", status: "Monitoring" },
  { channel: "Organic", spend: "$8.1K", revenue: "$74K", roas: "9.1x", cpa: "$42", leads: "193", status: "Healthy" },
  { channel: "Referral", spend: "$5.6K", revenue: "$41K", roas: "7.3x", cpa: "$57", leads: "98", status: "Healthy" },
  { channel: "Email", spend: "$4.8K", revenue: "$36K", roas: "7.5x", cpa: "$53", leads: "91", status: "Healthy" },
  { channel: "Display", spend: "$12.3K", revenue: "$47K", roas: "3.8x", cpa: "$138", leads: "89", status: "Monitoring" },
];

export const campaignPerformance: CampaignPerformanceRow[] = [
  { name: "Enterprise Expansion", clicks: 18421, ctr: "4.8%", cpc: "$1.42", spend: "$26.2K", conversions: 318, revenue: "$164K", roi: "526%" },
  { name: "ABM Lift", clicks: 12890, ctr: "5.4%", cpc: "$1.09", spend: "$14.1K", conversions: 194, revenue: "$91K", roi: "545%" },
  { name: "Lifecycle Boost", clicks: 9652, ctr: "3.7%", cpc: "$0.98", spend: "$9.5K", conversions: 157, revenue: "$72K", roi: "658%" },
];

export const conversionFunnel: FunnelStage[] = [
  { stage: "Visitors", value: 184200, percent: 100 },
  { stage: "Landing Page Views", value: 142000, percent: 77 },
  { stage: "Leads", value: 11840, percent: 64 },
  { stage: "Qualified Leads", value: 4870, percent: 41 },
  { stage: "Customers", value: 318, percent: 3 },
  { stage: "Revenue", value: 842400, percent: 100 },
];

export const audienceInsights: AudienceItem[] = [
  { label: "Age", value: "25-34 (39%)" },
  { label: "Gender", value: "Male 57% / Female 43%" },
  { label: "Device", value: "Mobile 64%" },
  { label: "Location", value: "US West Coast" },
  { label: "Interests", value: "Productivity, AI Tools" },
  { label: "Returning Visitors", value: "41.3%" },
];

export const geoPerformance: GeoMetric[] = [
  { country: "United States", city: "San Francisco", revenue: "$182K", conversions: 64 },
  { country: "United Kingdom", city: "London", revenue: "$94K", conversions: 41 },
  { country: "Canada", city: "Toronto", revenue: "$71K", conversions: 29 },
  { country: "Germany", city: "Berlin", revenue: "$58K", conversions: 22 },
];

export const aiInsights: AIInsight[] = [
  {
    title: "Budget Optimization",
    description: "Shift 8% of spend from display to high-performing Meta retargeting.",
    priority: "High",
    confidence: 92,
    uplift: "+14%",
  },
  {
    title: "Best Audience",
    description: "Double down on buyers aged 25-34 who engage with productivity content.",
    priority: "Medium",
    confidence: 87,
    uplift: "+11%",
  },
  {
    title: "Campaign Risk",
    description: "Pause low-intent display placements showing rising CAC.",
    priority: "High",
    confidence: 89,
    uplift: "+8%",
  },
  {
    title: "Opportunities",
    description: "Expand lifecycle nurture into high-intent referral audiences.",
    priority: "Low",
    confidence: 84,
    uplift: "+6%",
  },
];

export const reports = {
  saved: [
    { title: "Executive Overview", meta: "Weekly • Shared with leadership", status: "Live" } as ReportItem,
    { title: "Demand Quality Report", meta: "Last updated 2h ago", status: "Synced" } as ReportItem,
    { title: "Channel Mix Review", meta: "Quarterly snapshot", status: "Scheduled" } as ReportItem,
  ],
  recent: [
    { title: "Revenue Export", meta: "CSV • 12 min ago", status: "Ready" } as ReportItem,
    { title: "Geo Performance", meta: "PDF • 1h ago", status: "Ready" } as ReportItem,
    { title: "Pipeline Summary", meta: "Excel • 4h ago", status: "Ready" } as ReportItem,
  ],
  schedule: [
    { title: "Daily KPI Digest", meta: "Every morning at 8:00", status: "Active" } as ReportItem,
    { title: "Weekly Leadership Deck", meta: "Every Monday • 9:30", status: "Pending" } as ReportItem,
    { title: "Monthly Forecast", meta: "First day of month", status: "Active" } as ReportItem,
  ],
};
