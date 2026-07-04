"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { SkeletonText } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface KpiItem {
  id: string;
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "steady";
  comparison?: string;
  icon?: ReactNode;
  color?: string;
  description?: string;
}

interface KpiGridProps {
  items: KpiItem[];
  columns?: 2 | 3 | 4 | 5 | 6;
  loading?: boolean;
  animated?: boolean;
  className?: string;
}

function KpiCard({ item }: { item: KpiItem }) {
  const trendColor =
    item.trend === "up"
      ? "text-emerald-400"
      : item.trend === "down"
        ? "text-red-400"
        : "text-slate-400";

  const trendBg =
    item.trend === "up"
      ? "bg-emerald-500/10"
      : item.trend === "down"
        ? "bg-red-500/10"
        : "bg-slate-500/10";

  const TrendIcon =
    item.trend === "up"
      ? TrendingUp
      : item.trend === "down"
        ? TrendingDown
        : Minus;

  return (
    <Card
      padding="sm"
      gradient
      className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        {item.icon ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20">
            <span className="text-cyan-400">{item.icon}</span>
          </div>
        ) : (
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl border",
              item.color
                ? `bg-${item.color}-500/20 border-${item.color}-500/20 text-${item.color}-400`
                : "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/20 text-cyan-400"
            )}
          >
            <TrendIcon size={18} />
          </div>
        )}
        {item.trend && item.change && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-semibold rounded-full px-2 py-0.5",
              trendBg,
              trendColor
            )}
          >
            <TrendIcon size={12} />
            {item.change}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-white tracking-tight">
          {item.value}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">{item.title}</p>
      </div>
      {item.comparison && (
        <p className="mt-2 text-[10px] text-slate-500">{item.comparison}</p>
      )}
      {item.description && (
        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
          {item.description}
        </p>
      )}
    </Card>
  );
}

function KpiCardSkeleton() {
  return (
    <Card padding="sm">
      <div className="space-y-3">
        <SkeletonText className="h-9 w-9 rounded-xl" />
        <SkeletonText className="h-7 w-20" />
        <SkeletonText className="h-3 w-28" />
        <SkeletonText className="h-3 w-16" />
      </div>
    </Card>
  );
}

export function ModuleKpiGrid({
  items,
  columns = 6,
  loading = false,
  animated = true,
  className,
}: KpiGridProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "grid gap-4",
          columns <= 2
            ? "sm:grid-cols-2"
            : columns <= 3
              ? "sm:grid-cols-2 lg:grid-cols-3"
              : columns <= 4
                ? "sm:grid-cols-2 lg:grid-cols-4"
                : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
          className
        )}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const gridItems = items.map((item) => {
    const card = <KpiCard key={item.id} item={item} />;
    if (animated) {
      return (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          {card}
        </motion.div>
      );
    }
    return card;
  });

  return (
    <div
      className={cn(
        "grid gap-4",
        columns <= 2
          ? "sm:grid-cols-2"
          : columns <= 3
            ? "sm:grid-cols-2 lg:grid-cols-3"
            : columns <= 4
              ? "sm:grid-cols-2 lg:grid-cols-4"
              : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
        className
      )}
    >
      {gridItems}
    </div>
  );
}