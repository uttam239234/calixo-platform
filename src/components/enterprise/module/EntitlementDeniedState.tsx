/**
 * Calixo Platform - Entitlement Denied State
 *
 * Deliberately NOT `"use client"` — a Server Component, so it can be
 * rendered directly from a module `layout.tsx`/`page.tsx` in place of the
 * module's real client Provider tree without shipping that module's client
 * bundle (or the data it would otherwise generate on mount) to the browser
 * at all. `ModuleEmptyState` (the pre-existing client component used
 * elsewhere for RBAC-only denials) takes `onClick` handlers, which can't
 * cross a server->client boundary as props — this uses a plain `<Link>`
 * instead, which needs no client interactivity.
 */
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import type { EntitlementResult } from "@/core/platform/access";

const UPGRADE_REASONS = new Set(["upgrade_required", "limit_reached", "insufficient_credits"]);

function tierLabel(tier?: string): string {
  if (!tier) return "";
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export function EntitlementDeniedState({ moduleLabel, result }: { moduleLabel: string; result: EntitlementResult }) {
  const isUpgrade = UPGRADE_REASONS.has(result.reasonCode);

  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface/60 text-muted-foreground">
        {isUpgrade ? <Sparkles size={28} /> : <Lock size={28} />}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{isUpgrade ? `Upgrade required for ${moduleLabel}` : `You don't have access to ${moduleLabel}`}</h3>
      {result.message && <p className="mt-2 max-w-sm text-sm text-muted-foreground">{result.message}</p>}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {isUpgrade ? (
          <Link href="/dashboard/settings/billing" className="btn btn-primary btn-md">
            {result.upgradeTarget ? `Upgrade to ${tierLabel(result.upgradeTarget)}` : "View plans"}
          </Link>
        ) : null}
        <Link href="/dashboard" className="btn btn-outline btn-md">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
