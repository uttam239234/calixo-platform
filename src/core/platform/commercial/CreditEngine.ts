/**
 * Calixo Platform - Credit Platform
 *
 * A real per-organization, per-credit-type ledger (AI/API/Connector/
 * Marketing) — grant/consume/expire, with full transaction history. Nothing
 * pre-existing to reuse here; Phase 1's `SubscriptionEngine.usage.aiCreditsUsed`
 * is a simple counter against a fixed tier limit, not a ledger with sources,
 * expiration, or multiple credit types — a genuinely different, richer
 * concept this phase adds.
 */
import { generateId } from "@/shared/utils/string";
import { platformEventBus } from "@/core/platform/events/PlatformEventBus";
import type { CreditBalance, CreditSource, CreditTransaction, CreditType } from "./types";

export class CreditEngine {
  private balances = new Map<string, CreditBalance>();
  private transactions: CreditTransaction[] = [];
  private expiredTxIds = new Set<string>();

  private key(organizationId: string, creditType: CreditType): string {
    return `${organizationId}:${creditType}`;
  }

  private getOrCreateBalance(organizationId: string, creditType: CreditType): CreditBalance {
    const key = this.key(organizationId, creditType);
    let balance = this.balances.get(key);
    if (!balance) {
      balance = { organizationId, creditType, balance: 0, lifetimeGranted: 0, lifetimeConsumed: 0 };
      this.balances.set(key, balance);
    }
    return balance;
  }

  grant(organizationId: string, creditType: CreditType, amount: number, source: CreditSource, reason: string, expiresAt?: string): CreditTransaction {
    const balance = this.getOrCreateBalance(organizationId, creditType);
    balance.balance += amount;
    balance.lifetimeGranted += amount;
    const tx: CreditTransaction = { id: generateId(16), organizationId, creditType, source, amount, balanceAfter: balance.balance, reason, expiresAt, createdAt: new Date().toISOString() };
    this.transactions.push(tx);
    void platformEventBus.publish({ type: "CreditAdded", organizationId, payload: { creditType, amount, balance: balance.balance, source } });
    return tx;
  }

  /** Throws on insufficient balance — callers wanting a non-throwing pre-check should call `getBalance()` first (this is exactly what `EntitlementEngine.canUse()` does before calling this). */
  consume(organizationId: string, creditType: CreditType, amount: number, reason: string): CreditTransaction {
    const balance = this.getOrCreateBalance(organizationId, creditType);
    if (balance.balance < amount) throw new Error(`Insufficient ${creditType} credits: requested ${amount}, balance ${balance.balance}`);
    balance.balance -= amount;
    balance.lifetimeConsumed += amount;
    const tx: CreditTransaction = { id: generateId(16), organizationId, creditType, source: "plan_allowance", amount: -amount, balanceAfter: balance.balance, reason, createdAt: new Date().toISOString() };
    this.transactions.push(tx);
    void platformEventBus.publish({ type: "CreditConsumed", organizationId, payload: { creditType, amount, balance: balance.balance } });
    return tx;
  }

  getBalance(organizationId: string, creditType: CreditType): CreditBalance {
    return { ...this.getOrCreateBalance(organizationId, creditType) };
  }

  getAllBalances(organizationId: string): CreditBalance[] {
    return Array.from(this.balances.values()).filter(b => b.organizationId === organizationId);
  }

  getHistory(organizationId: string, creditType?: CreditType): CreditTransaction[] {
    return this.transactions.filter(t => t.organizationId === organizationId && (!creditType || t.creditType === creditType));
  }

  /** Deducts any grant whose `expiresAt` has passed and hasn't already been expired — called by the Commercial Platform's recurring tick, not evaluated per-request. Returns the total amount expired this pass. */
  expireLapsed(): number {
    const now = new Date().toISOString();
    let totalExpired = 0;
    for (const tx of this.transactions) {
      if (tx.amount > 0 && tx.expiresAt && tx.expiresAt <= now && !this.expiredTxIds.has(tx.id)) {
        this.expiredTxIds.add(tx.id);
        const balance = this.getOrCreateBalance(tx.organizationId, tx.creditType);
        const deduction = Math.min(balance.balance, tx.amount);
        if (deduction > 0) {
          balance.balance -= deduction;
          totalExpired += deduction;
          this.transactions.push({ id: generateId(16), organizationId: tx.organizationId, creditType: tx.creditType, source: tx.source, amount: -deduction, balanceAfter: balance.balance, reason: `Expired credit grant ${tx.id}`, createdAt: now });
        }
      }
    }
    return totalExpired;
  }

  count(): number {
    return this.transactions.length;
  }
}

export const creditEngine = new CreditEngine();
