"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "@/core/modules/bootstrap";
import { ModuleNavigation } from "@/core/modules";
import type { ModuleNavSection, ModuleNavItem } from "@/core/modules";
import { ChevronLeft, ChevronRight, Zap, HardDrive, CreditCard, KeyRound, Landmark, ScrollText, Boxes, HeartPulse, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInternalRole } from "@/features/platform-admin/internalRole";

/**
 * Staff-only quick links — never registered through the generic
 * `ModuleNavigation` module system (that registry has no per-role
 * visibility concept, and is meant for regular feature modules every
 * customer can see). Rendered directly here, gated on `hasPlatformAdminAccess`
 * (PLATFORM_OWNER or PLATFORM_ADMIN) so a Platform Admin — not just the
 * bootstrap Owner — also gets a real entry point instead of needing to know
 * the raw URL, consistent with Route Protection granting both roles access.
 */
const PLATFORM_NAV_ITEMS = [
  { href: "/platform-admin/secrets", label: "Platform Secrets", icon: KeyRound },
  { href: "/platform-admin", label: "Commercial Console", icon: Landmark },
  { href: "/dashboard/settings/audit", label: "Global Audit Logs", icon: ScrollText },
  { href: "/platform-admin/plans", label: "Internal Plans", icon: Boxes },
  { href: "/platform-admin/health", label: "Platform Health", icon: HeartPulse },
  { href: "/platform-admin/ai-health", label: "AI Health", icon: BrainCircuit },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { hasPlatformAdminAccess } = useInternalRole();

  // TEMPORARY DEBUG INSTRUMENTATION — production Platform Owner detection investigation.
  if (typeof window !== "undefined") {
    console.log("[PlatformOwnerTrace] step7 sidebar visibility condition", { hasPlatformAdminAccess });
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname?.startsWith(href + "/") || pathname === href;
  };

  return (
    <aside
      className="flex h-full flex-col bg-sidebar border-r border-sidebar-border shadow-sidebar transition-all duration-300 ease-in-out"
      style={{ width: collapsed ? "var(--sidebar-width-collapsed)" : "var(--sidebar-width)" }}
      aria-label="Main navigation sidebar"
    >
      {/* Logo */}
      <div className="flex-shrink-0 px-4 pt-5 pb-3">
        <Link href="/dashboard" className="block" aria-label="Calixo Dashboard Home">
          <div className="flex items-center gap-3 rounded-2xl bg-sidebar-accent/50 border border-sidebar-border p-2.5 transition-all hover:border-primary/30">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-ai shadow-sm shadow-primary/20">
              <Zap size={20} className="text-white" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="flex flex-col overflow-hidden"
                >
                  <h1 className="text-[15px] font-bold tracking-tight text-sidebar-foreground">Calixo</h1>
                  <p className="text-[11px] font-medium text-sidebar-muted">AI Marketing OS</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Link>

        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="mt-2.5 flex h-7 w-full items-center justify-center rounded-xl border border-sidebar-border bg-sidebar-accent/30 text-sidebar-muted transition-all hover:border-primary/30 hover:bg-primary-light hover:text-primary"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3 scrollbar-none" aria-label="Main navigation">
        {ModuleNavigation.getSidebarNavigation().map((section: ModuleNavSection) => (
          <div key={section.title} className="mb-5">
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-1.5 text-[10px] font-semibold tracking-[0.1em] uppercase text-sidebar-muted"
                >
                  {section.title}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {section.items.map((item: ModuleNavItem) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    title={item.title}
                    className={`group relative flex items-center rounded-xl text-sm font-medium transition-all duration-150 ease-in-out ${
                      collapsed ? "justify-center px-0 py-3 mx-auto w-11" : "gap-3 px-3 py-2.5"
                    } ${
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {active && !collapsed && (
                      <motion.span
                        layoutId="activeNavIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-primary"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    {Icon && (
                      <Icon
                        size={collapsed ? 20 : 18}
                        className={`flex-shrink-0 transition-all duration-150 ${
                          active ? "text-primary" : "text-sidebar-muted group-hover:text-primary"
                        }`}
                      />
                    )}
                    {active && collapsed && (
                      <span className="absolute -right-1 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-sidebar" />
                    )}
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex-1 truncate"
                        >
                          {item.title}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {!collapsed && item.badge && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[9px] font-bold tracking-wider">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {hasPlatformAdminAccess && (
          <div className="mb-5">
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-1.5 text-[10px] font-semibold tracking-[0.1em] uppercase text-sidebar-muted"
                >
                  Platform
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {PLATFORM_NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={`group relative flex items-center rounded-xl text-sm font-medium transition-all duration-150 ease-in-out ${
                      collapsed ? "justify-center px-0 py-3 mx-auto w-11" : "gap-3 px-3 py-2.5"
                    } ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {active && !collapsed && (
                      <motion.span
                        layoutId="activeNavIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-primary"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    <Icon size={collapsed ? 20 : 18} className={`flex-shrink-0 transition-all duration-150 ${active ? "text-primary" : "text-sidebar-muted group-hover:text-primary"}`} />
                    {active && collapsed && <span className="absolute -right-1 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-sidebar" />}
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex-1 truncate">
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Section - Workspace, Plan, Storage, Version */}
      <AnimatePresence>
        {!collapsed ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 px-3 pb-5 pt-3 border-t border-sidebar-border"
          >
            <div className="rounded-2xl bg-sidebar-accent/30 border border-sidebar-border p-3.5">
              {/* Workspace */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary-light">
                  <HardDrive size={16} className="text-primary" />
                </div>
                <div className="flex flex-col overflow-hidden min-w-0">
                  <p className="truncate text-[13px] font-semibold text-sidebar-foreground">Growth Engine</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="status-dot success"><span className="ping" /><span className="core" /></span>
                    <p className="text-[11px] text-sidebar-muted">Active Workspace</p>
                  </div>
                </div>
              </div>

              {/* Storage */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-sidebar-muted">
                  <span>Storage</span>
                  <span className="font-medium text-sidebar-foreground">6.2 / 15 GB</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-ai"
                    initial={{ width: 0 }}
                    animate={{ width: "41%" }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeInOut" }}
                  />
                </div>
              </div>

              {/* Current Plan */}
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-warning/10 border border-warning/20 px-2.5 py-1.5">
                <CreditCard size={12} className="text-warning flex-shrink-0" />
                <span className="text-[11px] font-medium text-warning">Premium Plan</span>
              </div>
            </div>

            {/* Version */}
            <div className="mt-3 px-1">
              <p className="text-[10px] text-sidebar-muted">Calixo v2.0.0</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-shrink-0 px-3 pb-5 pt-3 border-t border-sidebar-border"
          >
            <div className="flex justify-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light">
                <HardDrive size={16} className="text-primary" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}