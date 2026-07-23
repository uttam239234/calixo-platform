/**
 * Calixo Platform - Credit Platform API
 *
 * `ensureMonthlyAiCreditsGranted()` was found, during a production-incident
 * investigation, to be the actual root cause of "Generate produces nothing"
 * across Content Studio (and every other AI-credit-gated module): the real
 * grant logic existed (`features/settings/billing/aiCredits.ts`'s
 * `ensureMonthlyCreditsGranted`) but its only caller,
 * `seedOrganizationBilling()`, was itself never invoked anywhere — so every
 * organization's real `CreditEngine` "ai" balance sat at 0 forever, and
 * every `reserveAiCredits()` call failed with "Out of AI credits" on the
 * very first real request. Moved here (the logic had zero actual
 * dependency on anything feature-layer) so `EntitlementService` — which
 * lives in `core/platform/access` and must not import from `features/*` —
 * can call it directly, lazily, on every real credit check/reservation
 * rather than depending on a one-time seed step that may never run.
 */
import { creditEngine } from "./CreditEngine";
import type { CreditBalance, CreditReservation, CreditSource, CreditTransaction, CreditType } from "./types";
import { subscriptionEngine } from "@/core/platform/subscription";
import { subscriptionPlatformAPI } from "./SubscriptionPlatformAPI";

function currentPeriodStart(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export class CreditPlatformAPI {
  /** Idempotent — grants the organization's current plan's included AI credits once per billing period (checked against real grant history, not a flag), expiring at the subscription's real renewal date. Safe and cheap to call on every AI credit check; does nothing if already granted this period. */
  ensureMonthlyAiCreditsGranted(organizationId: string): void {
    const subscription = subscriptionPlatformAPI.getOrDefault(organizationId);
    const periodStart = currentPeriodStart();
    const alreadyGranted = creditEngine
      .getHistory(organizationId, "ai")
      .some(tx => tx.source === "plan_allowance" && tx.amount > 0 && tx.createdAt >= periodStart);
    if (alreadyGranted) return;
    const aiCredits = subscriptionEngine.getCurrentLimits(organizationId).aiCredits;
    creditEngine.grant(organizationId, "ai", aiCredits, "plan_allowance", "Monthly plan allowance", subscription.renewsAt);
  }

  grant(organizationId: string, creditType: CreditType, amount: number, source: CreditSource, reason: string, expiresAt?: string): CreditTransaction {
    return creditEngine.grant(organizationId, creditType, amount, source, reason, expiresAt);
  }

  consume(organizationId: string, creditType: CreditType, amount: number, reason: string): CreditTransaction {
    return creditEngine.consume(organizationId, creditType, amount, reason);
  }

  reserve(organizationId: string, creditType: CreditType, amount: number, reason: string): CreditReservation {
    return creditEngine.reserve(organizationId, creditType, amount, reason);
  }

  commitReservation(reservationId: string, actualAmount?: number): CreditTransaction {
    return creditEngine.commitReservation(reservationId, actualAmount);
  }

  releaseReservation(reservationId: string): void {
    return creditEngine.releaseReservation(reservationId);
  }

  getBalance(organizationId: string, creditType: CreditType): CreditBalance {
    return creditEngine.getBalance(organizationId, creditType);
  }

  getAllBalances(organizationId: string): CreditBalance[] {
    return creditEngine.getAllBalances(organizationId);
  }

  getHistory(organizationId: string, creditType?: CreditType): CreditTransaction[] {
    return creditEngine.getHistory(organizationId, creditType);
  }

  expireLapsed(): number {
    return creditEngine.expireLapsed();
  }
}

export const creditPlatformAPI = new CreditPlatformAPI();
