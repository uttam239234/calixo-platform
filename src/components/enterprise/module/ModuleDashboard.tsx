"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardSection {
  id: string;
  content: ReactNode;
  span?: "full" | "half" | "third" | "two-thirds";
  className?: string;
}

interface ModuleDashboardProps {
  sections: DashboardSection[];
  layout?: "grid" | "stacked";
  columns?: 1 | 2 | 3;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function ModuleDashboard({
  sections,
  layout = "grid",
  columns = 3,
  gap = "lg",
  className,
}: ModuleDashboardProps) {
  const gapClass = {
    sm: "gap-4",
    md: "gap-5",
    lg: "gap-6",
  };

  if (layout === "stacked") {
    return (
      <div className={cn("space-y-6", className)}>
        {sections.map((section) => (
          <div key={section.id} className={section.className}>
            {section.content}
          </div>
        ))}
      </div>
    );
  }

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 xl:grid-cols-3",
  };

  return (
    <div className={cn("pb-8", className)}>
      <div className={cn("grid", gridCols[columns], gapClass[gap])}>
        {sections.map((section) => {
          const spanClass =
            section.span === "full"
              ? "xl:col-span-3"
              : section.span === "two-thirds"
                ? "xl:col-span-2"
                : section.span === "half"
                  ? columns === 3
                    ? "xl:col-span-1"
                    : "md:col-span-1"
                  : "";

          return (
            <div
              key={section.id}
              className={cn(spanClass, section.className)}
            >
              {section.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}