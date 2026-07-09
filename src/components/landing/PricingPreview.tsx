import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Container } from "./shared/Container";
import { SectionHeading } from "./shared/SectionHeading";
import { Reveal } from "./shared/Reveal";

const plans = [
  {
    name: "Starter",
    description: "For small teams getting started with unified growth.",
    price: "$49",
    period: "/user / mo",
    cta: "Get Started Free",
    href: "/dashboard",
    featured: false,
    features: ["Dashboard & Analytics", "Up to 2 connected channels", "Core AI Copilot", "Email support"],
  },
  {
    name: "Growth",
    description: "For scaling marketing, sales, and ops teams.",
    price: "$149",
    period: "/user / mo",
    cta: "Get Started Free",
    href: "/dashboard",
    featured: true,
    features: ["Everything in Starter", "Unlimited integrations", "Full AI Copilot & AI Agents", "Workflow automation", "Priority support"],
  },
  {
    name: "Enterprise",
    description: "For organizations that need full control at scale.",
    price: "Custom",
    period: "",
    cta: "Contact Sales",
    href: "mailto:sales@calixo.io",
    featured: false,
    features: ["Everything in Growth", "Multi-tenant & role-based access", "Dedicated success manager", "Custom SLAs & security review", "API & connector platform"],
  },
];

export default function PricingPreview() {
  return (
    <section id="pricing" className="relative bg-background py-24 lg:py-32 scroll-mt-24">
      <Container>
        <SectionHeading badge="Pricing" title="Simple plans that grow with you." subtitle="No hidden fees. No per-module upsells. Just one platform, priced per user." />

        <div className="mt-16 grid gap-6 lg:grid-cols-3 lg:items-start">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.1}>
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
