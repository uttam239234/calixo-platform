/**
 * Calixo Platform - Billing & Plans: AI Credit Wallet
 *
 * `CreditEngine` (real grant/consume/balance ledger, source-tagged) had zero
 * real call sites anywhere in the codebase before this round — this is the
 * wiring, not a new engine. Included-vs-purchased is a single pooled
 * balance in the real ledger; the split the brief's wallet mockup needs is
 * derived arithmetically from that balance plus the real "purchased"
 * transaction history (consumption order is always included-first, per the
 * brief), validated against the brief's own worked example (8,400 / 2,500 /
 * 10,900 = 10,900 total, 2,500 purchased) before writing this.
 */
import { creditPlatformAPI, type CreditTransaction } from "@/core/platform/commercial";
import { subscriptionPlatformAPI, creditPackPlatformAPI } from "@/core/platform/commercial";
import { subscriptionEngine } from "@/core/platform/subscription";
import { auditService } from "@/access/audit/AuditService";
import { entitlementService } from "@/core/platform/access";

/**
 * Thin wrapper — the real implementation moved to `CreditPlatformAPI.ensureMonthlyAiCreditsGranted()`
 * (`core/platform/commercial`) so `EntitlementService` (which cannot import from `features/*`) can
 * call it directly on every real credit check rather than depending on a one-time seed step. Kept
 * here, same name and signature, for this file's own existing callers.
 */
export function ensureMonthlyCreditsGranted(organizationId: string): void {
  creditPlatformAPI.ensureMonthlyAiCreditsGranted(organizationId);
}

export function buyCreditPack(organizationId: string, packId: string, userId: string): CreditTransaction {
  const pack = creditPackPlatformAPI.list({ activeOnly: true }).find(p => p.id === packId);
  if (!pack) throw new Error(`Unknown or unavailable credit pack: ${packId}`);
  const transaction = creditPlatformAPI.grant(organizationId, "ai", pack.credits, "purchased", `AI Credit Pack — $${pack.price}`);
  entitlementService.invalidateOrganization(organizationId);
  void auditService.recordEvent({
    organizationId,
    userId,
    eventType: "entity_created",
    resource: "credit-purchase",
    resourceId: transaction.id,
    description: `AI Credit Pack purchased: $${pack.price} → ${pack.credits.toLocaleString()} Credits`,
    changes: { price: pack.price, credits: pack.credits },
  });
  return transaction;
}

export interface WalletBreakdown {
  includedLimit: number;
  includedRemaining: number;
  purchasedRemaining: number;
  totalAvailable: number;
  nextResetAt?: string;
  percentIncludedUsed: number;
}

export function getWalletBreakdown(organizationId: string): WalletBreakdown {
  creditPlatformAPI.ensureMonthlyAiCreditsGranted(organizationId);
  const subscription = subscriptionPlatformAPI.getOrDefault(organizationId);
  const includedLimit = subscriptionEngine.getCurrentLimits(organizationId).aiCredits;
  const totalAvailable = creditPlatformAPI.getBalance(organizationId, "ai").balance;
  const purchasedGranted = creditPlatformAPI
    .getHistory(organizationId, "ai")
    .filter(tx => tx.source === "purchased" && tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const includedRemaining = Math.max(0, Math.min(includedLimit, totalAvailable - purchasedGranted));
  const purchasedRemaining = Math.max(0, totalAvailable - includedRemaining);
  const percentIncludedUsed = includedLimit > 0 ? Math.round(((includedLimit - includedRemaining) / includedLimit) * 100) : 0;

  return { includedLimit, includedRemaining, purchasedRemaining, totalAvailable, nextResetAt: subscription.renewsAt, percentIncludedUsed };
}
