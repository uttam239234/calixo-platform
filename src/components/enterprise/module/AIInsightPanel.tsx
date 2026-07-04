"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles, ChevronRight, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

export interface AIInsight {
  id: string;
  type: "insight" | "alert" | "recommendation" | "trend";
  title: string;
  content: string;
  confidence?: number;
  priority?: "high" | "medium" | "low";
  timestamp?: string;
}

interface AIInsightPanelProps {
  insights: AIInsight[];
  title?: string;
  description?: string;
  loading?: boolean;
  onViewAll?: () => void;
  onInsightClick?: (insight: AIInsight) => void;
  className?: string;
}

const typeConfig: Record<
  string,
  { icon: ReactNode; color: string; bg: string; border: string }
> = {
  insight: {
    icon: <Lightbulb size={16} />,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  alert: {
    icon: <AlertTriangle size={16} />,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  recommendation: {
    icon: <Sparkles size={16} />,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  trend: {
    icon: <TrendingUp size={16} />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
};

function InsightCard({
  insight,
  onClick,
}: {
  insight: AIInsight;
  onClick?: (insight: AIInsight) => void;
}) {
  const config = typeConfig[insight.type] ?? typeConfig.insight;

  return (
    <div
      className={cn(
        "rounded-xl border p-3.5 transition-all cursor-pointer",
        config.border,
        "bg-slate-800/30 hover:bg-slate-800/50",
        "hover:border-slate-600/60"
      )}
      onClick={() => onClick?.(insight)}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0 mt-0.5",
            config.bg,
            config.color
          )}
        >
          {config.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-white">
              {insight.title}
            </span>
            {insight.priority && (
              <span
                className={cn(
                  "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                  insight.priority === "high"
                    ? "bg-red-500/10 text-red-400"
                    : insight.priority === "medium"
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-slate-500/10 text-slate-400"
                )}
              >
                {insight.priority}
              </span>
            )}
            {insight.confidence !== undefined && (
              <span className="text-[10px] text-slate-500">
                {insight.confidence}% confidence
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3">
            {insight.content}
          </p>
          {insight.timestamp && (
            <p className="text-[10px] text-slate-500 mt-1.5">
              {insight.timestamp}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function AIInsightPanel({
  insights,
  title = "AI Insights",
  description = "AI-powered analysis and recommendations",
  loading = false,
  onViewAll,
  onInsightClick,
  className,
}: AIInsightPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={className}
    >
      <Card gradient>
        <CardHeader
          title={title}
          description={description}
          action={
            onViewAll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewAll}
                className="text-xs text-cyan-400 hover:text-cyan-300 h-8"
              >
                View all
                <ChevronRight size={14} />
              </Button>
            )
          }
        />
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-3.5"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-slate-700/50 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-36 rounded bg-slate-700/50 animate-pulse" />
                      <div className="h-3 w-full rounded bg-slate-700/50 animate-pulse" />
                      <div className="h-3 w-3/4 rounded bg-slate-700/50 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : insights.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">
              No insights available
            </p>
          ) : (
            <div className="space-y-2.5">
              {insights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onClick={onInsightClick}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}