"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, UserCog, ShieldCheck, Boxes, Link2, CreditCard, ScrollText, Webhook } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShellItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  comingSoon?: boolean;
}

const SHELL_ITEMS: ShellItem[] = [
  { id: "organization", label: "Organization", href: "/dashboard/settings", icon: Building2 },
  { id: "users", label: "Users & Teams", href: "/dashboard/settings/users", icon: UserCog },
  { id: "roles", label: "Roles & Permissions", href: "/dashboard/settings/roles", icon: ShieldCheck },
  { id: "workspaces", label: "Workspaces", href: "/dashboard/settings/workspaces", icon: Boxes, comingSoon: true },
  { id: "integrations", label: "Integrations", href: "/dashboard/settings/integrations", icon: Link2, comingSoon: true },
  { id: "billing", label: "Billing & Plans", href: "/dashboard/settings/billing", icon: CreditCard, comingSoon: true },
  { id: "audit", label: "Audit Logs", href: "/dashboard/settings/audit", icon: ScrollText, comingSoon: true },
  { id: "api", label: "API & Webhooks", href: "/dashboard/settings/api", icon: Webhook, comingSoon: true },
];

function isItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard/settings") return pathname === "/dashboard/settings";
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * The permanent administration shell — everything Track 3 used to expose as
 * separate top-level modules now lives here. Organization, Users & Teams, and
 * Roles & Permissions are real; the rest render as disabled "Coming Soon"
 * entries (never redesigned later, just switched on when their phase starts).
 */
export function SettingsAdminSidebar() {
  const pathname = usePathname();
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const direction = event.key === "ArrowDown" ? 1 : -1;
    const next = (index + direction + SHELL_ITEMS.length) % SHELL_ITEMS.length;
    itemRefs.current[next]?.focus();
  };

  return (
    <nav aria-label="Settings" className="md:w-60 md:flex-shrink-0">
      <div className="mb-4 hidden items-center gap-2 px-1 md:flex">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Settings</span>
      </div>
      <div className="flex gap-1 overflow-x-auto scrollbar-thin pb-2 md:flex-col md:overflow-visible md:pb-0">
        {SHELL_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const active = isItemActive(pathname ?? "", item.href);
          return (
            <Link
              key={item.id}
              ref={el => {
                itemRefs.current[index] = el;
              }}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onKeyDown={e => handleKeyDown(e, index)}
              className={cn(
                "group flex flex-shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-colors md:flex-shrink",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon size={17} className={cn("flex-shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              <span className="flex-1">{item.label}</span>
              {item.comingSoon && (
                <span className="hidden flex-shrink-0 rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground md:inline-block">Coming Soon</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
