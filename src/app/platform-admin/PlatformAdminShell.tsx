"use client";

/**
 * Calixo Platform - Internal Plan Management Console: Client Shell
 *
 * The console's nav/bootstrap/role-badge UI — moved out of `layout.tsx`
 * (now a Server Component doing the real access gate) into its own client
 * component. `ConsoleShell`'s own `useInternalRole()` check below is a
 * SECOND, redundant-by-design layer: the real gate already ran server-side
 * in `layout.tsx` before this ever mounts, but keeping a reactive client
 * check too means a role change mid-session (e.g. org membership revoked
 * while a tab is open) still hides the console without a hard reload.
 */
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useInternalRole, INTERNAL_ROLE_LABELS } from "@/features/platform-admin/internalRole";
import { AccessDenied } from "@/features/platform-admin/AccessDenied";
import { initializeSubscriptionFoundation } from "@/core/platform/subscription";
import { initializeCommercialFoundation } from "@/core/platform/commercial";
import { initializeFeatureFlagsFoundation } from "@/core/platform/featureFlags";
import { hydrateFromServerAction } from "@/core/platform/configStore/clientHydrate";

const NAV_ITEMS = [
  { href: "/platform-admin/plans", label: "Subscription Plans" },
  { href: "/platform-admin/credit-packs", label: "AI Credit Packs" },
  { href: "/platform-admin/features", label: "Features & Modules" },
  { href: "/platform-admin/limits", label: "Usage Limits" },
  { href: "/platform-admin/pricing", label: "Pricing Rules" },
  { href: "/platform-admin/promotions", label: "Promotions" },
  { href: "/platform-admin/experiments", label: "Experiments" },
  { href: "/platform-admin/settings", label: "Global Settings" },
  { href: "/platform-admin/secrets", label: "Platform Secrets" },
  { href: "/platform-admin/health", label: "Platform Health" },
  { href: "/platform-admin/diagnostics", label: "Access Diagnostics" },
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
 *
 * `hydrateFromServerAction()` (Round 20) runs every mount, after the
 * hardcoded defaults, applying any disk-persisted Platform Admin overrides
 * on top — this console's own client-side registry copy needs the same
 * persisted truth `resolveCalixoIdentity()` already applies for the
 * customer-facing dashboard, and `/platform-admin` never goes through that
 * path (no `DashboardTenantProviders`/`useCalixoIdentity()` here).
 */
function PlatformAdminBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (!bootstrapped) {
        bootstrapped = true;
        initializeSubscriptionFoundation();
        await initializeCommercialFoundation();
        initializeFeatureFlagsFoundation();
      }
      await hydrateFromServerAction();
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-muted-foreground">Loading Plan Management Console…</div>;
  }

  return <>{children}</>;
}

/** Read-only — real Clerk identity (bootstrap allowlist or organization membership) decides this now, there is nothing left to switch. */
function RoleBadge() {
  const { role } = useInternalRole();

  return (
    <span className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm font-semibold text-foreground">
      Signed in as {INTERNAL_ROLE_LABELS[role]}
    </span>
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
  const { hasPlatformAdminAccess, loaded } = useInternalRole();

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Internal Only — Calixo Staff</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">Plan Management Console</h1>
        </div>
        {loaded && <RoleBadge />}
      </div>

      {!loaded ? (
        <p className="text-sm text-muted-foreground">Checking access…</p>
      ) : hasPlatformAdminAccess ? (
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

export function PlatformAdminShell({ children }: { children: ReactNode }) {
  return (
    <PlatformAdminBootstrap>
      <ConsoleShell>{children}</ConsoleShell>
    </PlatformAdminBootstrap>
  );
}
