import { ShieldCheck, Building2, KeyRound, ClipboardList, Code2, Plug, Cog, Activity, CreditCard, Layers } from "lucide-react";
import { Container } from "./shared/Container";
import { SectionHeading } from "./shared/SectionHeading";
import { Reveal } from "./shared/Reveal";

const capabilities = [
  { icon: ShieldCheck, title: "Enterprise-Grade Security", description: "Encryption everywhere and continuous monitoring keep your data protected." },
  { icon: Building2, title: "Built for Multiple Teams", description: "Run every brand, business unit, or client workspace separately, from one account." },
  { icon: KeyRound, title: "Granular Roles & Permissions", description: "Give every person exactly the access they need — nothing more, nothing less." },
  { icon: ClipboardList, title: "Full Audit Trail", description: "Every action is logged and traceable, so you're always ready for review." },
  { icon: Code2, title: "Open API Platform", description: "Extend Calixo and connect it to any system already in your stack." },
  { icon: Plug, title: "100+ Native Connectors", description: "Pre-built integrations that keep every tool in sync automatically." },
  { icon: Cog, title: "Reliable Automation Engine", description: "Mission-critical workflows that run on time, every time, at any scale." },
  { icon: Activity, title: "Real-Time Observability", description: "Full visibility into system health, performance, and data pipelines." },
  { icon: CreditCard, title: "Flexible Billing & Plans", description: "Usage-based or seat-based — pricing that scales the way you do." },
  { icon: Layers, title: "Architecture That Scales", description: "From 10 to 10,000 employees, the same platform grows with you." },
];

const trustSignals = ["SOC 2-aligned controls", "GDPR ready", "99.9% uptime SLA", "Single sign-on (SSO)"];

export default function EnterpriseCapabilities() {
  return (
    <section id="enterprise" className="relative bg-surface/40 py-24 lg:py-32 scroll-mt-24">
      <Container>
        <SectionHeading
          badge="Enterprise Ready"
          title="Built to meet enterprise standards from day one."
          subtitle="Security, governance, and scale aren't an afterthought — they're built into the foundation of the platform."
        />

        <Reveal delay={0.08}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {trustSignals.map((signal) => (
              <span key={signal} className="text-[13px] font-semibold text-muted-foreground">
                {signal}
              </span>
            ))}
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {capabilities.map((cap, i) => (
            <Reveal key={cap.title} delay={(i % 5) * 0.05}>
              <div className="h-full rounded-2xl border border-border bg-card p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <cap.icon size={18} />
                </div>
                <h3 className="mt-3.5 text-[14.5px] font-semibold text-foreground">{cap.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{cap.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
