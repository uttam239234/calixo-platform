"use client";

/**
 * Calixo Platform - Internal Plan Management Console
 *
 * Deliberately outside `(dashboard)` — never linked from any customer
 * sidebar/nav, not part of the Settings shell. Sits directly under the root
 * layout (`src/app/layout.tsx`), so it inherits `ThemeProvider`/fonts/globals
 * for free without needing its own copy.
 *
 * Bootstraps only the platform-wide registries this console reads/writes
 * (subscription tiers, the Commercial Platform, feature flags) — unlike the
 * dashboard's `TenantProviders`, nothing here is organization-scoped: this
 * console edits plan/pricing/pack/flag definitions that apply across every
 * organization at once.
 */
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { InternalRoleProvider, useInternalRole, INTERNAL_ROLE_LABELS, type InternalRole } from "@/features/platform-admin/internalRole";
import { AccessDenied } from "@/features/platform-admin/AccessDenied";
import { initializeSubscriptionFoundation } from "@/core/platform/subscription";
import { initializeCommercialFoundation } from "@/core/platform/commercial";
import { initializeFeatureFlagsFoundation } from "@/core/platform/featureFlags";

const NAV_ITEMS = [
  { href: "/platform-admin/plans", label: "Subscription Plans" },
  { href: "/platform-admin/credit-packs", label: "AI Credit Packs" },
  { href: "/platform-admin/features", label: "Features & Modules" },
  { href: "/platform-admin/limits", label: "Usage Limits" },
  { href: "/platform-admin/pricing", label: "Pricing Rules" },
  { href: "/platform-admin/promotions", label: "Promotions" },
  { href: "/platform-admin/experiments", label: "Experiments" },
  { href: "/platform-admin/settings", label: "Global Settings" },
];

let bootstrapped = false;

/**
 * Every section reads mutable, module-level registries (`subscriptionRegistry`,
 * `pricingEngine`, `featureFlagRegistry`, ...) directly at render time rather
 * than behind a `useEffect`-populated loading state — so `children` must not
 * mount until this bootstrap effect has actually run. `"use client"` pages
 * are still server-rendered once before hydration, and effects never fire
 * during SSR, so without this gate the very first render would read empty
 * registries and crash. Gating on a `ready` state (not just skipping the
 * init calls) also survives a hot-reload where `bootstrapped` is already
 * `true` from an earlier mount — `ready` still needs to flip on this mount.
 */
function PlatformAdminBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (!bootstrapped) {
        bootstrapped = true;
        initializeSubscriptionFoundation();
        initializeCommercialFoundation();
        initializeFeatureFlagsFoundation();
      }
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-muted-foreground">Loading Plan Management Console…</div>;
  }

  return <>{children}</>;
}

function RoleSwitcher() {
  const { role, setRole } = useInternalRole();

  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      Signed in as
      <select
        value={role}
        onChange={e => setRole(e.target.value as InternalRole)}
        className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm font-semibold text-foreground"
      >
        {Object.entries(INTERNAL_ROLE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

function PlatformAdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 border-b border-border pb-3">
      {NAV_ITEMS.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function ConsoleShell({ children }: { children: ReactNode }) {
  const { isInternalStaff } = useInternalRole();

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Internal Only — Calixo Staff</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">Plan Management Console</h1>
        </div>
        <RoleSwitcher />
      </div>

      {isInternalStaff ? (
        <>
          <PlatformAdminNav />
          <div className="mt-6">{children}</div>
        </>
      ) : (
        <AccessDenied />
      )}
    </div>
  );
}

export default function PlatformAdminLayout({ children }: { children: ReactNode }) {
  return (
    <InternalRoleProvider>
      <PlatformAdminBootstrap>
        <ConsoleShell>{children}</ConsoleShell>
      </PlatformAdminBootstrap>
    </InternalRoleProvider>
  );
}
