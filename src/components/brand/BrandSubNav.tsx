"use client";

import { ModuleTabs, type ModuleTab } from "@/components/enterprise/module";
import {
  LayoutDashboard, MessageSquare, TrendingUp, ShieldAlert,
  BarChart3, Bot, Bell, FileText, Settings, Activity, Search,
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
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <ModuleTabs tabs={navItems} baseUrl="/dashboard/brand" />
      </div>
      <button
        onClick={() => window.dispatchEvent(new Event("brand-command-palette:toggle"))}
        className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-border bg-surface/70 px-3.5 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
      >
        <Search size={15} />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded-md border border-border bg-surface/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">⌘K</kbd>
      </button>
    </div>
  );
}