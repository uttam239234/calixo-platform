export interface WelcomeBannerData {
  eyebrow: string;
  title: string;
  description: string;
  focus: string;
}

export interface HealthScoreData {
  score: number;
  label: string;
  description: string;
}

export interface KpiItem {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: "up" | "steady";
  sparkline: number[];
  comparison: string;
}

export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  impact: string;
  confidence: number;
}

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  time: string;
}

export interface ConnectedAccountItem {
  id: string;
  name: string;
  status: string;
}

export interface PerformancePoint {
  label: string;
  value: number;
}

export interface CalendarEventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  tone: "cyan" | "amber" | "emerald";
}
