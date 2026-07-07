/**
 * Calixo Platform - Payment Platform API
 */
import { paymentEngine } from "./PaymentEngine";
import type { PaymentIntent, PaymentProvider, PaymentProviderId } from "./types";

export class PaymentPlatformAPI {
  registerProvider(provider: PaymentProvider): void {
    paymentEngine.registerProvider(provider);
  }

  listProviders(): PaymentProvider[] {
    return paymentEngine.listProviders();
  }

  charge(providerId: PaymentProviderId, organizationId: string, amount: number, currency: string, invoiceId?: string): Promise<PaymentIntent> {
    return paymentEngine.charge(providerId, organizationId, amount, currency, invoiceId);
  }

  markSucceeded(intentId: string): PaymentIntent {
    return paymentEngine.markSucceeded(intentId);
  }

  markFailed(intentId: string, reason: string): PaymentIntent {
    return paymentEngine.markFailed(intentId, reason);
  }

  get(intentId: string): PaymentIntent | undefined {
    return paymentEngine.get(intentId);
  }

  listForOrganization(organizationId: string): PaymentIntent[] {
    return paymentEngine.listForOrganization(organizationId);
  }
}

export const paymentPlatformAPI = new PaymentPlatformAPI();
