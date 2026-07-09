"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, LayoutDashboard, Compass, LayoutGrid, Target, Bell } from "lucide-react";
import type { DashboardLayout, DashboardWidgetCatalogEntry, DashboardWidgetKey, DashboardNotificationEntry } from "@/core/dashboard";
import type { GoalScorecardEntry } from "@/core/platform/goals";

interface CommandItem {
  id: string;
  label: string;
  hint: string;
  group: "Navigate" | "Dashboards" | "Widgets" | "Goals" | "Notifications";
  action: () => void;
}

const GROUP_ICON: Record<CommandItem["group"], typeof Compass> = {
  Navigate: Compass,
  Dashboards: LayoutDashboard,
  Widgets: LayoutGrid,
  Goals: Target,
  Notifications: Bell,
};

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  layouts: DashboardLayout[];
  onSwitchLayout: (id: string) => void;
  widgets?: DashboardWidgetCatalogEntry[];
  onSelectWidget?: (key: DashboardWidgetKey) => void;
  goals?: GoalScorecardEntry[];
  onSelectGoal?: () => void;
  notifications?: DashboardNotificationEntry[];
  onSelectNotification?: (notification: DashboardNotificationEntry) => void;
}

const ROUTES: { label: string; hint: string; href: string }[] = [
  { label: "Analytics", hint: "View performance analytics", href: "/dashboard/analytics" },
  { label: "Reports", hint: "Browse and export reports", href: "/dashboard/reports" },
  { label: "Workflows", hint: "Review approvals", href: "/dashboard/workflows" },
  { label: "AI Copilot", hint: "Chat with AI Copilot", href: "/dashboard/ai" },
  { label: "Ads Campaigns", hint: "Manage ad campaigns", href: "/dashboard/ads/campaigns" },
  { label: "Social", hint: "Social media hub", href: "/dashboard/social" },
  { label: "Content", hint: "Content studio", href: "/dashboard/content" },
  { label: "Brand", hint: "Brand monitoring", href: "/dashboard/brand" },
  { label: "Settings", hint: "Platform settings", href: "/dashboard/settings" },
];

export default function CommandPalette({
  open,
  onClose,
  layouts,
  onSwitchLayout,
  widgets = [],
  onSelectWidget,
  goals = [],
  onSelectGoal,
  notifications = [],
  onSelectNotification,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    (async () => {
      if (!open) setQuery("");
    })();
  }, [open]);

  const items = useMemo<CommandItem[]>(() => {
    const navItems: CommandItem[] = ROUTES.map(r => ({ id: `route-${r.href}`, label: r.label, hint: r.hint, group: "Navigate", action: () => router.push(r.href) }));
    const layoutItems: CommandItem[] = layouts.map(l => ({ id: `layout-${l.id}`, label: l.name, hint: l.description, group: "Dashboards", action: () => onSwitchLayout(l.id) }));
    const widgetItems: CommandItem[] = onSelectWidget
      ? widgets.map(w => ({ id: `widget-${w.key}`, label: w.label, hint: w.description, group: "Widgets", action: () => onSelectWidget(w.key) }))
      : [];
    const goalItems: CommandItem[] = onSelectGoal
      ? goals.map(g => ({ id: `goal-${g.id}`, label: g.title, hint: `${Math.round(g.progress * 100)}% of target`, group: "Goals", action: onSelectGoal }))
      : [];
    const notificationItems: CommandItem[] = onSelectNotification
      ? notifications.map(n => ({ id: `notification-${n.id}`, label: n.title, hint: n.description, group: "Notifications", action: () => onSelectNotification(n) }))
      : [];
    const all = [...layoutItems, ...widgetItems, ...goalItems, ...notificationItems, ...navItems];
    const q = query.trim().toLowerCase();
    return q ? all.filter(i => i.label.toLowerCase().includes(q) || i.hint.toLowerCase().includes(q)) : all;
  }, [query, layouts, router, onSwitchLayout, widgets, onSelectWidget, goals, onSelectGoal, notifications, onSelectNotification]);

  useEffect(() => {
    (async () => {
      setActiveIndex(0);
    })();
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, items.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
      }
      if (e.key === "Enter") {
        const item = items[activeIndex];
        if (item) {
          item.action();
          onClose();
        }
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open, items, activeIndex, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[12vh]" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search size={16} className="text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search dashboards, modules…"
            className="w-full bg-transparent text-sm outline-none"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">Esc</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {items.length === 0 && <p className="px-3 py-6 text-center text-sm text-muted-foreground">No matches</p>}
          {items.map((item, index) => {
            const GroupIcon = GROUP_ICON[item.group];
            return (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  onClose();
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${index === activeIndex ? "bg-primary/10 text-foreground" : "text-foreground hover:bg-accent/60"}`}
              >
                <GroupIcon size={15} className={item.group === "Navigate" ? "text-muted-foreground" : "text-primary"} />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{item.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{item.hint}</span>
                </span>
                <ArrowRight size={13} className="text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
