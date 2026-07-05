"use client";

import { SkeletonCard } from "@/components/ui/Skeleton";

interface SettingsLoadingStateProps {
  count?: number;
}

export function SettingsLoadingState({ count = 4 }: SettingsLoadingStateProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
