/**
 * Calixo Platform - Enterprise Commercial, Billing, Licensing & Subscription
 * Platform Types
 *
 * This is the ninth major `core/platform` subpackage — the commercial
 * backbone. Phase 1 already built a real `SubscriptionEngine` (tier
 * assignment, a fixed 6-key limit/usage system, feature gates, module
 * unlocks) — reused and additively extended (billing cycle, pause/cancel/
 * renew lifecycle, more tiers), not rebuilt. What Phase 1's `Subscription`
 * couldn't support — an open, module-registrable set of usage types (API
 * calls, executions, connector syncs, emails, ...) — is what this package
 * adds: `UsageMeteringEngine`/`QuotaEngine` generalize the same "count
 * against a limit" idea into a registry-driven system, and
 * `EntitlementEngine` is the one facade every module calls so nothing
 * outside this package ever compares a tier name or hardcodes a limit.
 */
import type { SubscriptionTier } from "@/core/platform/subscription/types";

// ============================================================================
// Usage Metering Platform (mandate section 5) — open, registrable usage types
// ============================================================================

export type UsagePeriod = "daily" | "weekly" | "monthly" | "annual" | "lifetime";

export interface UsageTypeDefinition {
  id: string;
  name: string;
  description: string;
  unit: string;
  category: "core" | "ai" | "connector" | "api" | "execution" | "communication" | "content" | "crm";
  owner: string;
}

export interface UsageRecord {
  id: string;
  usageTypeId: string;
  organizationId: string;
  workspaceId?: string;
  userId?: string;
  quantity: number;
  recordedAt: string;
  metadata?: Record<string, unknown>;
}

export interface UsageSummary {
  usageTypeId: string;
  organizationId: string;
  period: UsagePeriod;
  periodStart: string;
  total: number;
}

// ============================================================================
// Quota Platform (mandate section 6)
// ============================================================================

export type QuotaScope = "organization" | "workspace" | "user";
export type QuotaKind = "hard" | "soft";

export interface QuotaDefinition {
  id: string;
  usageTypeId: string;
  scope: QuotaScope;
  kind: QuotaKind;
  limit: number;
  period: UsagePeriod;
  warningThresholdPercent: number;
  graceUsagePercent: number;
  tier?: SubscriptionTier;
}

export interface QuotaCheckResult {
  allowed: boolean;
  quota?: QuotaDefinition;
  used: number;
  requested: number;
  remaining: number;
  isWarning: boolean;
  reason?: string;
}

// ============================================================================
// Credit Platform (mandate section 7)
// ============================================================================

export type CreditType = "ai" | "api" | "connector" | "marketing";
export type CreditSource = "trial" | "purchased" | "bonus" | "promotional" | "plan_allowance";

export interface CreditTransaction {
  id: string;
  organizationId: string;
  creditType: CreditType;
  source: CreditSource;
  amount: number;
  balanceAfter: number;
  reason: string;
  expiresAt?: string;
  createdAt: string;
}

export interface CreditBalance {
  organizationId: string;
  creditType: CreditType;
  balance: number;
  lifetimeGranted: number;
  lifetimeConsumed: number;
}

// ============================================================================
// Licensing Platform (mandate section 3)
// ============================================================================

export type LicenseKind = "organization" | "workspace" | "named_user" | "enterprise" | "developer" | "api" | "connector" | "ai" | "add_on";
export type LicenseStatus = "active" | "suspended" | "revoked" | "expired";

