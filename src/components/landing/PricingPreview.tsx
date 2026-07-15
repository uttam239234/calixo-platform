import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Container } from "./shared/Container";
import { SectionHeading } from "./shared/SectionHeading";
import { Reveal } from "./shared/Reveal";
import { initializeSubscriptionFoundation, subscriptionRegistry } from "@/core/platform/subscription";
import type { SubscriptionTier } from "@/core/platform/subscription";
import { initializeCommercialFoundation, pricingPlatformAPI } from "@/core/platform/commercial";
import { hydrateFromDisk } from "@/core/platform/configStore/serverHydrate";
import { MODULE_LABELS, FEATURE_GATE_LABELS } from "@/features/settings/billing/constants";

/**
 * Round 21: every figure here — price, period, plan copy driven off real
 * limits — is read live from the same `subscriptionRegistry`/
 * `pricingPlatformAPI` the Internal Plan Management Console writes to and
 * `useBilling.ts` reads for Billing/Upgrade Center, not a hardcoded `plans`
 * array. A Platform Admin changing Enterprise's price shows up here on the
 * next request — `app/(marketing)/page.tsx` opts this route out of static
 * generation (`export const dynamic = "force-dynamic"`) specifically so
 * that's true without a rebuild.
 *
 * Trial is deliberately excluded — it's a temporary evaluation state, not a
 * plan someone buys, matching this section's pre-existing 3-card design.
 */
const DISPLAYED_TIERS: { tier: SubscriptionTier; featured: boolean }[] = [
  { tier: "starter", featured: false },
  { tier: "growth", featured: true },
  { tier: "enterprise", featured: false },
];

function planFeatures(tier: SubscriptionTier): string[] {
  const definition = subscriptionRegistry.get(tier);
  if (!definition) return [];
  const moduleNames = definition.limits.modules.slice(0, 3).map(id => MODULE_LABELS[id] ?? id);
  const gateNames = definition.limits.featureGates.slice(0, 2).map(id => FEATURE_GATE_LABELS[id] ?? id);
  return [...moduleNames, ...gateNames, `${definition.limits.aiCredits.toLocaleString()} AI credits/month`].slice(0, 5);
}

export default async function PricingPreview() {
  initializeSubscriptionFoundation();
  await initializeCommercialFoundation();
  hydrateFromDisk();

  const plans = DISPLAYED_TIERS.map(({ tier, featured }) => {
    const definition = subscriptionRegistry.get(tier);
    const quote = pricingPlatformAPI.quote(tier, "monthly");
    const isQuoteOnly = pricingPlatformAPI.listForTier(tier).some(r => r.model === "quote");
    return {
      tier,
      name: definition?.label ?? tier,
      description: definition?.description ?? "",
      price: isQuoteOnly ? "Custom" : `$${quote.basePrice.toLocaleString()}`,
      period: isQuoteOnly ? "" : "/mo",
      cta: isQuoteOnly ? "Contact Sales" : "Get Started Free",
      href: isQuoteOnly ? "mailto:sales@calixo.io" : "/dashboard",
      featured,
      features: planFeatures(tier),
    };
  });

  return (
    <section id="pricing" className="relative bg-background py-24 lg:py-32 scroll-mt-24">
      <Container>
        <SectionHeading badge="Pricing" title="Simple plans that grow with you." subtitle="No hidden fees. No per-module upsells. Just one platform, priced per user." />

        <div className="mt-16 grid gap-6 lg:grid-cols-3 lg:items-start">
          {plans.map((plan, i) => (
            <Reveal key={plan.tier} delay={i * 0.1}>
              <div
                className={`relative flex h-full flex-col rounded-3xl border p-8 ${
                  plan.featured
                    ? "border-primary/40 bg-card shadow-2xl shadow-primary/10 lg:-translate-y-3"
                    : "border-border bg-card"
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-primary to-[#8B5CF6] px-3.5 py-1.5 text-[11px] font-bold text-white shadow-md">
                    <Sparkles size={11} /> Most Popular
                  </span>
                )}
                <h3 className="text-[18px] font-bold text-foreground">{plan.name}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-[36px] font-bold tracking-tight text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-[13.5px] font-medium text-muted-foreground">{plan.period}</span>}
                </div>

                <Link
                  href={plan.href}
                  className={`mt-6 flex h-11 items-center justify-center rounded-full text-[14px] font-semibold transition-all active:scale-[0.98] ${
                    plan.featured
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90"
                      : "border border-border text-foreground hover:bg-accent"
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="mt-7 flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-[13.5px] text-foreground/80">
                      <Check size={16} className="mt-0.5 flex-shrink-0 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
