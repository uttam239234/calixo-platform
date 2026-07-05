"use client";

import { SkeletonCard } from "@/components/ui/Skeleton";

interface UsersLoadingStateProps {
  count?: number;
}

export function UsersLoadingState({ count = 6 }: UsersLoadingStateProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
