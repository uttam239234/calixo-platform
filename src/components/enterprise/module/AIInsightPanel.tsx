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
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  alert: {
    icon: <AlertTriangle size={16} />,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
  },
  recommendation: {
    icon: <Sparkles size={16} />,
    color: "text-ai",
    bg: "bg-ai/10",
    border: "border-ai/20",
  },
  trend: {
    icon: <TrendingUp size={16} />,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
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
        "bg-surface/30 hover:bg-surface/50",
        "hover:border-border"
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
            <span className="text-xs font-semibold text-foreground">
              {insight.title}
            </span>
            {insight.priority && (
              <span
                className={cn(
                  "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                  insight.priority === "high"
                    ? "bg-destructive/10 text-destructive"
                    : insight.priority === "medium"
                      ? "bg-warning/10 text-warning"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {insight.priority}
              </span>
            )}
            {insight.confidence !== undefined && (
              <span className="text-[10px] text-muted-foreground">
                {insight.confidence}% confidence
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-3">
            {insight.content}
          </p>
          {insight.timestamp && (
            <p className="text-[10px] text-muted-foreground mt-1.5">
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
                className="text-xs text-primary hover:text-primary/80 h-8"
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
                  className="rounded-xl border border-border bg-surface/20 p-3.5"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-surface animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-36 rounded bg-surface animate-pulse" />
                      <div className="h-3 w-full rounded bg-surface animate-pulse" />
                      <div className="h-3 w-3/4 rounded bg-surface animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : insights.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
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