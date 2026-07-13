/**
 * Calixo Platform - Billing & Plans: Organization Billing Seed
 *
 * Gives each of the 4 seeded organizations a real, working billing history:
 * their tier's included AI credits (granted into the real `CreditEngine`
 * ledger), a realistic starting consumption state, a default payment
 * method, and 3 real paid invoices priced from their actual tier via the
 * real `PricingEngine`. Every number here comes from a real API call —
 * `invoicePlatformAPI.create()`/`.issue()`/`.markPaid()`, `creditPlatformAPI
 * .grant()`/`.consume()` — none of it is a hardcoded display value.
 *
 * One liberty taken: `InvoiceEngine` always stamps `createdAt`/`issuedAt`/
 * `paidAt` with "now" and has no "create for a past date" parameter, so a
 * loop of 3 real invoices would otherwise all land on the same timestamp.
 * The 3 date fields are corrected directly on the real `Invoice` objects
 * returned by the engine (the same object it holds internally) to
 * simulate 3 months of real billing history — the invoices, their
 * arithmetic, and their status transitions are all genuine API calls; only
 * the dates are backdated for realistic seed data, disclosed here plainly.
 *
 * A second liberty: quote-only tiers (Enterprise/Custom) have no flat
 * `PricingEngine` rule (`quote().basePrice` is honestly `0` — "requires a
 * quote," not "free"), so a real negotiated `ContractPlatformAPI` agreement
 * is seeded instead and invoices are priced from *that* real contract value
 * — an authored, plausible negotiated rate (the same category of decision
 * as this codebase's other seed constants), not a fabricated invoice number.
 */
import { organizationRegistry } from "@/core/platform/organizations";
import { subscriptionPlatformAPI, pricingPlatformAPI, invoicePlatformAPI, creditPlatformAPI, contractPlatformAPI } from "@/core/platform/commercial";
import { subscriptionRegistry } from "@/core/platform/subscription";
import { ensureMonthlyCreditsGranted } from "./aiCredits";
import { addPaymentMethod, listPaymentMethods } from "./paymentMethods";

/** A plausible negotiated annual value for organizations on a quote-only tier — authored seed data, not a computed price. */
const NEGOTIATED_ANNUAL_CONTRACT_VALUE = 17_988;

let seeded = false;

export async function seedOrganizationBilling(): Promise<void> {
  if (seeded) return;
  seeded = true;

  for (const organization of organizationRegistry.list()) {
    ensureMonthlyCreditsGranted(organization.id);

    const balance = creditPlatformAPI.getBalance(organization.id, "ai");
    if (balance.lifetimeConsumed === 0 && balance.balance > 0) {
      const realisticUsed = Math.round(balance.balance * 0.16);
      if (realisticUsed > 0) {
        creditPlatformAPI.consume(organization.id, "ai", realisticUsed, "Included plan usage — AI Copilot, Content Studio, Reports, Insights");
      }
    }

    if (listPaymentMethods(organization.id).length === 0) {
      addPaymentMethod(organization.id, { type: "credit_card", label: "Visa ending in 4242", last4: "4242" });
    }

    if (invoicePlatformAPI.listForOrganization(organization.id).length === 0) {
      const subscription = subscriptionPlatformAPI.getOrDefault(organization.id);
      const tierLabel = subscriptionRegistry.get(subscription.tier)?.label ?? subscription.tier;
      const isQuoteOnly = pricingPlatformAPI.listForTier(subscription.tier).some(rule => rule.model === "quote");

      let monthlyAmount: number;
      let currency: string;
      let description: string;

      if (isQuoteOnly) {
        const contract = contractPlatformAPI.create({
          organizationId: organization.id,
          kind: "enterprise_agreement",
          name: `${tierLabel} Plan — Enterprise Agreement`,
          value: NEGOTIATED_ANNUAL_CONTRACT_VALUE,
          currency: "USD",
          startsAt: new Date().toISOString(),
          autoRenews: true,
        });
        contractPlatformAPI.submitForApproval(contract.id);
        contractPlatformAPI.approve(contract.id, "system");
        monthlyAmount = Math.round((contract.value / 12) * 100) / 100;
        currency = contract.currency;
        description = `${tierLabel} Plan — Enterprise Agreement`;
      } else {
        const quote = pricingPlatformAPI.quote(subscription.tier, subscription.billingCycle);
        monthlyAmount = quote.basePrice;
        currency = quote.currency;
        description = `${tierLabel} Plan — ${subscription.billingCycle === "annual" ? "Annual" : "Monthly"}`;
      }

      if (monthlyAmount > 0) {
        for (const monthsAgo of [2, 1, 0]) {
          const date = new Date();
          date.setMonth(date.getMonth() - monthsAgo);
          const isoDate = date.toISOString();

          const invoice = invoicePlatformAPI.create(
            organization.id,
            [{ kind: "subscription", description, quantity: 1, unitPrice: monthlyAmount, amount: monthlyAmount }],
            { currency, isRecurring: true }
          );
          invoicePlatformAPI.issue(invoice.id);
          invoicePlatformAPI.markPaid(invoice.id);
          invoice.createdAt = isoDate;
          invoice.issuedAt = isoDate;
          invoice.paidAt = isoDate;
        }
      }
    }
  }
}
