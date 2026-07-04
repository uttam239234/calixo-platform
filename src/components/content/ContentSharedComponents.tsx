"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PenSquare, Sparkles, Upload, Download, Calendar,
  Clock, ChevronRight, ArrowUp, ArrowDown, Eye,
  FileText, Users, Globe, Hash, CheckCircle, AlertCircle,
  FileEdit, Lightbulb, RefreshCw, TrendingUp, Plus,
  Play, Pause, MoreHorizontal, ExternalLink,
} from "lucide-react";
import type { ContentKpi, ContentItem, AISession, ScheduledPost } from "@/lib/content-data";

// ============================================================================
// Content Header
// ============================================================================
interface ContentHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}
export function ContentHeader({ title, description, children, className }: ContentHeaderProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className={cn("mb-6", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/30">
            <PenSquare size={20} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
            {description && <p className="text-sm text-slate-400">{description}</p>}
          </div>
        </div>
        {children}
      </div>
    </motion.div>
  );
}

// ============================================================================
// KPI Grid
// ============================================================================
interface ContentKpiGridProps { items: ContentKpi[]; columns?: number; }
export function ContentKpiGrid({ items, columns = 4 }: ContentKpiGridProps) {
  const iconLookup: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    FileText, CheckCircle, Calendar, FileEdit, Sparkles, Users, Hash, Globe,
  };
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
      <div className={cn("grid gap-4", columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3")}>
        {items.map((kpi) => {
          const Icon = iconLookup[kpi.icon] || FileText;
          return (
            <Card key={kpi.id} padding="sm" gradient>
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/30">
                  <Icon size={16} className="text-cyan-400" />
                </div>
                <span className={cn("text-xs font-medium flex items-center gap-0.5", kpi.trend === "up" ? "text-emerald-400" : "text-red-400")}>
                  {kpi.trend === "up" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {typeof kpi.change === "number" ? `${kpi.change > 0 ? "+" : ""}${kpi.change}%` : kpi.change}
                </span>
              </div>
              <div className="mt-2">
                <p className={cn("text-2xl font-bold text-white", typeof kpi.value === "string" && kpi.value.length > 5 && "text-lg")}>{kpi.value}</p>
                <p className="text-xs text-slate-400">{kpi.title}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Quick Actions
// ============================================================================
interface QuickAction { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; href?: string; onClick?: () => void; primary?: boolean; }
interface ContentQuickActionsProps { actions: QuickAction[]; className?: string; }
export function ContentQuickActions({ actions, className }: ContentQuickActionsProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }} className={className}>
      <Card>
        <CardHeader title="Quick Actions" description="Frequently used content operations" />
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {actions.map((action, i) => {
              const Icon = action.icon;
              const button = (
                <Button key={i} size="sm" variant={action.primary ? "primary" : "outline"} className={cn("gap-2", action.primary ? "" : "border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800")} onClick={action.onClick}>
                  <Icon size={14} /> {action.label}
                </Button>
              );
              if (action.href) return <Link key={i} href={action.href}>{button}</Link>;
              return button;
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// Chart Section Wrapper
// ============================================================================
interface ContentChartSectionProps { title: string; description?: string; children: ReactNode; span?: "full" | "half" | "third" | "two-thirds"; }
export function ContentChartSection({ title, description, children, span = "full" }: ContentChartSectionProps) {
  const spanClass = span === "full" ? "col-span-full" : span === "half" ? "lg:col-span-1" : span === "two-thirds" ? "lg:col-span-2" : "lg:col-span-1";
  return (
    <Card className={spanClass}>
      <CardHeader title={title} description={description} />
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// ============================================================================
// Recent Content Table
// ============================================================================
interface RecentContentTableProps { items: ContentItem[]; maxItems?: number; }
export function RecentContentTable({ items, maxItems = 5 }: RecentContentTableProps) {
  const displayed = items.slice(0, maxItems);
  const statusBadge = (status: ContentItem["status"]) => {
    const styles: Record<string, string> = {
      published: "bg-emerald-500/10 text-emerald-400",
      scheduled: "bg-cyan-500/10 text-cyan-400",
      draft: "bg-amber-500/10 text-amber-400",
      in_review: "bg-purple-500/10 text-purple-400",
      archived: "bg-slate-500/10 text-slate-400",
    };
    return <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize", styles[status])}>{status.replace("_", " ")}</span>;
  };

  return (
    <Card>
      <CardHeader title="Recent Content" description={`Latest ${displayed.length} content items`} action={<Link href="/dashboard/content/library" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">View all <ChevronRight size={14} /></Link>} />
      <CardContent>
        <div className="space-y-2">
          {displayed.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800/30 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700/50 text-xs font-bold text-cyan-400 flex-shrink-0">{item.authorAvatar}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-500">{item.author}</span>
                  <span className="text-[10px] text-slate-600">•</span>
                  <span className="text-[10px] text-slate-500">{item.platform}</span>
                  <span className="text-[10px] text-slate-600">•</span>
                  <span className="text-[10px] text-slate-500">Score: {item.contentScore}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {statusBadge(item.status)}
                <span className="text-[10px] text-slate-500 flex items-center gap-1"><Eye size={10} /> {item.reach ? (item.reach / 1000).toFixed(0) + "K" : "—"}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Publishing Queue
// ============================================================================
interface PublishingQueueProps { posts: ScheduledPost[]; }
export function PublishingQueue({ posts }: PublishingQueueProps) {
  const statusBadge = (status: ScheduledPost["status"]) => {
    const styles: Record<string, string> = { pending: "bg-amber-500/10 text-amber-400", ready: "bg-emerald-500/10 text-emerald-400", failed: "bg-red-500/10 text-red-400" };
    return <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize", styles[status])}>{status}</span>;
  };
  const readyCount = posts.filter(p => p.status === "ready").length;

  return (
    <Card>
      <CardHeader title="Publishing Queue" description={`${readyCount} posts ready to publish`} action={<Link href="/dashboard/content/calendar" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">Calendar <ChevronRight size={14} /></Link>} />
      <CardContent>
        <div className="space-y-2">
          {posts.slice(0, 5).map((post) => (
            <div key={post.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/40">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-white truncate">{post.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-500">{post.platform}</span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock size={10} /> {new Date(post.scheduledFor).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">{statusBadge(post.status)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Calendar Widget
// ============================================================================
interface CalendarWidgetProps { posts: ScheduledPost[]; }
export function CalendarWidget({ posts }: CalendarWidgetProps) {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const postDates = new Set(posts.map(p => p.scheduledFor.split("T")[0]));

  return (
    <Card>
      <CardHeader title="Content Calendar" description={today.toLocaleDateString("en-US", { month: "long", year: "numeric" })} />
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <span key={d} className="text-[10px] font-semibold text-slate-500 py-1">{d}</span>)}
          {Array.from({ length: firstDay }).map((_, i) => <span key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const hasPosts = postDates.has(dateStr);
            const isToday = day === today.getDate();
            return (
              <span key={day} className={cn("text-xs py-1.5 rounded-lg relative", isToday ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:bg-slate-800/50")}>
                {day}
                {hasPosts && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400" />}
              </span>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-500 mt-3 text-center">{posts.length} posts scheduled this month</p>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// AI Recommendation Panel
// ============================================================================
interface AIRecommendationPanelProps { sessions: AISession[]; }
export function AIRecommendationPanel({ sessions }: AIRecommendationPanelProps) {
  const recent = sessions.filter(s => s.status === "completed").slice(0, 4);
  return (
    <Card>
      <CardHeader title="AI Recommendations" description="Recent AI-powered content suggestions" action={<Link href="/dashboard/content/generator" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">Generate <ChevronRight size={14} /></Link>} />
      <CardContent>
        <div className="space-y-3">
          {recent.map((session) => (
            <div key={session.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-800/20 border border-slate-700/40">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex-shrink-0">
                <Sparkles size={14} className="text-cyan-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white">{session.title}</p>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                  <span>{session.model}</span>
                  <span>•</span>
                  <span>{session.creditsUsed} credits</span>
                </div>
              </div>
              <Lightbulb size={14} className="text-amber-400 flex-shrink-0 mt-1" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}