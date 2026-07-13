/**
 * Calixo Platform - Billing & Plans: Payment Methods
 *
 * `PaymentMethod` (a saved card/account on file) doesn't exist as a
 * concept anywhere in the codebase — only `PaymentIntent` (a single charge
 * attempt) and `PaymentProvider` (a gateway abstraction) do. This is new,
 * additive, presentation-layer state, the same shape Round 13's
 * `workspaceVisibility.ts` used for a brief-required concept with no
 * existing backend. Never collects a real card number or CVV — only a
 * label and last 4 digits, matching how a real Stripe-style integration
 * only ever surfaces a token, never a raw PAN.
 */

export type PaymentMethodType = "credit_card" | "debit_card" | "paypal" | "bank_transfer";

export interface PaymentMethod {
  id: string;
  organizationId: string;
  type: PaymentMethodType;
  label: string;
  last4?: string;
  isDefault: boolean;
  addedAt: string;
}

const methodsByOrganization = new Map<string, PaymentMethod[]>();
let counter = 0;

export function listPaymentMethods(organizationId: string): PaymentMethod[] {
  return methodsByOrganization.get(organizationId) ?? [];
}

export function addPaymentMethod(organizationId: string, input: { type: PaymentMethodType; label: string; last4?: string }): PaymentMethod {
  const existing = methodsByOrganization.get(organizationId) ?? [];
  const method: PaymentMethod = {
    id: `pm-${++counter}`,
    organizationId,
    type: input.type,
    label: input.label,
    last4: input.last4,
    isDefault: existing.length === 0,
    addedAt: new Date().toISOString(),
  };
  methodsByOrganization.set(organizationId, [...existing, method]);
  return method;
}

export function removePaymentMethod(organizationId: string, methodId: string): void {
  const remaining = (methodsByOrganization.get(organizationId) ?? []).filter(m => m.id !== methodId);
  if (remaining.length > 0 && !remaining.some(m => m.isDefault)) remaining[0].isDefault = true;
  methodsByOrganization.set(organizationId, remaining);
}

export function setDefaultPaymentMethod(organizationId: string, methodId: string): void {
  const methods = methodsByOrganization.get(organizationId) ?? [];
  for (const method of methods) method.isDefault = method.id === methodId;
  methodsByOrganization.set(organizationId, methods);
}
