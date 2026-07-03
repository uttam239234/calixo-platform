// Dashboard Data Types

export interface WelcomeHeroData {
  greeting: string;
  workspace: string;
  healthScore: number;
  healthLabel: string;
  aiSummary: string;
  date: string;
}

export interface KpiItem {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "steady";
  sparkline: number[];
  comparison: string;
  aiScore?: number;
}

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface PerformancePoint {
  label: string;
  revenue: number;
  leads: number;
  conversions: number;
  impressions: number;
}

export interface ChannelData {
  id: string;
  name: string;
  platform: string;
  spend: string;
  clicks: string;
  ctr: string;
  trend: "up" | "down" | "steady";
  status: "active" | "paused" | "error";
}

export interface ConnectedPlatform {
  id: string;
  name: string;
  platform: string;
  status: "connected" | "syncing" | "error" | "disconnected";
  lastSync: string;
}

export interface ActivityItem {
  id: string;
  user: string;
  initials: string;
  action: string;
  target: string;
  timestamp: string;
  type: "user" | "system" | "ai" | "integration";
}

export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  impact: string;
  impactType: "positive" | "critical" | "opportunity";
  confidence: number;
  action: string;
  priority: "high" | "medium" | "low";
}

export interface UpcomingTask {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "campaign" | "deadline" | "meeting" | "report";
  priority: "high" | "medium" | "low";
  assignee: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  severity: "critical" | "warning" | "info" | "success";
  read: boolean;
  action?: string;
}