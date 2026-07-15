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
import type { CreditBalance, CreditReservation, CreditSource, CreditTransaction, CreditType } from "./types";

export class CreditEngine {
  private balances = new Map<string, CreditBalance>();
  private transactions: CreditTransaction[] = [];
  private expiredTxIds = new Set<string>();
  private reservations = new Map<string, CreditReservation>();

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

  /**
   * Two-phase hold: debits `amount` from the balance immediately (so a
   * second concurrent request can't also pass a balance check against
   * credits this request already claimed) and records a `"reserved"`
   * transaction. Throws on insufficient balance — same non-throwing
   * pre-check contract as `consume()` (`getBalance()` first).
   */
  reserve(organizationId: string, creditType: CreditType, amount: number, reason: string): CreditReservation {
    const balance = this.getOrCreateBalance(organizationId, creditType);
    if (balance.balance < amount) throw new Error(`Insufficient ${creditType} credits: requested ${amount}, balance ${balance.balance}`);
    balance.balance -= amount;
    const reservation: CreditReservation = { id: generateId(16), organizationId, creditType, amount, reason, status: "reserved", createdAt: new Date().toISOString() };
    this.reservations.set(reservation.id, reservation);
    this.transactions.push({ id: generateId(16), organizationId, creditType, source: "plan_allowance", amount: -amount, balanceAfter: balance.balance, reason: `Reserved: ${reason}`, createdAt: reservation.createdAt });
    return { ...reservation };
  }

  /** Finalizes a reservation at the real, post-execution cost (defaults to the full reserved amount). Any unused portion (`reserved - actualAmount`) is refunded back to the balance. Records the actual consumption as `lifetimeConsumed` and publishes `CreditConsumed`. */
  commitReservation(reservationId: string, actualAmount?: number): CreditTransaction {
    const reservation = this.mustGetReservation(reservationId);
    const finalAmount = Math.min(actualAmount ?? reservation.amount, reservation.amount);
    const refund = reservation.amount - finalAmount;
    const balance = this.getOrCreateBalance(reservation.organizationId, reservation.creditType);

    if (refund > 0) balance.balance += refund;
    balance.lifetimeConsumed += finalAmount;
    reservation.status = "committed";
    reservation.resolvedAt = new Date().toISOString();

    const tx: CreditTransaction = { id: generateId(16), organizationId: reservation.organizationId, creditType: reservation.creditType, source: "plan_allowance", amount: -finalAmount, balanceAfter: balance.balance, reason: reservation.reason, createdAt: reservation.resolvedAt };
    this.transactions.push(tx);
    void platformEventBus.publish({ type: "CreditConsumed", organizationId: reservation.organizationId, payload: { creditType: reservation.creditType, amount: finalAmount, balance: balance.balance } });
    return tx;
  }

  /** Cancels a reservation without ever consuming it (the reserved action failed/was aborted) — fully refunds the held amount back to the balance. */
  releaseReservation(reservationId: string): void {
    const reservation = this.mustGetReservation(reservationId);
    const balance = this.getOrCreateBalance(reservation.organizationId, reservation.creditType);
    balance.balance += reservation.amount;
    reservation.status = "released";
    reservation.resolvedAt = new Date().toISOString();
    this.transactions.push({ id: generateId(16), organizationId: reservation.organizationId, creditType: reservation.creditType, source: "plan_allowance", amount: reservation.amount, balanceAfter: balance.balance, reason: `Released: ${reservation.reason}`, createdAt: reservation.resolvedAt });
  }

  private mustGetReservation(reservationId: string): CreditReservation {
    const reservation = this.reservations.get(reservationId);
    if (!reservation) throw new Error(`Credit reservation ${reservationId} not found`);
    if (reservation.status !== "reserved") throw new Error(`Credit reservation ${reservationId} already ${reservation.status}`);
    return reservation;
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
