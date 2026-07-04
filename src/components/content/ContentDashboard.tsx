"use client";

import { motion } from "framer-motion";
import { PenSquare, Sparkles, FileText, Library, Calendar, GitBranch, CheckSquare, Image as ImageIcon, Search, BarChart3, Settings, Plus, Upload, Eye, ArrowUp, FileEdit } from "lucide-react";
import { ModuleHeader } from "@/components/enterprise/module";
import {
  ContentHeader, ContentKpiGrid, ContentQuickActions, ContentChartSection,
  RecentContentTable, PublishingQueue, CalendarWidget, AIRecommendationPanel,
} from "@/components/content/ContentSharedComponents";
import {
  contentKpis, contentItems, scheduledPosts, aiSessions,
  contentProductionData, platformDistributionData, publishingTimelineData,
} from "@/lib/content-data";

export function ContentDashboard() {
  const quickActions = [
    { label: "AI Generator", icon: Sparkles, href: "/dashboard/content/generator", primary: true },
    { label: "New Content", icon: Plus, href: "/dashboard/content/editor" },
    { label: "Upload Assets", icon: Upload, href: "/dashboard/content/assets" },
    { label: "View Library", icon: Library, href: "/dashboard/content/library" },
    { label: "Templates", icon: FileText, href: "/dashboard/content/templates" },
    { label: "Calendar", icon: Calendar, href: "/dashboard/content/calendar" },
    { label: "Approvals", icon: CheckSquare, href: "/dashboard/content/approvals" },
    { label: "SEO", icon: Search, href: "/dashboard/content/seo" },
  ];

  const publishedMore = contentItems.filter(c => c.status === "published").slice(0, 5);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <ModuleHeader
        title="Content Studio"
        description="Enterprise content creation, management, and publishing platform"
        icon={<PenSquare size={20} className="text-cyan-400" />}
      />

      {/* KPI Grid */}
      <ContentKpiGrid items={contentKpis} columns={4} />

      {/* Quick Actions */}
      <ContentQuickActions actions={quickActions} />

      {/* Charts Row 1 */}
      <div className="grid gap-6 xl:grid-cols-2">
        <ContentChartSection title="Content Production" description="Monthly content output by type" span="two-thirds">
          <div className="h-64 flex items-end gap-2">
            {contentProductionData.map((point) => (
              <div key={point.month} className="flex-1 flex flex-col justify-end gap-0.5">
                <div className="flex flex-col gap-0.5" style={{ height: "200px" }}>
                  <div className="w-full bg-cyan-500/70 rounded-t-sm" style={{ height: `${point.blog * 2}%` }} title={`Blog: ${point.blog}`} />
                  <div className="w-full bg-emerald-500/60" style={{ height: `${point.social * 1.5}%` }} title={`Social: ${point.social}`} />
                  <div className="w-full bg-amber-500/50" style={{ height: `${point.email * 3}%` }} title={`Email: ${point.email}`} />
                  <div className="w-full bg-purple-500/40 rounded-b-sm" style={{ height: `${point.video * 4}%` }} title={`Video: ${point.video}`} />
                </div>
                <span className="text-[10px] text-slate-500 text-center mt-1">{point.month}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-cyan-500/70" /> Blog</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500/60" /> Social</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500/50" /> Email</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-purple-500/40" /> Video</span>
          </div>
        </ContentChartSection>

        <ContentChartSection title="Platform Distribution" description="Content by distribution channel">
          <div className="space-y-3">
            {platformDistributionData.map((p) => (
              <div key={p.platform} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${p.color}20` }}>
                  <span className="text-xs font-bold" style={{ color: p.color }}>{p.platform[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300">{p.platform}</span>
                    <span className="text-slate-500 font-medium">{p.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${p.percentage}%`, backgroundColor: p.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ContentChartSection>
      </div>

      {/* Charts Row 2: Publishing Timeline */}
      <ContentChartSection title="Publishing Activity" description="Daily published and scheduled content (last 30 days)">
        <div className="h-48 flex items-end gap-1">
          {publishingTimelineData.map((point) => (
            <div key={point.date} className="flex-1 flex flex-col justify-end gap-px">
              <div className="w-full bg-cyan-500/60 rounded-t-sm" style={{ height: `${point.published * 4}px` }} title={`${point.date}: ${point.published} published`} />
              <div className="w-full bg-amber-500/40 rounded-b-sm" style={{ height: `${point.scheduled * 4}px` }} title={`${point.date}: ${point.scheduled} scheduled`} />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-cyan-500/60" /> Published</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500/40" /> Scheduled</span>
        </div>
      </ContentChartSection>

      {/* Widgets Row */}
      <div className="grid gap-6 xl:grid-cols-2">
        <RecentContentTable items={contentItems} maxItems={5} />
        <PublishingQueue posts={scheduledPosts} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CalendarWidget posts={scheduledPosts} />
        <AIRecommendationPanel sessions={aiSessions} />
      </div>
    </div>
  );
}