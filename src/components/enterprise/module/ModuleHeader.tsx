"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface ModuleHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  organization?: string;
  workspace?: string;
  lastUpdated?: string;
  quickActions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function ModuleHeader({
  title,
  description,
  icon,
  breadcrumbs,
  organization,
  workspace,
  lastUpdated,
  quickActions,
  children,
  className,
}: ModuleHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn("mb-6", className)}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 mb-2 text-xs text-slate-500">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-slate-600">/</span>}
              {crumb.href || crumb.onClick ? (
                <button
                  onClick={() => {
                    if (crumb.onClick) crumb.onClick();
                    else if (crumb.href) window.location.href = crumb.href;
                  }}
                  className="hover:text-slate-300 transition-colors"
                >
                  {crumb.label}
                </button>
              ) : (
                <span>{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {/* Subtitle badge */}
          {workspace && (
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" />
              {workspace}
            </div>
          )}

          {/* Title row */}
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl truncate">
                {title}
              </h1>
              {description && (
                <p className="mt-1 text-sm text-slate-400">{description}</p>
              )}
            </div>
          </div>

          {/* Metadata row */}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            {organization && (
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-600" />
                {organization}
              </span>
            )}
            {lastUpdated && (
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-600" />
                Updated: {lastUpdated}
              </span>
            )}
          </div>
        </div>

        {/* Quick actions */}
        {quickActions && (
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            {quickActions}
          </div>
        )}

        {/* Extended children area */}
        {children && (
          <div className="flex-shrink-0">{children}</div>
        )}
      </div>
    </motion.div>
  );
}