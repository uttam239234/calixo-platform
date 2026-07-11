"use client";

import { Bot, Sliders, Wand2, PenTool, FolderOpen, CalendarClock } from "lucide-react";
import { ModuleTabs, type ModuleTab } from "@/components/enterprise/module";
import { useReportsContext } from "@/features/reports/ReportsProvider";

const navItems: ModuleTab[] = [
  { id: "builder", label: "Report Builder", href: "/dashboard/reports/builder", icon: PenTool },
  { id: "assistant", label: "AI Report Assistant", href: "/dashboard/reports", icon: Bot },
  { id: "library", label: "Report Library", href: "/dashboard/reports/library", icon: FolderOpen },
  { id: "scheduled", label: "Scheduled Reports", href: "/dashboard/reports/scheduled", icon: CalendarClock },
];

/** Exactly 4 top-level sections, per the rebuild brief — nothing else. */
export function ReportsSubNav() {
  const { mode, toggleMode } = useReportsContext();

  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <ModuleTabs tabs={navItems} baseUrl="/dashboard/reports" />
      </div>
      <button
        onClick={toggleMode}
        className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-border bg-surface/70 px-4 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
      >
        {mode === "beginner" ? <Sliders size={15} /> : <Wand2 size={15} />}
        <span className="hidden sm:inline">{mode === "beginner" ? "Advanced Mode" : "Back to Beginner Mode"}</span>
      </button>
    </div>
  );
}
