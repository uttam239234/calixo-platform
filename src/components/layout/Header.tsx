"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { Search, Moon, Sun, ChevronDown, Plus, CalendarDays, Menu, LogOut } from "lucide-react";
import { useTheme } from "@/features/theme/ThemeContext";
import { NotificationBell } from "./NotificationBell";
import { GlobalWorkspaceSwitcher } from "./GlobalWorkspaceSwitcher";

interface HeaderProps {
  onOpenMobileNav?: () => void;
}

export default function Header({ onOpenMobileNav }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    return {
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
      href,
      isLast: index === pathSegments.length - 1,
    };
  });

  const displayName = user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress || "Account";
  const displayEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const initials = (user?.firstName?.[0] ?? displayName.charAt(0) ?? "U").toUpperCase();

  return (
    <header className="flex h-[64px] items-center justify-between border-b border-header-border bg-header-bg backdrop-blur-xl px-5 sticky top-0 z-50 shadow-header">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-2xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-150"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="hidden md:flex items-center" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2">
              <li>
                <a href="/dashboard" className="text-muted-foreground/70 hover:text-foreground transition-colors duration-150 text-[13px] font-medium">
                  Home
                </a>
              </li>
              {breadcrumbs.map((crumb) => (
                <li key={crumb.href} className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                  {crumb.isLast ? (
                    <span className="font-semibold text-foreground text-[13px]">{crumb.label}</span>
                  ) : (
                    <a href={crumb.href} className="text-muted-foreground/70 hover:text-foreground transition-colors duration-150 text-[13px] font-medium capitalize">
                      {crumb.label}
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Page Title (Mobile) */}
        {breadcrumbs.length > 0 && (
          <h1 className="md:hidden text-lg font-semibold text-foreground">
            {breadcrumbs[breadcrumbs.length - 1]?.label}
          </h1>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1">
        {/* Global Search */}
        <button
          type="button"
          disabled
          title="Coming soon"
          className="relative flex items-center gap-2 h-9 px-3.5 rounded-2xl border border-header-border bg-card/50 text-[13px] font-medium text-muted-foreground transition-all duration-150 min-w-[180px] disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Search (coming soon)"
        >
          <Search size={15} className="text-muted-foreground/70 flex-shrink-0" />
          <span className="flex-1 text-left text-muted-foreground/60">Search...</span>
          <span className="hidden sm:inline-flex items-center rounded-lg border border-border bg-background/50 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground/60 shadow-sm">
            Soon
          </span>
        </button>

        {/* Date Range */}
        <button
          type="button"
          disabled
          title="Coming soon"
          className="hidden lg:flex items-center gap-2 h-9 px-3 rounded-2xl border border-header-border text-[13px] font-medium text-muted-foreground transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Date range (coming soon)"
        >
          <CalendarDays size={15} className="text-muted-foreground/70" />
          <span>Last 30 days</span>
          <ChevronDown size={13} className="text-muted-foreground/50" />
        </button>

        {/* Organization & Workspace Switcher */}
        <GlobalWorkspaceSwitcher />

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-2xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-150"
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* Quick Create */}
        <button
          type="button"
          onClick={() => router.push("/dashboard/ads/campaigns/new")}
          className="hidden sm:flex items-center gap-1.5 h-9 px-3.5 rounded-2xl bg-primary text-white text-[13px] font-semibold shadow-sm hover:shadow-md hover:shadow-primary/20 transition-all duration-150 active:scale-95"
          aria-label="Quick create"
        >
          <Plus size={15} />
          <span className="hidden lg:inline">New Campaign</span>
        </button>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-2xl px-2.5 py-1.5 text-sm font-medium text-foreground hover:bg-accent transition-all duration-150"
            aria-label="User menu"
            aria-expanded={profileOpen}
          >
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-ai text-xs font-bold text-white">
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success ring-2 ring-card" />
              </span>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-[13px] font-semibold text-foreground">{displayName}</p>
              <p className="text-[11px] text-muted-foreground truncate max-w-[140px]">{displayEmail}</p>
            </div>
            <ChevronDown size={13} className="hidden lg:block text-muted-foreground/50" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full z-50 mt-1.5 w-56 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
              <div className="border-b border-border p-3">
                <p className="text-[13px] font-semibold text-foreground truncate">{displayName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{displayEmail}</p>
              </div>
              <div className="p-1.5">
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm text-foreground hover:bg-accent"
                >
                  <LogOut size={14} className="text-muted-foreground" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
