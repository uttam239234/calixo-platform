"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface ModuleTab {
  id: string;
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: React.ReactNode;
  disabled?: boolean;
}

interface ModuleTabsProps {
  tabs: ModuleTab[];
  baseUrl?: string;
  className?: string;
  variant?: "pill" | "underline";
}

export function ModuleTabs({
  tabs,
  baseUrl,
  variant = "pill",
  className,
}: ModuleTabsProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (baseUrl && href === baseUrl) return pathname === baseUrl;
    if (href === "/") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  if (variant === "underline") {
    return (
      <div className={cn("overflow-x-auto scrollbar-thin", className)}>
        <nav className="flex gap-0 min-w-max border-b border-slate-800/60">
          {tabs.map((tab) => {
            const active = isActive(tab.href);
            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && router.push(tab.href)}
                disabled={tab.disabled}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  "border-b-[3px] -mb-[2px]",
                  active
                    ? "border-cyan-400 text-cyan-300"
                    : "border-transparent text-slate-400 hover:text-slate-200",
                  tab.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {tab.icon && (
                  <tab.icon
                    size={16}
                    className={active ? "text-cyan-400" : ""}
                  />
                )}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-1">{tab.badge}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto scrollbar-thin", className)}>
      <nav className="flex gap-1 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-1.5 backdrop-blur-sm min-w-max">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && router.push(tab.href)}
              disabled={tab.disabled}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 shadow-sm shadow-cyan-500/10 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent",
                tab.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {tab.icon && (
                <tab.icon
                  size={16}
                  className={active ? "text-cyan-400" : ""}
                />
              )}
              <span className="whitespace-nowrap">{tab.label}</span>
              {tab.badge && (
                <span className="ml-1">{tab.badge}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}