"use client";

import { ModuleTabs, type ModuleTab } from "@/components/enterprise/module";
import {
  LayoutDashboard, MessageSquare, TrendingUp, ShieldAlert,
  BarChart3, Bot, Bell, FileText, Settings, Activity,
} from "lucide-react";

const navItems: ModuleTab[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard/brand', icon: LayoutDashboard },
  { id: 'mentions', label: 'Live Mentions', href: '/dashboard/brand/mentions', icon: MessageSquare },
  { id: 'sentiment', label: 'Sentiment', href: '/dashboard/brand/sentiment', icon: Activity },
  { id: 'competitors', label: 'Competitors', href: '/dashboard/brand/competitors', icon: BarChart3 },
  { id: 'trends', label: 'Trends', href: '/dashboard/brand/trends', icon: TrendingUp },
  { id: 'crisis', label: 'Crisis Detection', href: '/dashboard/brand/crisis', icon: ShieldAlert },
  { id: 'insights', label: 'AI Insights', href: '/dashboard/brand/insights', icon: Bot },
  { id: 'alerts', label: 'Alerts', href: '/dashboard/brand/alerts', icon: Bell },
  { id: 'reports', label: 'Reports', href: '/dashboard/brand/reports', icon: FileText },
  { id: 'settings', label: 'Settings', href: '/dashboard/brand/settings', icon: Settings },
];

export function BrandSubNav() {
  return <ModuleTabs tabs={navItems} baseUrl="/dashboard/brand" className="mb-6" />;
}