"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { BellOff, ChevronRight, X, CheckCheck } from "lucide-react";

export interface Notification {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  read: boolean;
  type?: "info" | "warning" | "success" | "error";
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationPanelProps {
  notifications: Notification[];
  title?: string;
  loading?: boolean;
  onMarkAllRead?: () => void;
  onViewAll?: () => void;
  onDismiss?: (id: string) => void;
  maxItems?: number;
  className?: string;
}

const typeStyles: Record<string, { border: string; dot: string }> = {
  info: { border: "border-l-cyan-500/50", dot: "bg-cyan-400" },
  warning: { border: "border-l-amber-500/50", dot: "bg-amber-400" },
  success: { border: "border-l-emerald-500/50", dot: "bg-emerald-400" },
  error: { border: "border-l-red-500/50", dot: "bg-red-400" },
};

export function NotificationPanel({
  notifications,
  title = "Notifications",
  loading = false,
  onMarkAllRead,
  onViewAll,
  onDismiss,
  maxItems = 5,
  className,
}: NotificationPanelProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayNotifications = notifications.slice(0, maxItems);

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
          description={
            unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up!"
          }
          action={
            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && onMarkAllRead && (
                <button
                  onClick={onMarkAllRead}
                  className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-800/50 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck size={12} />
                  Mark all read
                </button>
              )}
              {onViewAll && (
                <button
                  onClick={onViewAll}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  View all
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          }
        />
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-slate-700/50 bg-slate-800/20 p-3"
                >
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-40 rounded bg-slate-700/50 animate-pulse" />
                    <div className="h-3 w-3/4 rounded bg-slate-700/50 animate-pulse" />
                    <div className="h-2.5 w-24 rounded bg-slate-700/50 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayNotifications.length === 0 ? (
            <div className="text-center py-8">
              <BellOff size={24} className="text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No notifications</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {displayNotifications.map((notification) => {
                const styles = typeStyles[notification.type ?? "info"];
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "relative rounded-lg border-l-[3px] bg-slate-800/20 border border-slate-700/40 p-3 transition-all",
                      styles.border,
                      !notification.read && "bg-slate-800/40"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={cn(
                          "mt-1.5 h-2 w-2 rounded-full flex-shrink-0",
                          styles.dot
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">
                            {notification.title}
                          </span>
                          {!notification.read && (
                            <span className="text-[9px] font-semibold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded-full">
                              NEW
                            </span>
                          )}
                        </div>
                        {notification.description && (
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            {notification.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-500">
                            {notification.timestamp}
                          </span>
                          {notification.action && (
                            <button
                              onClick={notification.action.onClick}
                              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-medium"
                            >
                              {notification.action.label}
                            </button>
                          )}
                        </div>
                      </div>
                      {onDismiss && (
                        <button
                          onClick={() => onDismiss(notification.id)}
                          className="p-1 rounded-lg hover:bg-slate-700/50 text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}