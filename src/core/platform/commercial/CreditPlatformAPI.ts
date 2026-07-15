/**
 * Calixo Platform - Credit Platform API
 */
import { creditEngine } from "./CreditEngine";
import type { CreditBalance, CreditReservation, CreditSource, CreditTransaction, CreditType } from "./types";

export class CreditPlatformAPI {
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
