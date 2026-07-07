"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Megaphone, PenSquare, FileText, BarChart3, Zap, Bot, ArrowRight } from "lucide-react";
import Link from "next/link";

interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
}

const QUICK_ACTIONS: QuickActionItem[] = [
  { id: "create-campaign", title: "Create Campaign", description: "Launch a new AI-powered campaign", icon: "megaphone", href: "/dashboard/ads/campaigns/new" },
  { id: "compose-post", title: "Compose Post", description: "Create and schedule a post", icon: "pen-square", href: "/dashboard/social/compose" },
  { id: "generate-report", title: "Generate Report", description: "Export executive summary", icon: "file-text", href: "/dashboard/reports" },
  { id: "open-analytics", title: "View Analytics", description: "Deep dive into metrics", icon: "bar-chart", href: "/dashboard/analytics" },
  { id: "launch-workflow", title: "Launch Workflow", description: "Trigger an automation", icon: "zap", href: "/dashboard/workflows" },
  { id: "ask-ai", title: "Ask AI Copilot", description: "Get AI-powered insights", icon: "bot", href: "/dashboard/ai" },
];

const actionIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  megaphone: Megaphone,
  "pen-square": PenSquare,
  "file-text": FileText,
  "bar-chart": BarChart3,
  zap: Zap,
  bot: Bot,
};

export default function QuickActions() {
  return (
    <Card>
      <CardHeader
        title="Quick Actions"
        description="Common tasks at your fingertips"
        action={
          <Link
            href="/dashboard/analytics"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View All <ArrowRight size={12} />
          </Link>
        }
      />
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_ACTIONS.map((action) => {
            const Icon = actionIcons[action.icon] ?? Zap;
            return (
              <Link
                key={action.id}
                href={action.href}
                className="flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-4 text-center transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-1 group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-ai/10 text-primary group-hover:from-primary/20 group-hover:to-ai/20 transition-all duration-200">
                  <Icon size={22} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">{action.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}