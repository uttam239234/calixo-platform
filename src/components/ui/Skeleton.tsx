import { ReactNode } from "react";

interface SkeletonProps {
  className?: string;
  children?: ReactNode;
}

export function Skeleton({ className = "", children }: SkeletonProps) {
  return (
    <div className={`skeleton ${className}`} role="status" aria-label="Loading content">
      {children}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function SkeletonText({ className = "" }: { className?: string }) {
  return <Skeleton className={`h-4 w-full rounded-lg ${className}`} />;
}

export function SkeletonTitle({ className = "" }: { className?: string }) {
  return <Skeleton className={`h-6 w-3/4 rounded-lg ${className}`} />;
}

export function SkeletonAvatar({ className = "" }: { className?: string }) {
  return <Skeleton className={`h-10 w-10 rounded-full ${className}`} />;
}

export function SkeletonButton({ className = "" }: { className?: string }) {
  return <Skeleton className={`h-10 w-24 rounded-xl ${className}`} />;
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-border/60 bg-card p-6 ${className}`}>
      <div className="space-y-4">
        <SkeletonTitle />
        <SkeletonText className="h-3 w-1/2" />
        <div className="pt-2 space-y-2">
          <SkeletonText className="h-10" />
          <SkeletonText className="h-8 w-2/3" />
        </div>
      </div>
    </div>
  );
}