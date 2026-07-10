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
        <nav className="flex gap-0 min-w-max border-b border-border">
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
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                  tab.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {tab.icon && (
                  <tab.icon
                    size={16}
                    className={active ? "text-primary" : ""}
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
      <nav className="flex gap-1 rounded-2xl border border-border bg-surface/60 p-1.5 backdrop-blur-sm min-w-max">
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
                  ? "bg-gradient-to-r from-primary/20 to-info/20 text-primary shadow-sm shadow-primary/10 border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface/50 border border-transparent",
                tab.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {tab.icon && (
                <tab.icon
                  size={16}
                  className={active ? "text-primary" : ""}
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