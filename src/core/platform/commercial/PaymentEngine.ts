/**
 * Calixo Platform - Payment Platform (provider abstraction)
 *
 * "manual"/"bank_transfer"/"enterprise_procurement" have real (if simple —
 * they just record a pending intent for a human to reconcile, which is
 * genuinely how offline payments work) implementations. "stripe"/
 * "razorpay"/"paypal" are honestly readiness-only: declared, routable
 * through the same `charge()` interface, and swappable for a real SDK
 * integration later — the platform never imports a gateway SDK directly,
 * per the mandate's explicit "never couple to one payment gateway."
 */
import { generateId } from "@/shared/utils/string";
import { platformEventBus } from "@/core/platform/events/PlatformEventBus";
import { invoiceEngine } from "./InvoiceEngine";
import type { PaymentIntent, PaymentProvider, PaymentProviderId } from "./types";

function offlineProvider(id: PaymentProviderId): PaymentProvider {
  return {
    id,
    isReal: true,
    async charge(params) {
      return {
        id: generateId(16),
        organizationId: params.organizationId,
        invoiceId: params.invoiceId,
        provider: id,
        amount: params.amount,
        currency: params.currency,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
    },
  };
}

function readinessProvider(id: PaymentProviderId): PaymentProvider {
  return {
    id,
    isReal: false,
    async charge() {
      throw new Error(`Payment provider "${id}" is readiness-only — no gateway SDK is integrated yet. Use "manual"/"bank_transfer"/"enterprise_procurement", or complete a real integration via PaymentEngine.registerProvider().`);
    },
  };
}

export class PaymentEngine {
  private providers = new Map<PaymentProviderId, PaymentProvider>();
  private intents: PaymentIntent[] = [];

  constructor() {
    this.registerProvider(offlineProvider("manual"));
    this.registerProvider(offlineProvider("bank_transfer"));
    this.registerProvider(offlineProvider("enterprise_procurement"));
    this.registerProvider(readinessProvider("stripe"));
    this.registerProvider(readinessProvider("razorpay"));
    this.registerProvider(readinessProvider("paypal"));
  }

  registerProvider(provider: PaymentProvider): void {
    this.providers.set(provider.id, provider);
  }

  getProvider(id: PaymentProviderId): PaymentProvider | undefined {
    return this.providers.get(id);
  }

  listProviders(): PaymentProvider[] {
    return Array.from(this.providers.values());
  }

  async charge(providerId: PaymentProviderId, organizationId: string, amount: number, currency: string, invoiceId?: string): Promise<PaymentIntent> {
    const provider = this.providers.get(providerId);
    if (!provider) throw new Error(`Unknown payment provider: ${providerId}`);
    const intent = await provider.charge({ organizationId, amount, currency, invoiceId });
    this.intents.push(intent);
    return intent;
  }

  markSucceeded(intentId: string): PaymentIntent {
    const intent = this.mustGet(intentId);
    intent.status = "succeeded";
    intent.completedAt = new Date().toISOString();
    if (intent.invoiceId) invoiceEngine.markPaid(intent.invoiceId);
    void platformEventBus.publish({ type: "PaymentReceived", organizationId: intent.organizationId, payload: { intentId, amount: intent.amount, provider: intent.provider } });
    return intent;
  }

  markFailed(intentId: string, reason: string): PaymentIntent {
    const intent = this.mustGet(intentId);
    intent.status = "failed";
    intent.failureReason = reason;
    intent.completedAt = new Date().toISOString();
    void platformEventBus.publish({ type: "PaymentFailed", organizationId: intent.organizationId, payload: { intentId, reason } });
    return intent;
  }

  get(intentId: string): PaymentIntent | undefined {
    return this.intents.find(i => i.id === intentId);
  }

  listForOrganization(organizationId: string): PaymentIntent[] {
    return this.intents.filter(i => i.organizationId === organizationId);
  }

  private mustGet(id: string): PaymentIntent {
    const intent = this.intents.find(i => i.id === id);
    if (!intent) throw new Error(`Payment intent not found: ${id}`);
    return intent;
  }

  count(): number {
    return this.intents.length;
  }
}

export const paymentEngine = new PaymentEngine();
