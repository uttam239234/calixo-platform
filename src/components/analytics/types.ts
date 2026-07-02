export interface SummaryCardData {
  label: string;
  value: string;
  trend: string;
  percentage: string;
  comparison: string;
  sparkline: number[];
  tone: "positive" | "negative" | "neutral";
}

export interface RevenuePoint {
  label: string;
  revenue: number;
  spend: number;
}

export interface TrafficMetricData {
  label: string;
  value: string;
  change: string;
}

export interface ChannelPerformanceRow {
  channel: string;
  spend: string;
  revenue: string;
  roas: string;
  cpa: string;
  leads: string;
  status: "Healthy" | "Monitoring" | "Optimizing";
}

export interface CampaignPerformanceRow {
  name: string;
  clicks: number;
  ctr: string;
  cpc: string;
  spend: string;
  conversions: number;
  revenue: string;
  roi: string;
}

export interface FunnelStage {
  stage: string;
  value: number;
  percent: number;
}

export interface AudienceItem {
  label: string;
  value: string;
}

export interface GeoMetric {
  country: string;
  city: string;
  revenue: string;
  conversions: number;
}

export interface AIInsight {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  confidence: number;
  uplift: string;
}

export interface ReportItem {
  title: string;
  meta: string;
  status: string;
}
