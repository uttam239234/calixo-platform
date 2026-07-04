"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: "card" | "table" | "detail" | "dashboard";
  rows?: number;
  columns?: number;
  className?: string;
}

export function ModuleLoadingSkeleton({
  variant = "card",
  rows = 3,
  columns = 3,
  className,
}: LoadingSkeletonProps) {
  if (variant === "table") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-10 w-full max-w-xs rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 space-y-3">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4 pt-3 border-t border-slate-800/40">
              {Array.from({ length: columns }).map((_, j) => (
                <Skeleton key={j} className="h-4 flex-1" />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-64 rounded-lg" />
        </div>
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: rows * 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "dashboard") {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-xl border border-slate-800/60 bg-slate-900/40 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6 space-y-4">
            <Skeleton className="h-5 w-40" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-2 flex-1 rounded-full" />
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default: card grid
  return (
    <div
      className={cn(
        "grid gap-4",
        columns <= 2
          ? "sm:grid-cols-2"
          : columns <= 3
            ? "sm:grid-cols-2 lg:grid-cols-3"
            : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {Array.from({ length: rows * columns }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5 space-y-3"
        >
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}