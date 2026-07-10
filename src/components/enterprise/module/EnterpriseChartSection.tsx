"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface EnterpriseChartSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  viewMoreHref?: string;
  viewMoreLabel?: string;
  span?: "full" | "half" | "third" | "two-thirds";
  className?: string;
  chartClassName?: string;
  animated?: boolean;
  delay?: number;
}

export function EnterpriseChartSection({
  title,
  description,
  children,
  action,
  viewMoreHref,
  viewMoreLabel = "View more",
  span = "full",
  className,
  chartClassName,
  animated = true,
  delay = 0.05,
}: EnterpriseChartSectionProps) {
  const spanClass = {
    full: "",
    half: "xl:col-span-1",
    third: "xl:col-span-1",
    "two-thirds": "xl:col-span-2",
  };

  const content = (
    <Card className={cn("h-full", className)}>
      <CardHeader
        title={title}
        description={description}
        action={
          <div className="flex items-center gap-2">
            {action}
            {viewMoreHref && (
              <a
                href={viewMoreHref}
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 whitespace-nowrap"
              >
                {viewMoreLabel}
                <ChevronRight size={14} />
              </a>
            )}
          </div>
        }
      />
      <CardContent className={chartClassName}>{children}</CardContent>
    </Card>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay }}
        className={spanClass[span]}
      >
        {content}
      </motion.div>
    );
  }

  return <div className={spanClass[span]}>{content}</div>;
}