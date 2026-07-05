"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/shared/utils/date";
import { useNotifications } from "@/hooks/useNotifications";

const CATEGORY_DOT: Record<string, string> = {
  error: "bg-destructive",
  critical: "bg-destructive",
  warning: "bg-warning",
  success: "bg-success",
  system: "bg-warning",
  security: "bg-destructive",
  ai: "bg-ai",
  info: "bg-primary",
  marketing: "bg-primary",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();
  const router = useRouter();

  const handleSelect = async (id: string, actionUrl?: string) => {
    await markRead(id);
    setOpen(false);
    if (actionUrl) router.push(actionUrl);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-2xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-150"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Close notifications" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-[360px] rounded-2xl border border-border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Notifications</p>
                <p className="text-xs text-muted-foreground">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}</p>
              </div>
              {unreadCount > 0 && (
                <button type="button" onClick={() => markAllRead()} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
            </div>

            <div className="scrollbar-thin max-h-96 overflow-y-auto p-2">
              {loading ? (
                <div className="space-y-2 p-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-14 animate-pulse rounded-xl bg-accent/40" />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <BellOff size={22} className="text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleSelect(n.id, n.actionUrl)}
                    className={cn("flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent", !n.read && "bg-accent/40")}
                  >
                    <span className={cn("mt-1.5 h-2 w-2 flex-shrink-0 rounded-full", CATEGORY_DOT[n.category] ?? "bg-primary")} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-semibold text-foreground">{n.title}</span>
                        {!n.read && <span className="badge badge-primary flex-shrink-0 px-1.5 py-0 text-[9px]">NEW</span>}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">{n.description}</span>
                      <span className="mt-0.5 block text-[10px] text-muted-foreground">{formatRelativeTime(n.timestamp)}</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
