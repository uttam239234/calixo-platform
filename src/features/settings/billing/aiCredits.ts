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

function currentPeriodStart(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Idempotent — grants the tier's included AI credits once per billing period, expiring at the subscription's real renewal date so unused included credits genuinely lapse via `CreditEngine.expireLapsed()`. */
export function ensureMonthlyCreditsGranted(organizationId: string): void {
  const subscription = subscriptionPlatformAPI.getOrDefault(organizationId);
  const periodStart = currentPeriodStart();
  const alreadyGranted = creditPlatformAPI
    .getHistory(organizationId, "ai")
    .some(tx => tx.source === "plan_allowance" && tx.amount > 0 && tx.createdAt >= periodStart);
  if (alreadyGranted) return;
  creditPlatformAPI.grant(organizationId, "ai", subscription.limits.aiCredits, "plan_allowance", "Monthly plan allowance", subscription.renewsAt);
}

export function buyCreditPack(organizationId: string, packId: string): CreditTransaction {
  const pack = creditPackPlatformAPI.list({ activeOnly: true }).find(p => p.id === packId);
  if (!pack) throw new Error(`Unknown or unavailable credit pack: ${packId}`);
  return creditPlatformAPI.grant(organizationId, "ai", pack.credits, "purchased", `AI Credit Pack — $${pack.price}`);
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
  const subscription = subscriptionPlatformAPI.getOrDefault(organizationId);
  const includedLimit = subscription.limits.aiCredits;
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
