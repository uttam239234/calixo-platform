"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Clock, ChevronRight } from "lucide-react";

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target?: string;
  timestamp: string;
  icon?: ReactNode;
  metadata?: string;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
  title?: string;
  description?: string;
  loading?: boolean;
  onViewAll?: () => void;
  maxItems?: number;
  className?: string;
}

export function ActivityTimeline({
  activities,
  title = "Recent Activity",
  description,
  loading = false,
  onViewAll,
  maxItems = 5,
  className,
}: ActivityTimelineProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={className}
    >
      <Card>
        <CardHeader
          title={title}
          description={description}
          action={
            onViewAll && (
              <button
                onClick={onViewAll}
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
              >
                View all
                <ChevronRight size={14} />
              </button>
            )
          }
        />
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-surface animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-48 rounded bg-surface animate-pulse" />
                    <div className="h-3 w-32 rounded bg-surface animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent activity
            </p>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
              <div className="space-y-4">
              {displayActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    {/* Avatar / Icon */}
                    <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border flex-shrink-0">
                      {activity.icon ? (
                        <span className="text-xs">{activity.icon}</span>
                      ) : (
                        <Clock size={14} className="text-muted-foreground" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-sm text-foreground">
                        <span className="font-medium text-foreground">
                          {activity.actor}
                        </span>{" "}
                        {activity.action}
                        {activity.target && (
                          <span className="font-medium text-primary">
                            {" "}
                            {activity.target}
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock size={10} />
                          {activity.timestamp}
                        </span>
                        {activity.metadata && (
                          <span className="text-[10px] text-muted-foreground">
                            {activity.metadata}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}