export interface LicenseDefinition {
  id: string;
  kind: LicenseKind;
  organizationId: string;
  workspaceId?: string;
  userId?: string;
  name: string;
  status: LicenseStatus;
  seats?: number;
  seatsAssigned: number;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Entitlement Platform (mandate section 4) — the ONLY source of truth
// ============================================================================

export type EntitlementAction = "use" | "create" | "execute" | "access";

export interface EntitlementDecision {
  allowed: boolean;
  reason?: string;
  limit?: number;
  used?: number;
  remaining?: number;
  source: "subscription_limit" | "quota" | "credit" | "feature_gate" | "module" | "license" | "unrestricted";
}

// ============================================================================
// Pricing Platform (mandate section 8)
// ============================================================================

export type PricingModel = "flat" | "usage" | "hybrid" | "quote";

export interface PricingRuleDefinition {
  id: string;
  tier: SubscriptionTier;
  model: PricingModel;
  monthlyPrice?: number;
  annualPrice?: number;
  usageTypeId?: string;
  usageUnitPrice?: number;
  currency: string;
  isEducationDiscount?: boolean;
}

export interface PriceQuote {
  tier: SubscriptionTier;
  billingCycle: "monthly" | "annual";
  currency: string;
  basePrice: number;
  usageCharges: { usageTypeId: string; quantity: number; unitPrice: number; subtotal: number }[];
  discountAmount: number;
  totalPrice: number;
}

// ============================================================================
// Add-On Platform (mandate section 9)
// ============================================================================

export interface AddOnDefinition {
  id: string;
  name: string;
  description: string;
  usageTypeId?: string;
  additionalLimit?: number;
  monthlyPrice: number;
  annualPrice: number;
}

export interface AddOnSubscription {
  id: string;
  organizationId: string;
  addOnId: string;
  quantity: number;
  activatedAt: string;
}

// ============================================================================
// Invoice Platform (mandate section 10)
// ============================================================================

export type InvoiceStatus = "draft" | "issued" | "paid" | "overdue" | "void" | "refunded";
export type InvoiceLineKind = "subscription" | "usage" | "add_on" | "tax" | "discount";

export interface InvoiceLineItem {
  kind: InvoiceLineKind;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  organizationId: string;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxAmount: number;
  taxLabel?: string;
  discountAmount: number;
  total: number;
  currency: string;
  issuedAt?: string;
  dueAt?: string;
  paidAt?: string;
  isManual: boolean;
  isRecurring: boolean;
  createdAt: string;
}

export interface CreditNote {
  id: string;
  invoiceId: string;
  amount: number;
  reason: string;
  issuedAt: string;
}

export interface Refund {
  id: string;
  invoiceId: string;
  amount: number;
  reason: string;
  status: "pending" | "completed" | "failed";
  requestedAt: string;
}

// ============================================================================
// Payment Platform (mandate section 11) — provider abstraction
// ============================================================================

export type PaymentProviderId = "stripe" | "razorpay" | "paypal" | "bank_transfer" | "enterprise_procurement" | "manual";
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export interface PaymentIntent {
  id: string;
  organizationId: string;
  invoiceId?: string;
  provider: PaymentProviderId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  externalReference?: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
}

/** Every concrete gateway (Stripe/Razorpay/PayPal/...) implements this — the platform never imports a gateway SDK directly. */
export interface PaymentProvider {
  id: PaymentProviderId;
  isReal: boolean;
  charge(params: { organizationId: string; amount: number; currency: string; invoiceId?: string }): Promise<PaymentIntent>;
}

// ============================================================================
// Promotion Platform (mandate section 12)
// ============================================================================

export type PromotionKind = "coupon" | "discount_code" | "referral" | "campaign_offer" | "seasonal" | "partner" | "education";
export type DiscountKind = "percent" | "fixed";

export interface PromotionDefinition {
  id: string;
  code: string;
  kind: PromotionKind;
  discountKind: DiscountKind;
  discountValue: number;
  maxRedemptions?: number;
  redemptionCount: number;
  validFrom: string;
  validUntil?: string;
  applicableTiers?: SubscriptionTier[];
  isActive: boolean;
}

export interface PromotionRedemption {
  id: string;
  promotionId: string;
  organizationId: string;
  discountApplied: number;
  redeemedAt: string;
}

// ============================================================================
// Contract Platform (mandate section 13)
// ============================================================================

export type ContractStatus = "draft" | "pending_approval" | "active" | "expired" | "terminated";
export type ContractKind = "enterprise_agreement" | "purchase_order" | "custom_contract" | "renewal";

export interface ContractDefinition {
  id: string;
  organizationId: string;
  kind: ContractKind;
  status: ContractStatus;
  name: string;
  value: number;
  currency: string;
  startsAt: string;
  endsAt?: string;
  autoRenews: boolean;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Commercial Policies (mandate section 14) — declarative, evaluated by the
// relevant engine (Subscription/Quota/Credit) rather than a separate policy
// interpreter; this is the shared shape they're registered under.
// ============================================================================

export type CommercialPolicyKind = "trial" | "upgrade" | "downgrade" | "renewal" | "cancellation" | "refund" | "credit" | "quota" | "grace_period";

export interface CommercialPolicyDefinition {
  id: string;
  kind: CommercialPolicyKind;
  name: string;
  description: string;
  config: Record<string, unknown>;
  isActive: boolean;
}

// ============================================================================
// Commercial Context — passed through cross-module wiring
// ============================================================================

export interface CommercialContext {
  organizationId: string;
  workspaceId?: string;
  userId?: string;
}
